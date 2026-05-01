import { WeaknessDashboard } from "../components/WeaknessDashboard";

export function ProfilePage() {
  return (
    <div className="profile-page">
      <header className="game-header">
        <h1 className="app-title">
          <span className="title-chess">Chess</span>
          <span className="title-ai">AI</span>
        </h1>
      </header>
      <WeaknessDashboard playerId="player_1" />
    </div>
  );
}
