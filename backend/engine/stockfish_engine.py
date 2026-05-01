import os
import chess
import chess.engine
import chess.pgn
from typing import Optional

STOCKFISH_PATHS = [
    "/usr/games/stockfish",
    "/usr/bin/stockfish",
    "/usr/local/bin/stockfish",
    "stockfish",
    # Windows common locations
    r"C:\Users\Public\stockfish\stockfish.exe",
    r"C:\stockfish\stockfish.exe",
    r"C:\Program Files\stockfish\stockfish.exe",
]

# Set this env var to override: STOCKFISH_PATH=C:\path\to\stockfish.exe
_ENV_PATH = os.environ.get("STOCKFISH_PATH")


def find_stockfish() -> Optional[str]:
    if _ENV_PATH and os.path.isfile(_ENV_PATH):
        return _ENV_PATH
    for path in STOCKFISH_PATHS:
        if os.path.isfile(path):
            return path
    import shutil
    return shutil.which("stockfish")


class StockfishEngine:
    def __init__(self, depth: int = 15, time_limit: float = 1.0):
        self.depth = depth
        self.time_limit = time_limit
        self._engine = None
        self._path = find_stockfish()

    def _get_engine(self):
        if self._engine is None:
            if not self._path:
                raise RuntimeError("Stockfish binary not found")
            self._engine = chess.engine.SimpleEngine.popen_uci(self._path)
        return self._engine

    def get_best_move(self, fen: str, depth: int = None) -> Optional[str]:
        engine = self._get_engine()
        board = chess.Board(fen)
        if board.is_game_over():
            return None
        d = depth or self.depth
        result = engine.play(board, chess.engine.Limit(depth=d))
        return result.move.uci() if result.move else None

    def evaluate_position(self, fen: str, depth: int = 12) -> int:
        engine = self._get_engine()
        board = chess.Board(fen)
        if board.is_game_over():
            return 0
        info = engine.analyse(board, chess.engine.Limit(depth=depth))
        score = info["score"].white()
        if score.is_mate():
            mate_in = score.mate()
            return 100000 if mate_in > 0 else -100000
        return score.score(mate_score=100000)

    def get_top_moves(self, fen: str, n: int = 3, depth: int = 12) -> list:
        engine = self._get_engine()
        board = chess.Board(fen)
        if board.is_game_over():
            return []
        infos = engine.analyse(board, chess.engine.Limit(depth=depth), multipv=n)
        moves = []
        for info in infos:
            move = info.get("pv", [None])[0]
            score = info.get("score")
            if move and score:
                cp = score.white().score(mate_score=100000)
                moves.append({"move": move.uci(), "score": cp})
        return moves

    def close(self):
        if self._engine:
            self._engine.quit()
            self._engine = None


_engine_instance: Optional[StockfishEngine] = None


def get_engine() -> StockfishEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = StockfishEngine()
    return _engine_instance
