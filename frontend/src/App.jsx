import { useState, useEffect } from "react";
import { GamePage } from "./pages/GamePage";
import { ProfilePage } from "./pages/ProfilePage";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("game");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === "dark" ? "light" : "dark");
  }

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav-logo">♟ NexusChess</span>
        <div className="nav-links">
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
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀" : "🌙"}
        </button>
      </nav>
      {page === "game" ? <GamePage /> : <ProfilePage />}
    </div>
  );
}
