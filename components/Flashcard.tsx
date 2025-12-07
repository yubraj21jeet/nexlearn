import React, { useState } from 'react';
import { Flashcard as FlashcardType } from '../types';

interface FlashcardProps {
  card: FlashcardType;
}

const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group h-64 w-full cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative h-full w-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 h-full w-full rounded-xl bg-slate-800 border border-slate-700 p-6 shadow-xl backface-hidden flex flex-col justify-center items-center text-center">
          <span className="absolute top-4 left-4 text-xs font-mono text-cyan-400 uppercase tracking-wider">Question</span>
          <span className="absolute top-4 right-4 text-xs font-mono text-slate-500">Ease: {card.ease}</span>
          <p className="text-xl font-medium text-slate-100">{card.question}</p>
          <div className="absolute bottom-4 text-sm text-slate-400 animate-pulse">Click to flip</div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 h-full w-full rounded-xl bg-indigo-900 border border-indigo-700 p-6 shadow-xl backface-hidden rotate-y-180 flex flex-col justify-center items-center text-center">
          <span className="absolute top-4 left-4 text-xs font-mono text-indigo-300 uppercase tracking-wider">Answer</span>
          <p className="text-lg text-indigo-100">{card.answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;