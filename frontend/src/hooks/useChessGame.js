import { useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { api } from "../services/api";

const PLAYER_ID = "player_1";

export function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastClassification, setLastClassification] = useState(null);
  const [evaluation, setEvaluation] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const gameRef = useRef(game);

  function updateGame(newGame) {
    gameRef.current = newGame;
    setGame(new Chess(newGame.fen()));
  }

  const startNewGame = useCallback(async () => {
    const newGame = new Chess();
    gameRef.current = newGame;
    setGame(newGame);
    setMoveHistory([]);
    setLastClassification(null);
    setEvaluation(0);
    setGameOver(null);
    setIsAIThinking(false);
    setGameStarted(true);
    try {
      const { game_id } = await api.startGame(PLAYER_ID);
      setGameId(game_id);
    } catch {
      setGameId(`local_${Date.now()}`);
    }
  }, []);

  const makeMove = useCallback(
    async (move) => {
      const current = gameRef.current;
      const fenBefore = current.fen();

      const result = current.move(move);
      if (!result) return false;

      updateGame(current);
      const newHistory = [
        ...moveHistory,
        { move: result.san, color: result.color, fen: current.fen() },
      ];
      setMoveHistory(newHistory);

      if (current.isGameOver()) {
        const outcome = current.isCheckmate()
          ? result.color === "w"
            ? "white"
            : "black"
          : "draw";
        setGameOver(outcome);
        if (gameId) {
          try {
            await api.endGame(gameId, current.pgn(), outcome);
          } catch {}
        }
        return true;
      }

      setIsAIThinking(true);
      try {
        const data = await api.getAIMove(current.fen(), PLAYER_ID);
        const aiGame = new Chess(current.fen());
        aiGame.move(data.move);
        updateGame(aiGame);
        setMoveHistory((prev) => [
          ...prev,
          { move: data.move, color: "b", fen: aiGame.fen() },
        ]);
        if (data.classification) setLastClassification(data.classification);
        if (data.evaluation !== undefined) setEvaluation(data.evaluation);

        if (aiGame.isGameOver()) {
          const outcome = aiGame.isCheckmate() ? "black" : "draw";
          setGameOver(outcome);
          if (gameId) {
            try {
              await api.endGame(gameId, aiGame.pgn(), outcome);
            } catch {}
          }
        }
      } catch (err) {
        console.error("AI move error:", err);
      } finally {
        setIsAIThinking(false);
      }

      return true;
    },
    [game, moveHistory, gameId]
  );

  const orientation = "white";

  return {
    game,
    gameId,
    moveHistory,
    lastClassification,
    evaluation,
    isAIThinking,
    gameOver,
    gameStarted,
    orientation,
    makeMove,
    startNewGame,
    playerId: PLAYER_ID,
  };
}
