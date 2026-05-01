from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from engine.stockfish_engine import get_engine

app = FastAPI(title="AI Chess Opponent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    sf_path = engine._path
    return {"status": "ok", "stockfish": sf_path or "not found"}


@app.post("/api/game/move")
async def make_move(req: MoveRequest):
    engine = get_engine()
    try:
        eval_before = engine.evaluate_position(req.fen)
        best_move = engine.get_best_move(req.fen)
        if not best_move:
            raise HTTPException(status_code=400, detail="No legal moves available")
        return {
            "move": best_move,
            "evaluation": eval_before,
            "classification": "good",
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/api/game/start")
async def start_game(req: StartGameRequest):
    return {"game_id": 1, "player_id": req.player_id, "message": "Game started"}


@app.post("/api/game/end")
async def end_game(req: EndGameRequest):
    return {"message": "Game recorded", "game_id": req.game_id, "result": req.result}
