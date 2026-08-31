import React from 'react';
import { useGameStore } from '../stores/useGameStore';
import { Tile } from './Tile';
import { TrendingUp, Award } from 'lucide-react';

export const GameBoard: React.FC = () => {
  const { session, currentGuess, isRevealing, errorMessage } = useGameStore();

  if (!session) return null;

  const maxAttempts = session.max_attempts || 6;
  const moves = session.moves || [];
  const currentRowIndex = moves.length;

  const rows = [];

  for (let r = 0; r < maxAttempts; r++) {
    if (r < moves.length) {
      // Past evaluated move
      const move = moves[r];
      const isLatestMove = r === moves.length - 1;
      rows.push(
        <div key={`row-${r}`} className="flex items-center gap-2 sm:gap-3 justify-center">
          <div className="flex gap-1.5 sm:gap-2">
            {move.feedback.map((fb, idx) => (
              <Tile
                key={`tile-${r}-${idx}`}
                letter={fb.letter}
                status={fb.status}
                revealIndex={idx}
                isRevealing={isLatestMove && isRevealing}
              />
            ))}
          </div>

          {/* Row Score Indicator Badge */}
          <div className="w-16 sm:w-20 flex flex-col gap-0.5 text-[10px] sm:text-xs font-mono font-bold pl-1">
            <div className="flex items-center gap-1 text-emerald-400">
              <span>🐂</span>
              <span>{move.bulls_count} Bull{move.bulls_count !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <span>🐻</span>
              <span>{move.bears_count} Bear{move.bears_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      );
    } else if (r === currentRowIndex && session.status === 'in_progress') {
      // Active typing row
      const currentLetters = currentGuess.padEnd(5, ' ').split('').slice(0, 5);
      rows.push(
        <div
          key={`row-${r}`}
          className={`flex items-center gap-2 sm:gap-3 justify-center ${
            errorMessage ? 'animate-shake' : ''
          }`}
        >
          <div className="flex gap-1.5 sm:gap-2">
            {currentLetters.map((char, idx) => (
              <Tile
                key={`tile-curr-${idx}`}
                letter={char.trim()}
                isCurrent={true}
              />
            ))}
          </div>

          {/* Empty spacer to align with row indicators */}
          <div className="w-16 sm:w-20 text-[10px] font-mono text-slate-600 pl-1">
            Row #{r + 1}
          </div>
        </div>
      );
    } else {
      // Future empty row
      rows.push(
        <div key={`row-${r}`} className="flex items-center gap-2 sm:gap-3 justify-center opacity-40">
          <div className="flex gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <Tile key={`tile-empty-${r}-${idx}`} letter="" />
            ))}
          </div>
          <div className="w-16 sm:w-20 text-[10px] font-mono text-slate-700 pl-1">
            Row #{r + 1}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3 py-4 items-center justify-center">
      {rows}
    </div>
  );
};
