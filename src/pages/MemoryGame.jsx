import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { HomeIcon, InstagramIcon } from 'lucide-react';
import Confetti from 'react-confetti';

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('memoryGameBestScore');
    return saved ? parseInt(saved, 10) : Infinity;
  });

  useEffect(() => {
    initializeCards();
  }, []);

  const initializeCards = () => {
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false }));
    setCards(deck);
    setMoves(0);
  };

  const handleCardClick = (id) => {
    if (disabled) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      setDisabled(true);
      checkForMatch(newFlipped);
    }
  };

  const handleKeyPress = (e, id) => {
    if (e.key === 'l') {
      const matchingCard = cards.find(card => card.symbol === cards[id].symbol && card.id !== id);
      if (matchingCard) {
        handleCardClick(matchingCard.id);
      }
    }
  };

  const checkForMatch = (flippedCards) => {
    const [first, second] = flippedCards;
    if (cards[first].symbol === cards[second].symbol) {
      const newSolved = [...solved, cards[first].symbol];
      setSolved(newSolved);
      setFlipped([]);
      setDisabled(false);
      
      if (newSolved.length === cards.length / 2) {
        setShowConfetti(true);
        if (moves < bestScore) {
          setBestScore(moves);
          localStorage.setItem('memoryGameBestScore', moves.toString());
        }
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  const resetGame = () => {
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
    setShowConfetti(false);
    setMoves(0);
    initializeCards();
  };

  useEffect(() => {
    if (solved.length === cards.length / 2) {
      const games = JSON.parse(localStorage.getItem('memoryGames') || '[]');
      games.push({ moves, date: new Date().toISOString() });
      localStorage.setItem('memoryGames', JSON.stringify(games));
    }
  }, [solved, cards.length, moves]);

  const shareOnTwitter = () => {
    const text = `I just scored ${moves} moves in the Memory Game! Try to beat me! #MemoryGameChallenge`;
    const url = 'https://your-game-url.com'; // Replace with your actual game URL
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't have a direct sharing API, so we'll copy the text to clipboard
    const text = `I just scored ${moves} moves in the Memory Game! Try to beat me! #MemoryGameChallenge\n\nPlay at: https://your-game-url.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Challenge text copied! You can now paste it into your Instagram story.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-8">
      {showConfetti && <Confetti />}
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" size="icon">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="text-4xl font-bold text-white text-center mb-8">Memory Game</h1>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`h-24 flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${
              flipped.includes(card.id) || solved.includes(card.symbol)
                ? 'bg-white'
                : 'bg-gray-300'
            }`}
            onClick={() => handleCardClick(card.id)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyPress(e, card.id)}
          >
            {flipped.includes(card.id) || solved.includes(card.symbol) ? card.symbol : '?'}
          </Card>
        ))}
      </div>
      <div className="text-center mt-8 text-white">
        <div className="text-2xl mb-2">Moves: {moves}</div>
        <div className="text-xl mb-4">Best Score: {bestScore === Infinity ? 'N/A' : bestScore}</div>
        <div className="text-2xl font-bold mb-4">Try to beat me!</div>
        <Button onClick={resetGame} className="mb-4">Reset Game</Button>
        <div className="flex justify-center space-x-4">
          <Button onClick={shareOnTwitter} className="bg-blue-400 hover:bg-blue-500">
            Share on X.com
          </Button>
          <Button onClick={shareOnInstagram} className="bg-pink-500 hover:bg-pink-600">
            <InstagramIcon className="h-5 w-5 mr-2" />
            Share on Instagram
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;