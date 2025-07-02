'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BeadColor, BEAD_COLORS, BEAD_COLOR_NAMES, BEAD_COLOR_EMOJIS } from '@/types';

interface BeadInputProps {
  color: BeadColor;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function BeadInput({ 
  color, 
  value, 
  onChange, 
  min = 0, 
  max = 256 
}: BeadInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
    setInputValue(newValue.toString());
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  }, [onChange, min, max]);

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) {
      setInputValue(value.toString());
    } else {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      setInputValue(clampedValue.toString());
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
  }, [inputValue, value, onChange, min, max]);

  const handleStepperClick = useCallback((delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
    setInputValue(newValue.toString());
  }, [value, onChange, min, max]);

  const handleStepperMouseDown = useCallback((delta: number) => {
    handleStepperClick(delta);
    
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        handleStepperClick(delta);
      }, 100);
    }, 500);
  }, [handleStepperClick]);

  const handleStepperMouseUp = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
    }
  }, [handleInputBlur, value]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2">
      {/* 色の表示 */}
      <div className="flex items-center gap-1 sm:gap-2 w-16 sm:w-20">
        <span className="text-base sm:text-lg">{BEAD_COLOR_EMOJIS[color]}</span>
        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
          {BEAD_COLOR_NAMES[color]}
        </span>
      </div>

      {/* ステッパー（マイナス） */}
      <button
        onMouseDown={() => handleStepperMouseDown(-1)}
        onMouseUp={handleStepperMouseUp}
        onMouseLeave={handleStepperMouseUp}
        onTouchStart={() => handleStepperMouseDown(-1)}
        onTouchEnd={handleStepperMouseUp}
        disabled={value <= min}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center transition-colors touch-manipulation"
        aria-label={`${BEAD_COLOR_NAMES[color]}を1個減らす`}
      >
        -
      </button>

      {/* スライダー */}
      <div className="flex-1 relative min-w-0">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${BEAD_COLORS[color]} 0%, ${BEAD_COLORS[color]} ${(value / max) * 100}%, #e5e7eb ${(value / max) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`${BEAD_COLOR_NAMES[color]}の個数を設定`}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${BEAD_COLORS[color]};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${BEAD_COLORS[color]};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>

      {/* 数値入力欄 */}
      <input
        type="number"
        min={min}
        max={max}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-center text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label={`${BEAD_COLOR_NAMES[color]}の個数を直接入力`}
      />

      {/* ステッパー（プラス） */}
      <button
        onMouseDown={() => handleStepperMouseDown(1)}
        onMouseUp={handleStepperMouseUp}
        onMouseLeave={handleStepperMouseUp}
        onTouchStart={() => handleStepperMouseDown(1)}
        onTouchEnd={handleStepperMouseUp}
        disabled={value >= max}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center transition-colors touch-manipulation"
        aria-label={`${BEAD_COLOR_NAMES[color]}を1個増やす`}
      >
        +
      </button>

      {/* 個数表示 */}
      <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">個</span>
    </div>
  );
}
