import chess
from typing import Tuple

BLUNDER_THRESHOLD = 200
MISTAKE_THRESHOLD = 100
INACCURACY_THRESHOLD = 50


def classify_move(eval_diff: float) -> str:
    """Classify a user's move based on centipawn loss vs best move."""
    abs_diff = abs(eval_diff)
    if abs_diff >= BLUNDER_THRESHOLD:
        return "blunder"
    elif abs_diff >= MISTAKE_THRESHOLD:
        return "mistake"
    elif abs_diff >= INACCURACY_THRESHOLD:
        return "inaccuracy"
    return "good"


def get_game_phase(fen: str) -> str:
    """Determine game phase from FEN."""
    board = chess.Board(fen)
    piece_count = sum(1 for _ in board.piece_map())
    move_num = board.fullmove_number

    if move_num <= 12:
        return "opening"
    elif piece_count <= 12:
        return "endgame"
    return "middlegame"


def analyze_user_move(
    engine,
    fen_before: str,
    user_move_uci: str,
) -> Tuple[str, float, str]:
    """
    Analyze a user's move.
    Returns: (classification, eval_diff, phase)
    eval_diff is centipawn loss (negative means the user's move was worse)
    """
    board_before = chess.Board(fen_before)
    phase = get_game_phase(fen_before)

    eval_before = engine.evaluate_position(fen_before)

    board_after = chess.Board(fen_before)
    board_after.push(chess.Move.from_uci(user_move_uci))
    eval_after = engine.evaluate_position(board_after.fen())

    if board_before.turn == chess.WHITE:
        eval_diff = eval_after - eval_before
    else:
        eval_diff = eval_before - eval_after

    classification = classify_move(eval_diff)
    return classification, eval_diff, phase
