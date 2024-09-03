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

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      });
      setScore(prevScore => {
        const newScore = prevScore + 1;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snakeHighScore', newScore.toString());
        }
        return newScore;
      });
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, highScore]);

  const changeDirection = useCallback((newDirection) => {
    setDirection(prevDirection => {
      const opposites = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
      };
      return opposites[prevDirection] !== newDirection ? newDirection : prevDirection;
    });
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const handleKeyPress = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': changeDirection('UP'); break;
        case 'ArrowDown': changeDirection('DOWN'); break;
        case 'ArrowLeft': changeDirection('LEFT'); break;
        case 'ArrowRight': changeDirection('RIGHT'); break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    const gameInterval = setInterval(moveSnake, 200);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameInterval);
    };
  }, [gameOver, moveSnake, changeDirection]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
  };

  useEffect(() => {
    if (gameOver) {
      const games = JSON.parse(localStorage.getItem('snakeGames') || '[]');
      games.push({ score, date: new Date().toISOString() });
      localStorage.setItem('snakeGames', JSON.stringify(games));
    }
  }, [gameOver, score]);

  const shareOnTwitter = () => {
    const text = `I just scored ${score} in Snake Game! Try to beat me! #SnakeGameChallenge`;
    const url = 'https://your-game-url.com'; // Replace with your actual game URL
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnInstagram = () => {
    const text = `I just scored ${score} in Snake Game! Try to beat me! #SnakeGameChallenge\n\nPlay at: https://your-game-url.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Challenge text copied! You can now paste it into your Instagram story.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex flex-col items-center justify-center">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-4xl font-bold text-white mb-8">Snake Game</h1>
      <div 
        className="relative bg-black" 
        style={{ 
          width: GRID_SIZE * CELL_SIZE + 2 * BORDER_THICKNESS, 
          height: GRID_SIZE * CELL_SIZE + 2 * BORDER_THICKNESS,
          padding: BORDER_THICKNESS
        }}
      >
        <div className="relative bg-white" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            />
          ))}
          <div
            className="absolute bg-red-500"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        </div>
      </div>
      <div className="mt-4 text-white text-2xl">Score: {score}</div>
      <div className="mt-2 text-white text-xl">High Score: {highScore}</div>
      <div className="text-2xl font-bold mb-4 text-white">Try to beat me!</div>
      {gameOver && (
        <div className="mt-4 text-white text-2xl">Game Over!</div>
      )}
      <Button onClick={resetGame} className="mt-4">
        {gameOver ? 'Play Again' : 'Reset Game'}
      </Button>
      <div className="flex justify-center space-x-4 mt-4">
        <Button onClick={shareOnTwitter} className="bg-blue-400 hover:bg-blue-500">
          Share on X.com
        </Button>
        <Button onClick={shareOnInstagram} className="bg-pink-500 hover:bg-pink-600">
          <InstagramIcon className="h-5 w-5 mr-2" />
          Share on Instagram
        </Button>
      </div>
    </div>
  );
};

export default Snake;