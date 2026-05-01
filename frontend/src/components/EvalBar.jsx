export function EvalBar({ evaluation }) {
  const clamped = Math.max(-10, Math.min(10, evaluation / 100));
  const whitePercent = 50 + (clamped / 10) * 50;

  const label =
    Math.abs(evaluation) >= 1000
      ? `M${Math.ceil(Math.abs(evaluation) / 1000)}`
      : evaluation > 0
      ? `+${(evaluation / 100).toFixed(1)}`
      : (evaluation / 100).toFixed(1);

  return (
    <div className="eval-bar-container" title={`Evaluation: ${label}`}>
      <div className="eval-bar">
        <div
          className="eval-bar-white"
          style={{ height: `${whitePercent}%` }}
        />
      </div>
      <span className="eval-label">{label}</span>
    </div>
  );
}
