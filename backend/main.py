from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from engine.stockfish_engine import get_engine
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


@app.post("/api/game/move")
async def make_move(req: MoveRequest, db: Session = Depends(get_db)):
    engine = get_engine()
    try:
        eval_before = engine.evaluate_position(req.fen)
        best_move = engine.get_best_move(req.fen)
        if not best_move:
            raise HTTPException(status_code=400, detail="No legal moves available")

        if req.game_id:
            move_record = Move(
                game_id=req.game_id,
                fen_before=req.fen,
                move_uci=best_move,
                eval_diff=0.0,
                classification="good",
            )
            db.add(move_record)
            db.commit()

        return {
            "move": best_move,
            "evaluation": eval_before,
            "classification": "good",
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
