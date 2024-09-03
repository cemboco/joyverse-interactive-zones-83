import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

const GRID_WIDTH = 12;
const GRID_HEIGHT = 20;
const CELL_SIZE = 18;
const BORDER_THICKNESS = 5;

const Tetris = () => {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [boardSize, setBoardSize] = useState({ 
    width: GRID_WIDTH * CELL_SIZE, 
    height: GRID_HEIGHT * CELL_SIZE 
  });
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const tetrominoSequence = useRef([]);
  const generateSequence = () => {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.current.push(name);
    }
  };

  const tetrominos = {
    'I': [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    'J': [[1,0,0],[1,1,1],[0,0,0]],
    'L': [[0,0,1],[1,1,1],[0,0,0]],
    'O': [[1,1],[1,1]],
    'S': [[0,1,1],[1,1,0],[0,0,0]],
    'Z': [[1,1,0],[0,1,1],[0,0,0]],
    'T': [[0,1,0],[1,1,1],[0,0,0]]
  };

  const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };

  const playfield = useRef([]);
  for (let row = -2; row < GRID_HEIGHT; row++) {
    playfield.current[row] = [];
    for (let col = 0; col < GRID_WIDTH; col++) {
      playfield.current[row][col] = 0;
    }
  }

  const tetromino = useRef(null);
  const count = useRef(0);

  const getNextTetromino = () => {
    if (tetrominoSequence.current.length === 0) {
      generateSequence();
    }
    const name = tetrominoSequence.current.pop();
    const matrix = tetrominos[name];
    const col = playfield.current[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;
    return { name, matrix, row, col };
  };

  const rotate = (matrix) => {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
    return result;
  };

  const isValidMove = (matrix, cellRow, cellCol) => {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
          cellCol + col < 0 ||
          cellCol + col >= playfield.current[0].length ||
          cellRow + row >= playfield.current.length ||
          playfield.current[cellRow + row][cellCol + col])
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const placeTetromino = () => {
    for (let row = 0; row < tetromino.current.matrix.length; row++) {
      for (let col = 0; col < tetromino.current.matrix[row].length; col++) {
        if (tetromino.current.matrix[row][col]) {
          if (tetromino.current.row + row < 0) {
            return setGameOver(true);
          }
          playfield.current[tetromino.current.row + row][tetromino.current.col + col] = tetromino.current.name;
        }
      }
    }

    for (let row = playfield.current.length - 1; row >= 0; ) {
      if (playfield.current[row].every(cell => !!cell)) {
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < playfield.current[r].length; c++) {
            playfield.current[r][c] = playfield.current[r-1][c];
          }
        }
        setScore(prevScore => prevScore + 10);
      }
      else {
        row--;
      }
    }

    tetromino.current = getNextTetromino();
  };

  const dropTetromino = () => {
    let row = tetromino.current.row;
    while (isValidMove(tetromino.current.matrix, row + 1, tetromino.current.col)) {
      row++;
    }
    tetromino.current.row = row;
    placeTetromino();
  };

  const loop = useCallback(() => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (playfield.current[row][col]) {
          const name = playfield.current[row][col];
          context.fillStyle = colors[name];
          context.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    if (tetromino.current) {
      if (++count.current > 35) {
        tetromino.current.row++;
        count.current = 0;

        if (!isValidMove(tetromino.current.matrix, tetromino.current.row, tetromino.current.col)) {
          tetromino.current.row--;
          placeTetromino();
        }
      }

      context.fillStyle = colors[tetromino.current.name];

      for (let row = 0; row < tetromino.current.matrix.length; row++) {
        for (let col = 0; col < tetromino.current.matrix[row].length; col++) {
          if (tetromino.current.matrix[row][col]) {
            context.fillRect((tetromino.current.col + col) * CELL_SIZE, (tetromino.current.row + row) * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        }
      }
    }

    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    tetromino.current = getNextTetromino();
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.keyCode === 37 || e.keyCode === 39) {
        const col = e.keyCode === 37
          ? tetromino.current.col - 1
          : tetromino.current.col + 1;

        if (isValidMove(tetromino.current.matrix, tetromino.current.row, col)) {
          tetromino.current.col = col;
        }
      }

      if (e.keyCode === 38) {
        const matrix = rotate(tetromino.current.matrix);
        if (isValidMove(matrix, tetromino.current.row, tetromino.current.col)) {
          tetromino.current.matrix = matrix;
        }
      }

      if(e.keyCode === 40) {
        const row = tetromino.current.row + 1;

        if (!isValidMove(tetromino.current.matrix, row, tetromino.current.col)) {
          tetromino.current.row = row - 1;
          placeTetromino();
          return;
        }

        tetromino.current.row = row;
      }

      if (e.keyCode === 32) {
        dropTetromino();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('tetrisHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);

  const resetGame = useCallback(() => {
    for (let row = -2; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        playfield.current[row][col] = 0;
      }
    }
    count.current = 0;
    tetromino.current = getNextTetromino();
    setGameOver(false);
    setScore(0);
    requestRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const shareOnTwitter = () => {
    const text = `I just scored ${score} in Tetris! Try to beat me! #TetrisChallenge`;
    const url = 'https://your-game-url.com';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnInstagram = () => {
    const text = `I just scored ${score} in Tetris! Try to beat me! #TetrisChallenge\n\nPlay at: https://your-game-url.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Challenge text copied! You can now paste it into your Instagram story.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 to-purple-500 flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Tetris</h1>
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

export default Tetris;