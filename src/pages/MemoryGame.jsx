import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    initializeCards();
  }, []);

  const initializeCards = () => {
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false }));
    setCards(deck);
  };

  const handleCardClick = (id) => {
    if (disabled) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (flippedCards) => {
    const [first, second] = flippedCards;
    if (cards[first].symbol === cards[second].symbol) {
      setSolved([...solved, cards[first].symbol]);
      setFlipped([]);
      setDisabled(false);
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
    initializeCards();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-8">
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
          >
            {flipped.includes(card.id) || solved.includes(card.symbol) ? card.symbol : '?'}
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
    </div>
  );
};

export default MemoryGame;