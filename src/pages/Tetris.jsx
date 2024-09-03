import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;
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

const createEmptyBoard = () => {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
};

const Tetris = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const spawnNewPiece = useCallback(() => {
    const tetrominos = Object.keys(TETROMINOS);
    const randomTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    const piece = TETROMINOS[randomTetromino];
    const newPiece = {
      shape: piece.shape,
      color: piece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
    };
    
    if (!isValidMove(newPiece.shape, newPiece.x, newPiece.y)) {
      setGameOver(true);
    } else {
      setCurrentPiece(newPiece);
    }
  }, []);

  const moveDown = useCallback(() => {
    if (!currentPiece) return;
    const newY = currentPiece.y + 1;
    if (isValidMove(currentPiece.shape, currentPiece.x, newY)) {
      setCurrentPiece({ ...currentPiece, y: newY });
    } else {
      placePiece();
      const clearedLines = clearLines();
      updateScore(clearedLines);
      spawnNewPiece();
    }
  }, [currentPiece, spawnNewPiece]);

  const moveHorizontally = (direction) => {
    if (!currentPiece) return;
    const newX = currentPiece.x + direction;
    if (isValidMove(currentPiece.shape, newX, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, x: newX });
    }
  };

  const rotate = () => {
    if (!currentPiece) return;
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    if (isValidMove(rotatedShape, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotatedShape });
    }
  };

  const isValidMove = (shape, x, y) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = () => {
    const newBoard = [...board];
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });
    setBoard(newBoard);
    updateScore(0); // Add 1 point for placing a piece
  };

  const clearLines = () => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    const newRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(0));
    setBoard([...newRows, ...newBoard]);
    return linesCleared;
  };

  const updateScore = (clearedLines) => {
    setScore(prevScore => {
      let newScore = prevScore + 1; // 1 point for placing a piece
      if (clearedLines > 0) {
        newScore += clearedLines * 2; // 2 points for each cleared line
      }
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('tetrisHighScore', newScore.toString());
      }
      return newScore;
    });
  };

  useEffect(() => {
    if (gameOver) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft': moveHorizontally(-1); break;
        case 'ArrowRight': moveHorizontally(1); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    const gameInterval = setInterval(moveDown, 1000);

    if (!currentPiece) spawnNewPiece();

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameInterval);
    };
  }, [currentPiece, gameOver, moveDown, spawnNewPiece]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setGameOver(false);
    setScore(0);
    spawnNewPiece();
  };

  useEffect(() => {
    if (gameOver) {
      const games = JSON.parse(localStorage.getItem('tetrisGames') || '[]');
      games.push({ score, date: new Date().toISOString() });
      localStorage.setItem('tetrisGames', JSON.stringify(games));
    }
  }, [gameOver, score]);

  const shareOnTwitter = () => {
    const text = `I just scored ${score} in Tetris! Try to beat me! #TetrisChallenge`;
    const url = 'https://your-game-url.com'; // Replace with your actual game URL
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnInstagram = () => {
    const text = `I just scored ${score} in Tetris! Try to beat me! #TetrisChallenge\n\nPlay at: https://your-game-url.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Challenge text copied! You can now paste it into your Instagram story.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 to-purple-500 flex flex-col items-center justify-center">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-4xl font-bold text-white mb-8">Tetris</h1>
      <div 
        className="relative bg-black" 
        style={{ 
          width: BOARD_WIDTH * BLOCK_SIZE + 2 * BORDER_THICKNESS, 
          height: BOARD_HEIGHT * BLOCK_SIZE + 2 * BORDER_THICKNESS,
          padding: BORDER_THICKNESS
        }}
      >
        <div className="relative bg-white" style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }}>
          {board.map((row, y) => (
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="absolute"
                style={{
                  left: x * BLOCK_SIZE,
                  top: y * BLOCK_SIZE,
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundColor: cell || 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              />
            ))
          ))}
          {currentPiece && currentPiece.shape.map((row, y) => (
            row.map((cell, x) => (
              cell ? (
                <div
                  key={`piece-${y}-${x}`}
                  className="absolute"
                  style={{
                    left: (currentPiece.x + x) * BLOCK_SIZE,
                    top: (currentPiece.y + y) * BLOCK_SIZE,
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: currentPiece.color,
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                  }}
                />
              ) : null
            ))
          ))}
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
          <TwitterIcon className="h-5 w-5 mr-2" />
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

export default Tetris;