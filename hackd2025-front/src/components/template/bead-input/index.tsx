'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { BeadColor, BeadCounts } from '@/types';
import BeadInput from '@/components/part/BeadInput';
import backgroundImage from '@/assets/background.png';
import resetIcon from '@/assets/reset.png';
import nextIcon from '@/assets/next.png';

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
        {/* ステップタイトル */}
        <div className="text-center mb-6">
          {/* タイトルと言語切り替えボタンの横並び */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="inline-block text-white font-bold rounded-full relative text-3xl px-8 py-4 bg-purple-400">
              ① Start !
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
            Slide to choose how many colors you like.
          </div>
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
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
            <button
              onClick={handleReset}
              disabled={!hasAnyBeads}
              className="flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80 w-[180px] h-[180px] bg-white rounded-full shadow-lg"
            >
              <Image src={resetIcon} alt="リセット" width={120} height={120} />
              <span className="text-gray-900 font-semibold text-xl">
                Reset
              </span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!hasAnyBeads}
              className="flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80 w-[180px] h-[180px] bg-white rounded-full shadow-lg"
            >
              <Image src={nextIcon} alt="次へ" width={120} height={120} />
              <span className="text-gray-900 font-semibold text-xl">
                Next
              </span>
            </button>
          </div>

          {/* ヘルプテキスト */}
          {!hasAnyBeads && (
            <div className="mt-6 text-center text-gray-500 text-xs sm:text-sm">
              ビーズ数を1個以上設定してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
