import { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const DARK_SQUARE = "#4a7a4a";
const LIGHT_SQUARE = "#d4c5a9";

function useResponsiveBoardWidth() {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(420);

  useEffect(() => {
    function calculate() {
      // Width: viewport minus right panel (280) + eval bar (28) + gaps/padding (90)
      const byWidth = window.innerWidth - 280 - 28 - 90;
      // Height: viewport minus nav (60) + page padding (64) + player bar (64) + controls (52) + gaps (40)
      const byHeight = window.innerHeight - 60 - 64 - 64 - 52 - 40;
      const size = Math.min(byWidth, byHeight, 460);
      setWidth(Math.max(260, size));
    }
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  return { wrapperRef, width };
}

export function ChessBoard({ game, onDrop, isAIThinking, orientation = "white" }) {
  const { wrapperRef, width } = useResponsiveBoardWidth();
  const history = game.history({ verbose: true });
  const lastMove = history[history.length - 1];

  const highlightSquares = lastMove
    ? {
        [lastMove.from]: { backgroundColor: "rgba(226, 185, 111, 0.4)" },
        [lastMove.to]: { backgroundColor: "rgba(226, 185, 111, 0.55)" },
      }
    : {};

  // Must be synchronous — react-chessboard uses the return value immediately
  // to decide whether to snap the piece back. We validate locally with chess.js,
  // then fire the async AI request via onDrop if valid.
  function onPieceDrop(sourceSquare, targetSquare, piece) {
    const testGame = new Chess(game.fen());
    const result = testGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });
    if (!result) return false; // illegal move — snap back

    // Move is legal: hand off to the hook (async AI call happens there)
    onDrop({ from: sourceSquare, to: targetSquare, promotion: piece[1]?.toLowerCase() ?? "q" });
    return true;
  }

  return (
    <div className="board-wrapper" ref={wrapperRef}>
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
