from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
from typing import Dict, Any

from models.game import Game, Move


def get_player_stats(db: Session, player_id: str) -> Dict[str, Any]:
    games = db.query(Game).filter(Game.player_id == player_id).all()
    game_ids = [g.id for g in games]

    if not game_ids:
        return {
            "player_id": player_id,
            "games_played": 0,
            "stats": {"blunder": 0, "mistake": 0, "inaccuracy": 0, "good": 0},
            "weaknesses": [],
            "phase_stats": {},
        }

    moves = db.query(Move).filter(Move.game_id.in_(game_ids)).all()

    stats = defaultdict(int)
    phase_classification = defaultdict(lambda: defaultdict(int))

    for move in moves:
        stats[move.classification] += 1
        phase_classification[move.phase][move.classification] += 1

    weaknesses = []
    for phase, classifications in phase_classification.items():
        blunders = classifications.get("blunder", 0)
        mistakes = classifications.get("mistake", 0)
        inaccuracies = classifications.get("inaccuracy", 0)
        total_errors = blunders + mistakes + inaccuracies
        total_moves = sum(classifications.values())

        if total_moves > 0 and total_errors > 0:
            error_rate = total_errors / total_moves
            if blunders > 0:
                weaknesses.append({
                    "phase": phase,
                    "description": f"Frequent blunders ({blunders} blunders in {total_moves} moves)",
                    "count": blunders,
                    "severity": "high",
                })
            elif error_rate > 0.3:
                weaknesses.append({
                    "phase": phase,
                    "description": f"High error rate ({total_errors}/{total_moves} moves were errors)",
                    "count": total_errors,
                    "severity": "medium",
                })
            elif mistakes > 2:
                weaknesses.append({
                    "phase": phase,
                    "description": f"Recurring mistakes in {phase} ({mistakes} mistakes)",
                    "count": mistakes,
                    "severity": "medium",
                })

    weaknesses.sort(key=lambda w: w["count"], reverse=True)

    return {
        "player_id": player_id,
        "games_played": len(games),
        "stats": {
            "blunder": stats.get("blunder", 0),
            "mistake": stats.get("mistake", 0),
            "inaccuracy": stats.get("inaccuracy", 0),
            "good": stats.get("good", 0),
        },
        "weaknesses": weaknesses[:5],
        "phase_stats": {
            phase: dict(cls) for phase, cls in phase_classification.items()
        },
    }


def get_dominant_weakness(db: Session, player_id: str) -> str:
    """Returns the phase/type of the dominant weakness for adaptive AI."""
    profile = get_player_stats(db, player_id)
    if not profile["weaknesses"]:
        return "none"
    top = profile["weaknesses"][0]
    return top["phase"]
