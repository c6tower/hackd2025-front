import React from 'react';
import { PatternPreview } from '@/components/module/PatternPreview';
import { PatternDetailModal } from '@/components/module/PatternDetailModal';
import Button from '@/components/part/Button';
import Loading from '@/components/part/Loading';
import ActionButton from '@/components/part/ActionButton';
import { BeadCounts } from '@/types/index';
import backgroundImage from '@/assets/background.png';
import previousIcon from '@/assets/previous.png';

interface PatternData {
  id: string;
  pattern: string;
  beadCounts: BeadCounts;
}

interface PatternViewScreenProps {
  /** 図案データのリスト */
  patterns: PatternData[];
  /** ローディング状態 */
  loading: boolean;
  /** エラーメッセージ */
  error?: string;
  /** 戻るボタンのコールバック */
  onBack: () => void;
  /** ホームボタンのコールバック */
  onHome: () => void;
}

/**
 * 図案選択画面のテンプレートコンポーネント
 * 最大4つの図案プレビューと詳細モーダルを表示
 */
export const PatternViewScreen: React.FC<PatternViewScreenProps> = ({
  patterns,
  loading,
  error,
  onBack,
  onHome
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

  const handleModalHome = () => {
    setIsModalOpen(false);
    onHome();
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage.src})`
        }}
      >
        <div className="text-center bg-white/90 p-8 rounded-xl">
          <Loading />
          <p className="mt-4 text-gray-600">図案を生成中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage.src})`
        }}
      >
        <div className="text-center max-w-md mx-auto p-6 bg-white/90 rounded-xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={onBack} variant="primary">
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage.src})`
      }}
    >
      {/* ヘッダー */}
      <header className="bg-transparent">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* ステップタイトル */}
          <div className="text-center mb-6">
            {/* タイトルと言語切り替えボタンの横並び */}
            <div className="flex justify-between items-center mb-4">
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
            
            <div className="inline-block text-gray-900 font-bold rounded-full text-2xl px-6 py-3 bg-white">
              Pick one you like.
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 図案が存在しない場合 */}
        {patterns.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/90 p-8 rounded-xl max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                図案が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                ビーズの組み合わせを変更して再度お試しください
              </p>
              <Button onClick={onBack} variant="primary">
                ビーズ数を変更する
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 図案グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {patterns.map((pattern) => (
                <PatternPreview
                  key={pattern.id}
                  id={pattern.id}
                  pattern={pattern.pattern}
                  selected={selectedPatternId === pattern.id}
                  onSelect={handlePatternSelect}
                />
              ))}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center mt-8">
              <ActionButton
                icon={previousIcon}
                text="Previous"
                alt="戻る"
                onClick={onBack}
              />
            </div>
          </>
        )}
      </main>

      {/* 図案詳細モーダル */}
      {selectedPattern && (
        <PatternDetailModal
          isOpen={isModalOpen}
          pattern={selectedPattern.pattern}
          beadCounts={selectedPattern.beadCounts}
          onClose={handleModalClose}
          onHome={handleModalHome}
        />
      )}
    </div>
  );
};
