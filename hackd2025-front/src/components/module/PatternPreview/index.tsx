import React from 'react';
import { PatternGrid } from '@/components/module/PatternGrid';

interface PatternPreviewProps {
  /** パターンID */
  id: string;
  /** 256文字の図案データ */
  pattern: string;
  /** 図案のタイトル */
  title?: string;
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
  title,
  selected,
  onSelect
}) => {
  const handleClick = () => {
    onSelect(id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* タイトル */}
      {title && (
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {title}
          </h3>
        </div>
      )}
      
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
    </div>
  );
};
