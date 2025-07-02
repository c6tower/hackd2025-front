import React from 'react';
import { PatternGrid } from '@/components/module/PatternGrid';
import { BeadCounts, BeadColor, BEAD_COLOR_EMOJIS } from '@/types/index';

interface PatternPreviewProps {
  /** パターンID */
  id: string;
  /** 256文字の図案データ */
  pattern: string;
  /** 必要なビーズ数 */
  beadCounts: BeadCounts;
  /** 選択状態 */
  selected: boolean;
  /** クリック時のコールバック */
  onSelect: (id: string) => void;
}

/**
 * 図案のプレビューカードコンポーネント
 * PatternGridと必要ビーズ数の情報を含む
 */
export const PatternPreview: React.FC<PatternPreviewProps> = ({
  id,
  pattern,
  beadCounts,
  selected,
  onSelect
}) => {
  // 使用されている色のみを抽出（数量が0より大きいもの）
  const usedColors = React.useMemo(() => {
    return Object.entries(beadCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // 使用数の多い順にソート
      .slice(0, 3) // 最大3色まで表示
      .map(([color, count]) => ({ color: color as BeadColor, count }));
  }, [beadCounts]);

  const handleClick = () => {
    onSelect(id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* パターングリッド */}
      <div className="flex justify-center mb-3">
        <PatternGrid
          pattern={pattern}
          size="small"
          interactive={true}
          selected={selected}
          onClick={handleClick}
          patternId={id}
        />
      </div>

      {/* パターン情報 */}
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          図案 {id}
        </h3>
        
        {/* 主要な使用色表示 */}
        <div className="text-xs text-gray-600">
          <div className="mb-1">主な色:</div>
          <div className="flex justify-center gap-1 flex-wrap">
            {usedColors.map(({ color, count }) => (
              <span
                key={color}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1"
              >
                <span>{BEAD_COLOR_EMOJIS[color]}</span>
                <span>{count}</span>
              </span>
            ))}
            {usedColors.length === 0 && (
              <span className="text-gray-400">色情報なし</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
