import { useState } from "react";
import { GamePage } from "./pages/GamePage";
import { ProfilePage } from "./pages/ProfilePage";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("game");

  return (
    <div className="app">
      <nav className="nav">
        <button
          className={`nav-btn ${page === "game" ? "active" : ""}`}
          onClick={() => setPage("game")}
        >
          Game
        </button>
        <button
          className={`nav-btn ${page === "profile" ? "active" : ""}`}
          onClick={() => setPage("profile")}
        >
          My Profile
        </button>
      </nav>
      {page === "game" ? <GamePage /> : <ProfilePage />}
    </div>
  );
}
