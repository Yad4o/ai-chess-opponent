import { Chessboard } from "react-chessboard";

const DARK_SQUARE = "#4a7a4a";
const LIGHT_SQUARE = "#d4c5a9";

export function ChessBoard({ game, onDrop, isAIThinking, orientation = "white" }) {
  const history = game.history({ verbose: true });
  const lastMove = history[history.length - 1];

  const highlightSquares = lastMove
    ? {
        [lastMove.from]: { backgroundColor: "rgba(226, 185, 111, 0.4)" },
        [lastMove.to]: { backgroundColor: "rgba(226, 185, 111, 0.55)" },
      }
    : {};

  function onPieceDrop(sourceSquare, targetSquare, piece) {
    return onDrop({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });
  }

  return (
    <div className="board-wrapper">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        areArrowsAllowed
        animationDuration={200}
        boardWidth={560}
        customDarkSquareStyle={{ backgroundColor: DARK_SQUARE }}
        customLightSquareStyle={{ backgroundColor: LIGHT_SQUARE }}
        customSquareStyles={highlightSquares}
        customBoardStyle={{
          borderRadius: "8px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
        isDraggablePiece={({ piece }) =>
          !isAIThinking && piece[0] === (orientation === "white" ? "w" : "b")
        }
      />
      {isAIThinking && (
        <div className="ai-thinking-overlay">
          <div className="thinking-spinner" />
          <span>AI is thinking…</span>
        </div>
      )}
    </div>
  );
}
