import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizModuleProps {
  question: QuizQuestion;
}

const QuizModule: React.FC<QuizModuleProps> = ({ question }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedIdx !== null) setIsSubmitted(true);
  };

  const isCorrect = selectedIdx === question.correctAnswerIndex;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-medium text-slate-100 mb-4">{question.question}</h3>
      
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          let styles = "border-slate-700 hover:bg-slate-750";
          if (isSubmitted) {
            if (idx === question.correctAnswerIndex) styles = "bg-green-900/30 border-green-500 text-green-100";
            else if (idx === selectedIdx) styles = "bg-red-900/30 border-red-500 text-red-100";
            else styles = "opacity-50 border-slate-700";
          } else if (selectedIdx === idx) {
            styles = "bg-cyan-900/30 border-cyan-500 text-cyan-100";
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${styles}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isSubmitted && idx === question.correctAnswerIndex && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                {isSubmitted && idx === selectedIdx && idx !== question.correctAnswerIndex && <XCircle className="w-5 h-5 text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div className={`p-4 rounded-lg text-sm ${isCorrect ? 'bg-green-900/20 text-green-200' : 'bg-red-900/20 text-red-200'}`}>
          <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizModule;