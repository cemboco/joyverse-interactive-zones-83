import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-white mb-8">Fun Game Zone</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/memory-game">
          <Button className="w-48 text-lg">Memory Game</Button>
        </Link>
        <Link to="/tic-tac-toe">
          <Button className="w-48 text-lg">Tic-Tac-Toe</Button>
        </Link>
        <Link to="/snake">
          <Button className="w-48 text-lg">Snake</Button>
        </Link>
        <Link to="/tetris">
          <Button className="w-48 text-lg">Tetris</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;