import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";

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

const Tetris = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const createEmptyBoard = () => {
    return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
  };

  const spawnNewPiece = useCallback(() => {
    const tetrominos = Object.keys(TETROMINOS);
    const randomTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    const piece = TETROMINOS[randomTetromino];
    setCurrentPiece({
      shape: piece.shape,
      color: piece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
    });
  }, []);

  const moveDown = useCallback(() => {
    if (!currentPiece) return;
    const newY = currentPiece.y + 1;
    if (isValidMove(currentPiece.shape, currentPiece.x, newY)) {
      setCurrentPiece({ ...currentPiece, y: newY });
    } else {
      placePiece();
      clearLines();
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
          if (boardY < 0) {
            setGameOver(true);
            return;
          }
          newBoard[boardY][boardX] = currentPiece.color;
        }
      });
    });
    setBoard(newBoard);
  };

  const clearLines = () => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    const newRows = Array.from({ length: clearedLines }, () => Array(BOARD_WIDTH).fill(0));
    setBoard([...newRows, ...newBoard]);
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
    spawnNewPiece();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 to-purple-500 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8">Tetris</h1>
      <div className="border-4 border-white" style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }}>
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