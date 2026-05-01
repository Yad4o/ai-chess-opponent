import { useChessGame } from "../hooks/useChessGame";
import { ChessBoard } from "../components/ChessBoard";
import { EvalBar } from "../components/EvalBar";
import { MoveHistory } from "../components/MoveHistory";

export function GamePage() {
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

  return (
    <div className="game-page">
      <header className="game-header">
        <h1 className="app-title">
          <span className="title-chess">Chess</span>
          <span className="title-ai">AI</span>
        </h1>
        <p className="app-subtitle">An opponent that learns your weaknesses</p>
      </header>

      <div className="game-layout">
        <EvalBar evaluation={evaluation} />

        <div className="board-column">
          {gameOver && (
            <div className="game-over-banner">
              {gameOver === "draw"
                ? "Draw!"
                : gameOver === "white"
                ? "You Win!"
                : "AI Wins!"}
            </div>
          )}

          {!gameStarted ? (
            <div className="start-screen">
              <div className="start-card">
                <h2>Ready to Play?</h2>
                <p>The AI will analyze your moves and adapt its strategy to exploit your weaknesses.</p>
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
            />
          )}

          {gameStarted && (
            <button className="btn-secondary new-game-btn" onClick={startNewGame}>
              New Game
            </button>
          )}
        </div>

        <MoveHistory moves={moveHistory} lastClassification={lastClassification} />
      </div>
    </div>
  );
}
