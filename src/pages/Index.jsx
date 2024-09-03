import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">Retro Games</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link to="/memory-game" className="w-full">
          <Button className="w-full text-lg py-6">Memory Game</Button>
        </Link>
        <Link to="/tic-tac-toe" className="w-full">
          <Button className="w-full text-lg py-6">Tic-Tac-Toe</Button>
        </Link>
        <Link to="/snake" className="w-full">
          <Button className="w-full text-lg py-6">Snake</Button>
        </Link>
        <Link to="/tetris" className="w-full">
          <Button className="w-full text-lg py-6">Tetris</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;