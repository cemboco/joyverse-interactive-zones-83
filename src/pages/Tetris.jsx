import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

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
      setScore(prevScore => prevScore + clearedLines * 100);
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 to-purple-500 flex flex-col items-center justify-center">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-4xl font-bold text-white mb-8">Tetris</h1>
      <div className="relative border-4 border-white" style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }}>
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
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              />
            ) : null
          ))
        ))}
      </div>
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

export default Tetris;