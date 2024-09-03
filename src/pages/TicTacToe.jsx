import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('Next player: X');
  const [winCount, setWinCount] = useState({ X: 0, O: 0 });

  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner) {
      setStatus(`Winner: ${winner}`);
      setWinCount(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
    } else if (board.every(square => square !== null)) {
      setStatus('Draw!');
    } else {
      setStatus(`Next player: ${xIsNext ? 'X' : 'O'}`);
    }
  }, [board, xIsNext]);

  const handleClick = (i) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const renderSquare = (i) => (
    <Button
      className="w-full h-full text-2xl md:text-3xl font-bold"
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </Button>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

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

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default TicTacToe;