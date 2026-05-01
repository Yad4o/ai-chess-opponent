const BADGE_COLOR = {
  blunder: "var(--blunder)",
  mistake: "var(--mistake)",
  inaccuracy: "var(--inaccuracy)",
  good: "var(--good)",
};

export function MoveHistory({ moves }) {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="move-history">
      <h3 className="panel-title">Move History</h3>
      <div className="moves-list">
        {pairs.length === 0 && (
          <p className="no-moves">No moves yet</p>
        )}
        {pairs.map(({ num, white, black }) => (
          <div key={num} className="move-pair">
            <span className="move-num">{num}.</span>
            <MoveCell entry={white} />
            {black ? <MoveCell entry={black} /> : <span />}
          </div>
        ))}
      </div>
    </div>
  );
}

function MoveCell({ entry }) {
  if (!entry) return <span />;
  const isWhite = entry.color === "w";
  const cls = entry.classification;
  return (
    <span className={`move-san ${isWhite ? "white-move" : "black-move"}`}>
      {cls && cls !== "good" && (
        <span
          className="move-badge"
          style={{ background: BADGE_COLOR[cls] }}
          title={cls}
        />
      )}
      {entry.move}
    </span>
  );
}
