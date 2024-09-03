import { HomeIcon, BrainIcon, HashIcon, WormIcon, SquareStackIcon, BrickWallIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import MemoryGame from "./pages/MemoryGame.jsx";
import TicTacToe from "./pages/TicTacToe.jsx";
import Snake from "./pages/Snake.jsx";
import Tetris from "./pages/Tetris.jsx";
import Breakout from "./pages/Breakout.jsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Memory Game",
    to: "/memory-game",
    icon: <BrainIcon className="h-4 w-4" />,
    page: <MemoryGame />,
  },
  {
    title: "Tic-Tac-Toe",
    to: "/tic-tac-toe",
    icon: <HashIcon className="h-4 w-4" />,
    page: <TicTacToe />,
  },
  {
    title: "Snake",
    to: "/snake",
    icon: <WormIcon className="h-4 w-4" />,
    page: <Snake />,
  },
  {
    title: "Tetris",
    to: "/tetris",
    icon: <SquareStackIcon className="h-4 w-4" />,
    page: <Tetris />,
  },
  {
    title: "Breakout",
    to: "/breakout",
    icon: <BrickWallIcon className="h-4 w-4" />,
    page: <Breakout />,
  },
];