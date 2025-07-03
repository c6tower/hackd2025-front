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

  // デバッグ情報を出力
  React.useEffect(() => {
    console.log('PatternViewScreen - patterns:', patterns);
    patterns.forEach((pattern, index) => {
      console.log(`Pattern ${index}:`, {
        id: pattern.id,
        title: pattern.title,
        hasPattern: !!pattern.pattern,
        beadCountsKeys: Object.keys(pattern.beadCounts)
      });
    });
  }, [patterns]);

  React.useEffect(() => {
    console.log('Selected pattern:', selectedPattern);
    console.log('Selected pattern title:', selectedPattern?.title);
  }, [selectedPattern]);

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
          <div className="flex justify-between items-center">
            {/* ステップタイトル */}
            <h1 className="inline-block text-white font-bold rounded-full relative text-3xl px-8 py-4 bg-purple-400">
              ② Step
              <span className="absolute top-1/2 -translate-y-1/2 left-full -ml-1 w-0 h-0 border-t-[16px] border-b-[16px] border-l-[20px] border-transparent border-l-purple-400" />
            </h1>
            
            {/* 言語切り替えボタン */}
            <div className="flex gap-2">
              <button className="w-12 h-12 bg-purple-400 text-white text-xl font-bold rounded-full hover:opacity-80 transition-opacity">
                日
              </button>
              <button className="w-12 h-12 bg-purple-400 text-white text-xl font-bold rounded-full hover:opacity-80 transition-opacity">
                EN
              </button>
            </div>
          </div>
          
          <div className="inline-block text-gray-900 font-bold rounded-full text-2xl px-6 py-3 bg-white mt-4 sm:mt-6">
            Pick one you like.
          </div>
          
          {/* 選択されたパターンのタイトル表示 */}
          {selectedPattern?.title && (
            <div className="mt-4 sm:mt-6">
              <div className="inline-block text-purple-700 font-semibold text-xl px-4 py-2 bg-white/90 rounded-lg">
                Selected: {selectedPattern.title}
              </div>
            </div>
          )}
        </header>

        <main>
          {/* 図案グリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 sm:mt-6">
            {patterns.map((pattern) => (
              <PatternPreview
                key={pattern.id}
                id={pattern.id}
                pattern={pattern.pattern}
                title={pattern.title}
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
            title={selectedPattern.title}
            beadCounts={selectedPattern.beadCounts}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};
