const CLASSIFICATION_COLORS = {
  blunder: "#e74c3c",
  mistake: "#e67e22",
  inaccuracy: "#f1c40f",
  good: "#2ecc71",
};

const CLASSIFICATION_SYMBOLS = {
  blunder: "??",
  mistake: "?",
  inaccuracy: "?!",
  good: "!",
};

export function MoveHistory({ moves, lastClassification }) {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="move-history">
      <h3 className="panel-title">Move History</h3>

      {lastClassification && lastClassification !== "good" && (
        <div
          className="classification-badge"
          style={{ background: CLASSIFICATION_COLORS[lastClassification] }}
        >
          {CLASSIFICATION_SYMBOLS[lastClassification]}{" "}
          {lastClassification.charAt(0).toUpperCase() + lastClassification.slice(1)}!
        </div>
      )}

      <div className="moves-list">
        {pairs.length === 0 && (
          <p className="no-moves">No moves yet. Start playing!</p>
        )}
        {pairs.map(({ num, white, black }) => (
          <div key={num} className="move-pair">
            <span className="move-num">{num}.</span>
            <span className="move-san white-move">{white?.move}</span>
            {black && <span className="move-san black-move">{black.move}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
