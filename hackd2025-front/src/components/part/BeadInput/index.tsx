'use client';

import { useState, useCallback, useEffect } from 'react';
import { BeadColor, BEAD_COLORS, BEAD_COLOR_NAMES, CSSPropertiesWithVars } from '@/types';

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

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
    setInputValue(newValue.toString());
  }, [onChange]);

  // 背景グラデーション用の進捗率（つまみの位置と背景の丸みを考慮）
  const getBackgroundProgress = useCallback(() => {
    if (max === min) return 0;
    
    const progress = (value - min) / (max - min);
    
    // 背景の丸み部分を考慮した補正
    // スライダーの実際の動作範囲は、つまみの中心が移動できる範囲
    // つまみのサイズ20px、トラックの高さ6pxを考慮
    
    // 左右の余白をパーセンテージで設定（より小さく調整）
    // つまみが完全に左端/右端にあるときに背景が適切に表示されるように
    const edgePadding = 5; // 左右それぞれ5%の余白に縮小
    
    // 端の値での特別な処理
    if (value === min) return edgePadding;
    if (value === max) return 100 - edgePadding;
    
    // 有効な進行範囲は全体から両端の余白を除いた範囲
    const effectiveRange = 100 - (edgePadding * 2);
    const adjustedProgress = edgePadding + (progress * effectiveRange);
    
    return Math.max(edgePadding, Math.min(100 - edgePadding, adjustedProgress));
  }, [value, min, max]);

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

  // シンプルなクリックハンドラー
  const handleStepperClick = useCallback((delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    if (newValue !== value) {
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  }, [onChange, min, max, value]);

  // valueが外部から変更された場合にinputValueを同期
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
    }
  }, [handleInputBlur, value]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2">
      {/* スライダー */}
      <div className="flex-1 relative min-w-0">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full appearance-none cursor-pointer bead-slider h-10"
          style={{
            background: `linear-gradient(to right, ${BEAD_COLORS[color]} 0%, ${BEAD_COLORS[color]} ${getBackgroundProgress()}%, #e5e7eb ${getBackgroundProgress()}%, #e5e7eb 100%)`,
            borderRadius: '9999px',
            '--bead-color': BEAD_COLORS[color]
          } as CSSPropertiesWithVars}
          aria-label={`${BEAD_COLOR_NAMES[color]}の個数を設定`}
        />
      </div>

      {/* ステッパー（マイナス） */}
      <button
        onClick={() => handleStepperClick(-1)}
        disabled={value <= min}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-2xl flex items-center justify-center transition-colors touch-manipulation"
        aria-label={`${BEAD_COLOR_NAMES[color]}を1個減らす`}
      >
        -
      </button>

      {/* 数値入力欄 */}
      <input
        type="number"
        min={min}
        max={max}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="w-12 sm:w-16 h-10 px-1 sm:px-2 text-center text-2xl bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={`${BEAD_COLOR_NAMES[color]}の個数を直接入力`}
      />

      {/* ステッパー（プラス） */}
      <button
        onClick={() => handleStepperClick(1)}
        disabled={value >= max}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-2xl flex items-center justify-center transition-colors touch-manipulation"
        aria-label={`${BEAD_COLOR_NAMES[color]}を1個増やす`}
      >
        +
      </button>
    </div>
  );
}
