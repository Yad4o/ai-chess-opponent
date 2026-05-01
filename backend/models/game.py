from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from database.db import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(String, index=True, nullable=False)
    pgn = Column(Text, default="")
    result = Column(String, default="*")
    created_at = Column(DateTime, default=datetime.utcnow)

    moves = relationship("Move", back_populates="game", cascade="all, delete-orphan")


class Move(Base):
    __tablename__ = "moves"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    fen_before = Column(String, nullable=False)
    move_uci = Column(String, nullable=False)
    eval_diff = Column(Float, default=0.0)
    classification = Column(String, default="good")
    phase = Column(String, default="middlegame")
    move_number = Column(Integer, default=1)

    game = relationship("Game", back_populates="moves")
