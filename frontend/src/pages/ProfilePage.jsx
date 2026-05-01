import { useEffect, useState } from "react";
import { WeaknessDashboard } from "../components/WeaknessDashboard";
import { api } from "../services/api";

const PLAYER_ID = "player_1";

function getResultLabel(result) {
  if (!result || result === "*") return "ongoing";
  if (result === "white") return "win";
  if (result === "black") return "loss";
  if (result === "draw") return "draw";
  return result;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

export function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getProfile(PLAYER_ID).then(setProfile).catch(() => {});
  }, []);

  const games = profile?.recent_games ?? [];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Your Chess Profile</h1>
        <p>Track your strengths, weaknesses, and progress over time.</p>
      </div>

      <WeaknessDashboard playerId={PLAYER_ID} />

      <div className="recent-games">
        <h3>Recent Games</h3>
        {games.length === 0 ? (
          <p className="no-games">No games recorded yet. Play a game to see your history!</p>
        ) : (
          <table className="games-table">
            <thead>
              <tr>
                <th>Game #</th>
                <th>Result</th>
                <th>Moves</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => {
                const label = getResultLabel(g.result);
                return (
                  <tr key={g.id}>
                    <td>#{g.id}</td>
                    <td>
                      <span className={`result-badge ${label}`}>
                        {label.toUpperCase()}
                      </span>
                    </td>
                    <td>{g.total_moves ?? "—"}</td>
                    <td>{formatDate(g.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
