import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
const BALL_RADIUS = 10;
const BRICK_ROW_COUNT = 3;
const BRICK_COLUMN_COUNT = 5;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

const Breakout = () => {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [paddleX, setPaddleX] = useState(0);
  const [ballX, setBallX] = useState(0);
  const [ballY, setBallY] = useState(0);
  const [ballDX, setBallDX] = useState(2);
  const [ballDY, setBallDY] = useState(-2);
  const [bricks, setBricks] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const initializeBricks = () => {
      const newBricks = [];
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        newBricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          newBricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
      setBricks(newBricks);
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (
              ballX > b.x &&
              ballX < b.x + BRICK_WIDTH &&
              ballY > b.y &&
              ballY < b.y + BRICK_HEIGHT
            ) {
              setBallDY(-ballDY);
              b.status = 0;
              setScore(prevScore => prevScore + 1);
              if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
                setGameOver(true);
              }
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
        setBallDX(-ballDX);
      }
      if (ballY + ballDY < BALL_RADIUS) {
        setBallDY(-ballDY);
      } else if (ballY + ballDY > canvas.height - BALL_RADIUS) {
        if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
          setBallDY(-ballDY);
        } else {
          setGameOver(true);
        }
      }

      setBallX(prevX => prevX + ballDX);
      setBallY(prevY => prevY + ballDY);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    const handleMouseMove = (e) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        setPaddleX(relativeX - PADDLE_WIDTH / 2);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    initializeBricks();
    setBallX(canvas.width / 2);
    setBallY(canvas.height - 30);
    setPaddleX((canvas.width - PADDLE_WIDTH) / 2);

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [ballDX, ballDY, bricks, gameOver, paddleX, score]);

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setBallDX(2);
    setBallDY(-2);
    const canvas = canvasRef.current;
    setBallX(canvas.width / 2);
    setBallY(canvas.height - 30);
    setPaddleX((canvas.width - PADDLE_WIDTH) / 2);
    const newBricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        newBricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    setBricks(newBricks);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex flex-col items-center justify-center">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-4xl font-bold text-white mb-8">Breakout</h1>
      <canvas ref={canvasRef} width="480" height="320" className="border-4 border-white" />
      <div className="mt-4 text-white text-2xl">Score: {score}</div>
      {gameOver && (
        <div className="mt-4 text-white text-2xl">Game Over!</div>
      )}
      <Button onClick={resetGame} className="mt-4">
        {gameOver ? 'Play Again' : 'Reset Game'}
      </Button>
    </div>
  );
};

export default Breakout;