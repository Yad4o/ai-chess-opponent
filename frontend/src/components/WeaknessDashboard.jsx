import { useEffect, useState } from "react";
import { api } from "../services/api";

const STAT_COLOR = {
  blunder: "var(--blunder)",
  mistake: "var(--mistake)",
  inaccuracy: "var(--inaccuracy)",
  good: "var(--good)",
};

const BAR_COLOR = {
  blunder: "var(--blunder)",
  mistake: "var(--mistake)",
  inaccuracy: "var(--inaccuracy)",
  good: "var(--good)",
};

export function WeaknessDashboard({ playerId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    api
      .getProfile(playerId)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading) return <div className="dashboard-loading">Loading profile…</div>;
  if (error) return <div className="dashboard-error">Could not load profile: {error}</div>;
  if (!profile) return null;

  const { stats = {}, weaknesses = [], games_played } = profile;

  const totalMoves = Object.values(stats).reduce((a, b) => a + b, 0);
  const dominantPhase = weaknesses[0]?.phase ?? null;

  return (
    <div className="weakness-dashboard">
      <p className="games-played">{games_played} games played · {totalMoves} moves analyzed</p>

      {/* Stat cards */}
      <div className="stats-grid">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="stat-card" style={{ borderColor: STAT_COLOR[key] }}>
            <span className="stat-count" style={{ color: STAT_COLOR[key] }}>{val}</span>
            <span className="stat-label" style={{ color: STAT_COLOR[key] }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}s
            </span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {totalMoves > 0 && (
        <div className="weakness-chart">
          <h3>Move Breakdown</h3>
          <div className="bar-chart">
            {Object.entries(stats).map(([key, val]) => {
              const pct = totalMoves > 0 ? Math.round((val / totalMoves) * 100) : 0;
              return (
                <div key={key} className="bar-row">
                  <span className="bar-label">{key.charAt(0).toUpperCase() + key.slice(1)}s</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${pct}%`, background: BAR_COLOR[key] }}
                    />
                  </div>
                  <span className="bar-value">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weaknesses list */}
      {weaknesses.length > 0 && (
        <div className="weaknesses-section">
          <h3>Key Weaknesses</h3>
          <ul className="weakness-list">
            {weaknesses.map((w, i) => (
              <li key={i} className={`weakness-item ${w.phase === dominantPhase && i === 0 ? "dominant" : ""}`}>
                {i === 0 && <span className="dominant-crown">👑</span>}
                <span className="weakness-phase">{w.phase}</span>
                <span className="weakness-desc">{w.description}</span>
                <span className="weakness-count">{w.count}x</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses.length === 0 && totalMoves > 0 && (
        <div className="weaknesses-section">
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            No significant weaknesses detected. Keep playing to build your profile!
          </p>
        </div>
      )}
    </div>
  );
}
