import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

const GRID_SIZE = 15;
const CELL_SIZE = 20;
const BORDER_THICKNESS = 5;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_FOOD = { x: 11, y: 11 };
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
  const [boardSize, setBoardSize] = useState({ width: 300, height: 300 });
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 200);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': setDirection('UP'); break;
        case 'ArrowDown': setDirection('DOWN'); break;
        case 'ArrowLeft': setDirection('LEFT'); break;
        case 'ArrowRight': setDirection('RIGHT'); break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);

  const shareOnTwitter = () => {
    const text = `I just scored ${score} in Snake Game! Try to beat me! #SnakeGameChallenge`;
    const url = 'https://your-game-url.com';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnInstagram = () => {
    const text = `I just scored ${score} in Snake Game! Try to beat me! #SnakeGameChallenge\n\nPlay at: https://your-game-url.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Challenge text copied! You can now paste it into your Instagram story.');
    });
  };

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.setTransform(CELL_SIZE, 0, 0, CELL_SIZE, 0, 0);
    context.clearRect(0, 0, GRID_SIZE, GRID_SIZE);
    context.fillStyle = 'green';
    snake.forEach(({ x, y }) => context.fillRect(x, y, 1, 1));
    context.fillStyle = 'red';
    context.fillRect(food.x, food.y, 1, 1);
  }, [snake, food]);

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
        <canvas
          ref={canvasRef}
          width={boardSize.width}
          height={boardSize.height}
          className="bg-white"
        />
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
          <TwitterIcon className="h-5 w-5 mr-2" />
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