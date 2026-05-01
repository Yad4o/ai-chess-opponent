import { Chessboard } from "react-chessboard";

const PIECE_STYLE = {
  customDarkSquareStyle: { backgroundColor: "#769656" },
  customLightSquareStyle: { backgroundColor: "#eeeed2" },
};

export function ChessBoard({ game, onDrop, isAIThinking, orientation = "white" }) {
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
        customDarkSquareStyle={PIECE_STYLE.customDarkSquareStyle}
        customLightSquareStyle={PIECE_STYLE.customLightSquareStyle}
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
