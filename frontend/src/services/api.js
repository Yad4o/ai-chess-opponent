const BASE_URL = "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  getAIMove: (fen, playerId) =>
    request("/api/game/move", {
      method: "POST",
      body: JSON.stringify({ fen, player_id: playerId }),
    }),

  startGame: (playerId) =>
    request("/api/game/start", {
      method: "POST",
      body: JSON.stringify({ player_id: playerId }),
    }),

  endGame: (gameId, pgn, result) =>
    request("/api/game/end", {
      method: "POST",
      body: JSON.stringify({ game_id: gameId, pgn, result }),
    }),

  getProfile: (playerId) => request(`/api/profile/${playerId}`),
};
