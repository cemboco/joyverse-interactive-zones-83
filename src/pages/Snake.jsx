import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon, InstagramIcon } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const BORDER_THICKNESS = 10;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = 'RIGHT';

const Snake = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBoardSize = () => {
      const smallestDimension = Math.min(window.innerWidth, window.innerHeight) - 40;
      const newSize = Math.floor(smallestDimension / GRID_SIZE) * GRID_SIZE;
      setBoardSize({ width: newSize, height: newSize });
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  // ... (keep all the existing game logic)

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Snake Game</h1>
      <div 
        className="relative bg-black" 
        style={{ 
          width: boardSize.width + 2 * BORDER_THICKNESS, 
          height: boardSize.height + 2 * BORDER_THICKNESS,
          padding: BORDER_THICKNESS
        }}
      >
        <div className="relative bg-white" style={{ width: boardSize.width, height: boardSize.height }}>
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500"
              style={{
                left: (segment.x * boardSize.width) / GRID_SIZE,
                top: (segment.y * boardSize.height) / GRID_SIZE,
                width: boardSize.width / GRID_SIZE,
                height: boardSize.height / GRID_SIZE,
              }}
            />
          ))}
          <div
            className="absolute bg-red-500"
            style={{
              left: (food.x * boardSize.width) / GRID_SIZE,
              top: (food.y * boardSize.height) / GRID_SIZE,
              width: boardSize.width / GRID_SIZE,
              height: boardSize.height / GRID_SIZE,
            }}
          />
        </div>
      </div>
      <div className="mt-4 text-white text-xl">Score: {score}</div>
      <div className="mt-2 text-white text-lg">High Score: {highScore}</div>
      <div className="text-xl font-bold mb-4 text-white">Try to beat me!</div>
      {gameOver && (
        <div className="mt-4 text-white text-xl">Game Over!</div>
      )}
      <Button onClick={resetGame} className="mt-4 px-6 py-2 text-lg">
        {gameOver ? 'Play Again' : 'Reset Game'}
      </Button>
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
        <Button onClick={shareOnTwitter} className="bg-blue-400 hover:bg-blue-500 px-4 py-2">
          Share on X.com
        </Button>
        <Button onClick={shareOnInstagram} className="bg-pink-500 hover:bg-pink-600 px-4 py-2">
          <InstagramIcon className="h-5 w-5 mr-2" />
          Share on Instagram
        </Button>
      </div>
    </div>
  );
};

export default Snake;