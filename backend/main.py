from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
import chess

from engine.stockfish_engine import get_engine
from engine.adaptive_engine import get_adaptive_move
from analysis.move_analyzer import analyze_user_move
from profiling.weakness_profiler import get_player_stats, get_dominant_weakness
from database.db import get_db, init_db
from models.game import Game, Move

app = FastAPI(title="AI Chess Opponent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


class MoveRequest(BaseModel):
    fen: str
    player_id: str = "player_1"
    game_id: Optional[int] = None
    user_move_uci: Optional[str] = None


class StartGameRequest(BaseModel):
    player_id: str = "player_1"


class EndGameRequest(BaseModel):
    game_id: int
    pgn: str
    result: str


@app.get("/")
async def root():
    return {"message": "AI Chess Opponent API", "status": "running"}


@app.get("/health")
async def health():
    engine = get_engine()
    return {"status": "ok", "stockfish": engine._path or "not found"}


@app.post("/api/game/start")
async def start_game(req: StartGameRequest, db: Session = Depends(get_db)):
    game = Game(player_id=req.player_id)
    db.add(game)
    db.commit()
    db.refresh(game)
    return {"game_id": game.id, "player_id": req.player_id, "message": "Game started"}


@app.post("/api/game/end")
async def end_game(req: EndGameRequest, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == req.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    game.pgn = req.pgn
    game.result = req.result
    db.commit()
    return {"message": "Game recorded", "game_id": req.game_id, "result": req.result}


def _random_legal_move(fen: str) -> Optional[str]:
    """Fallback when Stockfish is unavailable — picks a random legal move."""
    import random
    board = chess.Board(fen)
    moves = list(board.legal_moves)
    if not moves:
        return None
    return random.choice(moves).uci()


@app.post("/api/game/move")
async def make_move(req: MoveRequest, db: Session = Depends(get_db)):
    engine = get_engine()
    stockfish_ok = engine._path is not None

    classification = "good"
    eval_diff = 0.0
    phase = "middlegame"
    eval_now = 0

    if req.user_move_uci:
        try:
            if stockfish_ok:
                classification, eval_diff, phase = analyze_user_move(
                    engine, req.fen, req.user_move_uci
                )
        except Exception:
            pass

    if req.game_id and req.user_move_uci:
        board = chess.Board(req.fen)
        move_num = board.fullmove_number
        move_record = Move(
            game_id=req.game_id,
            fen_before=req.fen,
            move_uci=req.user_move_uci,
            eval_diff=eval_diff,
            classification=classification,
            phase=phase,
            move_number=move_num,
        )
        db.add(move_record)
        db.commit()

    try:
        if stockfish_ok:
            eval_now = engine.evaluate_position(req.fen)
            weakness = get_dominant_weakness(db, req.player_id)
            best_move = get_adaptive_move(engine, req.fen, weakness)
        else:
            best_move = _random_legal_move(req.fen)
    except Exception:
        best_move = _random_legal_move(req.fen)

    if not best_move:
        raise HTTPException(status_code=400, detail="No legal moves available")

    return {
        "move": best_move,
        "evaluation": eval_now,
        "classification": classification,
        "eval_diff": eval_diff,
        "phase": phase,
        "stockfish_active": stockfish_ok,
    }


@app.patch("/api/game/{game_id}/result")
async def update_game_result(game_id: int, result: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    game.result = result
    db.commit()
    return {"game_id": game_id, "result": result}


@app.get("/api/profile/{player_id}")
async def get_profile(player_id: str, db: Session = Depends(get_db)):
    return get_player_stats(db, player_id)
