import React from 'react';
import { PatternPreview } from '@/components/module/PatternPreview';
import { PatternDetailModal } from '@/components/module/PatternDetailModal';
import ActionButton from '@/components/part/ActionButton';
import { PatternData } from '@/types/index';
import backgroundImage from '@/assets/background2.png';
import previousIcon from '@/assets/previous.png';

interface PatternViewScreenProps {
  /** 図案データのリスト */
  patterns: PatternData[];
  /** 戻るボタンのコールバック */
  onBack: () => void;
}

/**
 * 図案選択画面のテンプレートコンポーネント
 * 図案データが存在する場合のみ表示される
 * 最大4つの図案プレビューと詳細モーダルを表示
 */
export const PatternViewScreen: React.FC<PatternViewScreenProps> = ({
  patterns,
  onBack,
}) => {
  const [selectedPatternId, setSelectedPatternId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const selectedPattern = patterns.find(p => p.id === selectedPatternId);

  const handlePatternSelect = (id: string) => {
    setSelectedPatternId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage.src})`
      }}
    >
      <div className="app-container">
        <header className="text-center">
          <div className="inline-block text-gray-900 font-bold rounded-full text-2xl px-6 py-3 bg-white mt-4 sm:mt-6">
            Pick one you like.
          </div>
        </header>

        <main>
          {/* 図案グリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 sm:mt-6">
            {patterns.map((pattern) => (
              <PatternPreview
                key={pattern.id}
                id={pattern.id}
                title={pattern.title}
                pattern={pattern.pattern}
                selected={selectedPatternId === pattern.id}
                onSelect={handlePatternSelect}
              />
            ))}
          </div>

          {/* アクションボタン */}
          <div className="flex justify-center mt-4 sm:mt-6">
            <ActionButton
              icon={previousIcon}
              text="Previous"
              alt="戻る"
              onClick={onBack}
            />
          </div>
        </main>

        {/* 図案詳細モーダル */}
        {selectedPattern && (
          <PatternDetailModal
            isOpen={isModalOpen}
            pattern={selectedPattern.pattern}
            beadCounts={selectedPattern.beadCounts}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};
