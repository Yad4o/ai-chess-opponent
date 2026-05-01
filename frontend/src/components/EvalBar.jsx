export function EvalBar({ evaluation, boardWidth = 420 }) {
  const clamped = Math.max(-1000, Math.min(1000, evaluation));
  const whitePercent = 50 + (clamped / 1000) * 50;

  const label =
    Math.abs(evaluation) >= 10000
      ? `M${Math.ceil(Math.abs(evaluation) / 10000)}`
      : evaluation > 0
      ? `+${(evaluation / 100).toFixed(1)}`
      : (evaluation / 100).toFixed(1);

  return (
    <div className="eval-bar-container" title={`Evaluation: ${label}`}>
      <span className="eval-label" style={{ color: "var(--text-muted)", fontSize: "10px" }}>+</span>
      <div className="eval-bar" style={{ height: boardWidth }}>
        <div className="eval-bar-white" style={{ height: `${whitePercent}%` }} />
      </div>
      <span className="eval-label">{label}</span>
    </div>
  );
}
