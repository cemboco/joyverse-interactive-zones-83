import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

// Constants and helper functions
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BORDER_THICKNESS = 10;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'cyan' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },
  O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
};

const getRandomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

const Tetris = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const updateBoardSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 400);
      const maxHeight = window.innerHeight - 200;
      const cellSize = Math.floor(Math.min(maxWidth / BOARD_WIDTH, maxHeight / BOARD_HEIGHT));
      setBoardSize({
        width: cellSize * BOARD_WIDTH,
        height: cellSize * BOARD_HEIGHT
      });
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  const isValidMove = useCallback((piece, boardRow, boardCol) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newRow = boardRow + row;
          const newCol = boardCol + col;
          if (
            newRow < 0 ||
            newRow >= BOARD_HEIGHT ||
            newCol < 0 ||
            newCol >= BOARD_WIDTH ||
            board[newRow][newCol]
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const rotatePiece = useCallback((piece) => {
    const newShape = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: newShape };
  }, []);

  const placePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });

    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        linesCleared++;
        y++;
      }
    }

    setBoard(newBoard);
    setScore(prevScore => prevScore + linesCleared * 100);
    const newPiece = {
      ...getRandomTetromino(),
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0
    };
    setCurrentPiece(newPiece);

    if (!isValidMove(newPiece, newPiece.y, newPiece.x)) {
      setGameOver(true);
    }
  }, [board, currentPiece, isValidMove]);

  const movePiece = useCallback((dx, dy) => {
    if (!currentPiece) return;
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    if (isValidMove(currentPiece, newY, newX)) {
      setCurrentPiece(prevPiece => ({ ...prevPiece, x: newX, y: newY }));
    } else if (dy > 0) {
      placePiece();
    }
  }, [currentPiece, isValidMove, placePiece]);

  const hardDrop = useCallback(() => {
    if (!currentPiece) return;
    let newY = currentPiece.y;
    while (isValidMove(currentPiece, newY + 1, currentPiece.x)) {
      newY++;
    }
    setCurrentPiece(prevPiece => ({ ...prevPiece, y: newY }));
    placePiece();
  }, [currentPiece, isValidMove, placePiece]);

  const handleKeyDown = useCallback((e) => {
    if (gameStarted && !gameOver) {
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          const rotated = rotatePiece(currentPiece);
          if (isValidMove(rotated, currentPiece.y, currentPiece.x)) {
            setCurrentPiece(rotated);
          }
          break;
        case ' ':
          hardDrop();
          break;
      }
    }
  }, [gameStarted, gameOver, movePiece, rotatePiece, currentPiece, isValidMove, hardDrop]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startGame = useCallback(() => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      setBoard(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null)));
      setCurrentPiece({
        ...getRandomTetromino(),
        x: Math.floor(BOARD_WIDTH / 2) - 1,
        y: 0
      });
      setScore(0);
      setGameOver(false);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameLoop = () => {
        movePiece(0, 1);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameOver) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameStarted, gameOver, movePiece]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tetrisHighScore', score.toString());
    }
  }, [score, highScore]);

  const resetGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(null);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

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

  const renderCell = (cell, x, y) => (
    <div
      key={`${y}-${x}`}
      className="absolute"
      style={{
        left: (x * boardSize.width) / BOARD_WIDTH,
        top: (y * boardSize.height) / BOARD_HEIGHT,
        width: boardSize.width / BOARD_WIDTH,
        height: boardSize.height / BOARD_HEIGHT,
        backgroundColor: cell || 'transparent',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 to-purple-500 flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Tetris</h1>
      {!gameStarted && !gameOver && (
        <Button onClick={startGame} className="mb-4 px-6 py-2 text-lg">
          Start Game
        </Button>
      )}
      <div 
        className="relative bg-black" 
        style={{ 
          width: boardSize.width + 2 * BORDER_THICKNESS, 
          height: boardSize.height + 2 * BORDER_THICKNESS,
          padding: BORDER_THICKNESS
        }}
      >
        <div className="relative bg-white" style={{ width: boardSize.width, height: boardSize.height }}>
          {board.map((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}
          {currentPiece && currentPiece.shape.map((row, y) =>
            row.map((cell, x) =>
              cell ? renderCell(currentPiece.color, currentPiece.x + x, currentPiece.y + y) : null
            )
          )}
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