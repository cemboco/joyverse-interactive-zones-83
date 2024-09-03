import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BORDER_THICKNESS = 10;

// ... (keep all the existing constants and game logic)

const Tetris = () => {
  // ... (keep all the existing state variables)

  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBoardSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 300);
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

  // ... (keep all the existing game logic)

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
        <div className="relative bg-white" style={{ width: boardSize.width, height: boardSize.height }}>
          {board.map((row, y) => (
            row.map((cell, x) => (
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
            ))
          ))}
          {currentPiece && currentPiece.shape.map((row, y) => (
            row.map((cell, x) => (
              cell ? (
                <div
                  key={`piece-${y}-${x}`}
                  className="absolute"
                  style={{
                    left: ((currentPiece.x + x) * boardSize.width) / BOARD_WIDTH,
                    top: ((currentPiece.y + y) * boardSize.height) / BOARD_HEIGHT,
                    width: boardSize.width / BOARD_WIDTH,
                    height: boardSize.height / BOARD_HEIGHT,
                    backgroundColor: currentPiece.color,
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                  }}
                />
              ) : null
            ))
          ))}
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