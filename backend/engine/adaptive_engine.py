import random
import chess
from typing import Optional

from engine.stockfish_engine import StockfishEngine

BEST_MOVE_PROBABILITY = 0.70


def _count_pieces(board: chess.Board) -> int:
    return len(board.piece_map())


def _is_endgame(board: chess.Board) -> bool:
    return _count_pieces(board) <= 12


def _is_opening(board: chess.Board) -> bool:
    return board.fullmove_number <= 10


def _get_tactical_move(engine: StockfishEngine, fen: str) -> Optional[str]:
    """Pick a move that creates tactical complexity (lower depth = more human-like)."""
    moves = engine.get_top_moves(fen, n=5, depth=8)
    if not moves:
        return None
    weights = []
    for i, m in enumerate(moves):
        w = max(1, 5 - i)
        weights.append(w)
    chosen = random.choices(moves, weights=weights, k=1)[0]
    return chosen["move"]


def _get_endgame_steered_move(engine: StockfishEngine, fen: str) -> Optional[str]:
    """Prefer exchanges to simplify toward endgame."""
    board = chess.Board(fen)
    top_moves = engine.get_top_moves(fen, n=5, depth=12)
    if not top_moves:
        return None

    capture_moves = []
    other_moves = []
    for m in top_moves:
        move = chess.Move.from_uci(m["move"])
        if board.is_capture(move):
            capture_moves.append(m)
        else:
            other_moves.append(m)

    if capture_moves and random.random() < 0.6:
        return capture_moves[0]["move"]
    return top_moves[0]["move"]


def _get_opening_trapper_move(engine: StockfishEngine, fen: str) -> Optional[str]:
    """Use a slightly weaker opening move to lead into tricky middlegames."""
    top_moves = engine.get_top_moves(fen, n=3, depth=10)
    if not top_moves:
        return None
    if len(top_moves) >= 2:
        return random.choice([top_moves[0]["move"], top_moves[1]["move"]])
    return top_moves[0]["move"]


def get_adaptive_move(
    engine: StockfishEngine,
    fen: str,
    dominant_weakness: str = "none",
) -> str:
    """
    70% best move, 30% exploit weakness.
    Weakness strategies:
      - endgame: steer toward simplified endgames via exchanges
      - opening: set tactical traps
      - middlegame/tactical: create complex tactical positions
    """
    board = chess.Board(fen)
    if board.is_game_over():
        return None

    if random.random() < BEST_MOVE_PROBABILITY:
        return engine.get_best_move(fen)

    exploit = None
    if dominant_weakness == "endgame" and not _is_endgame(board):
        exploit = _get_endgame_steered_move(engine, fen)
    elif dominant_weakness == "opening" and _is_opening(board):
        exploit = _get_opening_trapper_move(engine, fen)
    elif dominant_weakness in ("middlegame", "tactical", "none"):
        exploit = _get_tactical_move(engine, fen)

    return exploit or engine.get_best_move(fen)
