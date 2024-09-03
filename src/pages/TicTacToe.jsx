import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winCount, setWinCount] = useState(() => {
    const saved = localStorage.getItem('ticTacToeWinCount');
    return saved ? JSON.parse(saved) : { X: 0, O: 0 };
  });

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

  const handleClick = (i) => {
    if (calculateWinner(board) || board[i] || gameOver) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setGameOver(true);
      setWinCount(prevCount => {
        const newCount = { ...prevCount, [winner]: prevCount[winner] + 1 };
        localStorage.setItem('ticTacToeWinCount', JSON.stringify(newCount));
        return newCount;
      });
    } else if (newBoard.every(Boolean)) {
      setGameOver(true);
    }
  };

  const renderSquare = (i) => (
    <Button
      className="w-20 h-20 text-3xl font-bold"
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </Button>
  );

  const winner = calculateWinner(board);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (board.every(Boolean)) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) {
      const games = JSON.parse(localStorage.getItem('ticTacToeGames') || '[]');
      games.push({ winner: winner || 'Draw', date: new Date().toISOString() });
      localStorage.setItem('ticTacToeGames', JSON.stringify(games));
    }
  }, [gameOver, winner]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-400 to-orange-500 flex flex-col items-center justify-center">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-4xl font-bold text-white mb-8">Tic-Tac-Toe</h1>
      <div className="mb-4 text-2xl font-semibold text-white">{status}</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => renderSquare(i))}
      </div>
      <div className="mt-4 text-white text-xl">
        X Wins: {winCount.X} | O Wins: {winCount.O}
      </div>
      <Button onClick={resetGame} className="mt-4">Reset Game</Button>
    </div>
  );
};

export default TicTacToe;