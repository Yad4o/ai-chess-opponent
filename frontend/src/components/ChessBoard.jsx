import { useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const DARK_SQUARE = "#4a7a4a";
const LIGHT_SQUARE = "#d4c5a9";

export function ChessBoard({ game, onDrop, isAIThinking, orientation = "white", boardWidth = 420 }) {
  const wrapperRef = useRef(null);
  const width = boardWidth;
  const history = game.history({ verbose: true });
  const lastMove = history[history.length - 1];

  const highlightSquares = lastMove
    ? {
        [lastMove.from]: { backgroundColor: "rgba(226, 185, 111, 0.4)" },
        [lastMove.to]: { backgroundColor: "rgba(226, 185, 111, 0.55)" },
      }
    : {};

  // Must be synchronous — react-chessboard uses the return value immediately.
  // Always use "q" promotion: chess.js ignores it for non-promotion moves,
  // and auto-promotes to queen for pawn promotions.
  function onPieceDrop(sourceSquare, targetSquare) {
    const testGame = new Chess(game.fen());
    const result = testGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!result) return false;
    onDrop({ from: sourceSquare, to: targetSquare, promotion: "q" });
    return true;
  }

  return (
    <div className="board-wrapper" ref={wrapperRef} style={{ "--board-w": `${width}px` }}>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        areArrowsAllowed
        animationDuration={200}
        boardWidth={width}
        customDarkSquareStyle={{ backgroundColor: DARK_SQUARE }}
        customLightSquareStyle={{ backgroundColor: LIGHT_SQUARE }}
        customSquareStyles={highlightSquares}
        customBoardStyle={{
          borderRadius: "8px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
        isDraggablePiece={() => !isAIThinking}
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
