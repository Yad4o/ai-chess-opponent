import { useEffect, useState } from "react";
import { api } from "../services/api";

const BADGE_COLOR = {
  blunder: "#e74c3c",
  mistake: "#e67e22",
  inaccuracy: "#f1c40f",
  good: "#2ecc71",
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

  if (loading) return <div className="dashboard loading">Loading profile…</div>;
  if (error) return <div className="dashboard error">Could not load profile: {error}</div>;
  if (!profile) return null;

  const { stats, weaknesses, games_played } = profile;

  return (
    <div className="weakness-dashboard">
      <h2 className="dashboard-title">Your Chess Profile</h2>
      <p className="games-played">{games_played} games played</p>

      <div className="stats-grid">
        {Object.entries(stats || {}).map(([key, val]) => (
          <div key={key} className="stat-card" style={{ borderColor: BADGE_COLOR[key] }}>
            <span className="stat-count">{val}</span>
            <span className="stat-label" style={{ color: BADGE_COLOR[key] }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}s
            </span>
          </div>
        ))}
      </div>

      {weaknesses?.length > 0 && (
        <div className="weaknesses-section">
          <h3>Key Weaknesses</h3>
          <ul className="weakness-list">
            {weaknesses.map((w, i) => (
              <li key={i} className="weakness-item">
                <span className="weakness-phase">{w.phase}</span>
                <span className="weakness-desc">{w.description}</span>
                <span className="weakness-count">{w.count}x</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
