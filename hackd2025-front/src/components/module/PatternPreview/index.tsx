import React from 'react';
import { PatternGrid } from '@/components/module/PatternGrid';

interface PatternPreviewProps {
  /** パターンID */
  id: string;
  /** タイトル */
  title: string;
  /** 256文字の図案データ */
  pattern: string;
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
  title,
  pattern,
  selected,
  onSelect
}) => {
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
      
      {/* タイトル */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>
      </div>
    </div>
  );
};
