import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const TicTacToe = () => {
  // ... (keep all the existing state variables and game logic)

  const renderSquare = (i) => (
    <Button
      className="w-full h-full text-2xl md:text-3xl font-bold"
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </Button>
  );

  // ... (keep all the existing game logic)

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-400 to-orange-500 flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Tic-Tac-Toe</h1>
      <div className="mb-4 text-xl md:text-2xl font-semibold text-white">{status}</div>
      <div className="grid grid-cols-3 gap-2 mb-4 w-full max-w-xs">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square">
            {renderSquare(i)}
          </div>
        ))}
      </div>
      <div className="mt-4 text-white text-lg md:text-xl">
        X Wins: {winCount.X} | O Wins: {winCount.O}
      </div>
      <Button onClick={resetGame} className="mt-4 px-6 py-2 text-lg">Reset Game</Button>
    </div>
  );
};

export default TicTacToe;