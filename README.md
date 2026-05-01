# AI Chess Opponent That Learns the Player

A full-stack chess application featuring an adaptive AI opponent that analyzes your playing style and exploits weaknesses.

## Tech Stack

- **Frontend**: React + Vite, react-chessboard, chess.js
- **Backend**: Python FastAPI, python-chess, Stockfish
- **Database**: SQLite via SQLAlchemy

## Features

- Playable chess board with drag-and-drop moves
- Stockfish-powered AI opponent
- Move analysis with blunder/mistake/inaccuracy classification
- Weakness profiling based on game history
- Adaptive AI that steers positions toward your weak areas
- Beautiful chess.com-inspired dark-theme UI
- Evaluation bar and move history panel

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 to play.

## Project Structure

```
backend/
  main.py              # FastAPI app entry point
  requirements.txt
  engine/              # Stockfish integration
  analysis/            # Move evaluation
  profiling/           # Weakness detection
  database/            # SQLite setup
  models/              # SQLAlchemy models

frontend/src/
  components/          # Reusable UI components
  pages/               # Full page components
  services/            # API client
  hooks/               # Custom React hooks
```
