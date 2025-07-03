import React from 'react';
import { BeadColor, BEAD_COLORS, CODE_TO_BEAD_COLOR } from '@/types/index';

interface PatternGridProps {
  /** 256文字の図案データ */
  pattern: string;
  /** グリッドサイズ */
  size?: 'small' | 'large';
  /** クリック可能かどうか */
  interactive?: boolean;
  /** 選択状態 */
  selected?: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** パターンID（選択表示用） */
  patternId?: string;
}

/**
 * 16x16の図案グリッドを表示するコンポーネント
 * 選択画面では小さく、モーダルでは大きく表示
 */
export const PatternGrid: React.FC<PatternGridProps> = ({
  pattern,
  size = 'small',
  interactive = false,
  selected = false,
  onClick,
  patternId
}) => {
  // 256文字の文字列を16x16の配列に変換
  const patternArray: BeadColor[][] = React.useMemo(() => {
    const rows: BeadColor[][] = [];
    for (let i = 0; i < 16; i++) {
      const row: BeadColor[] = [];
      for (let j = 0; j < 16; j++) {
        const charIndex = i * 16 + j;
        const char = pattern[charIndex] || 'n';
        const color = CODE_TO_BEAD_COLOR[char] || 'white';
        row.push(color);
      }
      rows.push(row);
    }
    return rows;
  }, [pattern]);

  const containerSize = size === 'small' ? 'w-32 h-32' : 'w-100 h-100';
  
  return (
    <div className="relative">
      <div
        className={`
          ${containerSize}
          border-2 rounded-lg p-2 bg-gray-200 overflow-hidden
          ${interactive ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
          ${selected ? 'ring-4 ring-blue-500 border-blue-500' : 'border-gray-300'}
        `}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        aria-label={interactive ? `図案${patternId || ''}を選択` : undefined}
      >
        <div className="w-full h-full grid grid-cols-16 gap-0">
          {patternArray.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square border-[0.5px] border-gray-300"
                style={{ backgroundColor: BEAD_COLORS[color] }}
                aria-hidden="true"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
