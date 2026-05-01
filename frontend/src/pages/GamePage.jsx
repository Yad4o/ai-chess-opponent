import { useState, useEffect } from "react";
import { useChessGame } from "../hooks/useChessGame";
import { ChessBoard } from "../components/ChessBoard";
import { EvalBar } from "../components/EvalBar";
import { MoveHistory } from "../components/MoveHistory";

function useBoardSize() {
  const [size, setSize] = useState(420);
  useEffect(() => {
    function calc() {
      const byW = window.innerWidth - 280 - 28 - 90;
      const byH = window.innerHeight - 60 - 64 - 64 - 52 - 40;
      setSize(Math.max(260, Math.min(byW, byH, 460)));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return size;
}

export function GamePage() {
  const boardSize = useBoardSize();
  const {
    game,
    moveHistory,
    lastClassification,
    evaluation,
    isAIThinking,
    gameOver,
    gameStarted,
    orientation,
    makeMove,
    startNewGame,
  } = useChessGame();

  const BADGE_COLORS = {
    blunder: "var(--blunder)",
    mistake: "var(--mistake)",
    inaccuracy: "var(--inaccuracy)",
    good: "var(--good)",
  };

  const BADGE_EMOJIS = {
    blunder: "🔴",
    mistake: "🟡",
    inaccuracy: "🟠",
    good: "✅",
  };

  return (
    <div className="game-page">
      <div className="game-layout">
        {/* Left: eval bar + board */}
        <div className="board-panel">
          <EvalBar evaluation={evaluation} boardWidth={boardSize} />
          <div className="board-column">
            {gameOver && (
              <div className="game-over-banner">
                {gameOver === "draw" ? "Draw!" : gameOver === "white" ? "You Win! 🎉" : "AI Wins!"}
              </div>
            )}

            {!gameStarted ? (
              <div className="start-screen" style={{ width: boardSize, height: boardSize }}>
                <div className="start-card">
                  <span className="start-chess-icon">♟</span>
                  <h2>Ready to Play?</h2>
                  <p>The AI analyzes your moves and adapts its strategy to exploit your weaknesses.</p>
                  <button className="btn-primary" onClick={startNewGame}>
                    Start Game
                  </button>
                </div>
              </div>
            ) : (
              <ChessBoard
                game={game}
                onDrop={makeMove}
                isAIThinking={isAIThinking}
                orientation={orientation}
                boardWidth={boardSize}
              />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          {/* Player info bar */}
          <div className="player-info-bar">
            <div className="player-info">
              <div className="player-avatar ai">🤖</div>
              <div>
                <div className="player-name">NexusChess AI</div>
                <div className="player-sub">Adaptive Engine</div>
              </div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="player-info">
              <div>
                <div className="player-name" style={{ textAlign: "right" }}>You</div>
                <div className="player-sub" style={{ textAlign: "right" }}>Player</div>
              </div>
              <div className="player-avatar you">♙</div>
            </div>
          </div>

          {/* Last move classification badge */}
          {gameStarted && lastClassification && (
            <div className="classification-float">
              <span className="badge-dot" style={{ background: BADGE_COLORS[lastClassification] }} />
              <span style={{ color: BADGE_COLORS[lastClassification] }}>
                {BADGE_EMOJIS[lastClassification]}&nbsp;
                {lastClassification.charAt(0).toUpperCase() + lastClassification.slice(1)}
              </span>
            </div>
          )}

          {/* Move history */}
          <MoveHistory moves={moveHistory} lastClassification={lastClassification} />

          {/* Game controls */}
          <div className="game-controls">
            <button className="btn-primary" onClick={startNewGame}>
              New Game
            </button>
            {gameStarted && !gameOver && (
              <button className="btn-danger" onClick={startNewGame}>
                Resign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
