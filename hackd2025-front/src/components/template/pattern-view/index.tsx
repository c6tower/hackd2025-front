import React from 'react';
import { PatternPreview } from '@/components/module/PatternPreview';
import { PatternDetailModal } from '@/components/module/PatternDetailModal';
import Button from '@/components/part/Button';
import Loading from '@/components/part/Loading';
import { BeadCounts } from '@/types/index';

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
  };

  const handleDetailShow = () => {
    if (selectedPatternId) {
      setIsModalOpen(true);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">図案を生成中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="secondary"
              size="sm"
            >
              ← 戻る
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              図案を選択
            </h1>
            <div className="w-16" /> {/* スペーサー */}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 説明文 */}
        <div className="text-center mb-8">
          <p className="text-gray-700">
            あなたの手持ちビーズで作れる図案です
          </p>
        </div>

        {/* 図案が存在しない場合 */}
        {patterns.length === 0 ? (
          <div className="text-center py-12">
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
        ) : (
          <>
            {/* 図案グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {patterns.map((pattern) => (
                <PatternPreview
                  key={pattern.id}
                  id={pattern.id}
                  pattern={pattern.pattern}
                  beadCounts={pattern.beadCounts}
                  selected={selectedPatternId === pattern.id}
                  onSelect={handlePatternSelect}
                />
              ))}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleDetailShow}
                variant="primary"
                disabled={!selectedPatternId}
              >
                詳細表示
              </Button>
              <Button
                onClick={onBack}
                variant="secondary"
              >
                戻る
              </Button>
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
