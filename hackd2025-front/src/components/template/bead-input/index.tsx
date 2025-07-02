'use client';

import { useState, useCallback } from 'react';
import { BeadColor, BeadCounts } from '@/types';
import BeadInput from '@/components/part/BeadInput';
import backgroundImage from '@/assets/background.png';

const BEAD_COLORS_ORDER: BeadColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 
  'purple', 'black', 'white', 'pink', 'brown'
];

interface BeadInputScreenProps {
  onSubmit?: (beadCounts: BeadCounts) => Promise<void> | void;
}

export default function BeadInputScreen({ onSubmit }: BeadInputScreenProps) {
  const [beadCounts, setBeadCounts] = useState<BeadCounts>(() => {
    const initialCounts = {} as BeadCounts;
    BEAD_COLORS_ORDER.forEach(color => {
      initialCounts[color] = 0;
    });
    return initialCounts;
  });

  const handleBeadCountChange = useCallback((color: BeadColor, value: number) => {
    setBeadCounts(prev => ({
      ...prev,
      [color]: value
    }));
  }, []);

  const handleReset = useCallback(() => {
    const resetCounts = {} as BeadCounts;
    BEAD_COLORS_ORDER.forEach(color => {
      resetCounts[color] = 0;
    });
    setBeadCounts(resetCounts);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      await onSubmit(beadCounts);
    } else {
      // フォールバック処理（開発時）
      console.log('ビーズ数:', beadCounts);
      alert('図案を提案する機能は準備中です');
    }
  }, [beadCounts, onSubmit]);

  const hasAnyBeads = Object.values(beadCounts).some(count => count > 0);

  return (
    <div 
      className="bg-gray-50 min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage.src})`
      }}
    >
      <div className="max-w-2xl mx-auto pt-8 pb-8 px-4">
        {/* タイトル */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            アイロンビーズ
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            図案提案アプリ
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            手持ちのビーズ数を設定してください
          </p>
        </div>

        {/* ビーズ入力フォーム */}
        <div className="mb-4 sm:mb-6">
          <div className="space-y-1">
            {BEAD_COLORS_ORDER.map(color => (
              <BeadInput
                key={color}
                color={color}
                value={beadCounts[color]}
                onChange={(value) => handleBeadCountChange(color, value)}
                min={0}
                max={256}
              />
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <button
              onClick={handleReset}
              disabled={!hasAnyBeads}
              className="w-full sm:w-auto px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              リセット
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!hasAnyBeads}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              図案を提案する
            </button>
          </div>

          {/* ヘルプテキスト */}
          {!hasAnyBeads && (
            <div className="mt-4 text-center text-gray-500 text-xs sm:text-sm">
              ビーズ数を1個以上設定してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
