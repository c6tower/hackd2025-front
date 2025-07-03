'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BeadColor, BeadCounts } from '@/types';
import BeadInput from '@/components/part/BeadInput';
import ActionButton from '@/components/part/ActionButton';
import backgroundImage from '@/assets/background.png';
import resetIcon from '@/assets/reset.png';
import nextIcon from '@/assets/next.png';
import cameraIcon from '@/assets/camera.png';

const BEAD_COLORS_ORDER: BeadColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 
  'purple', 'black', 'white', 'pink', 'brown'
];

interface BeadInputScreenProps {
  onSubmit?: (beadCounts: BeadCounts) => Promise<void> | void;
}

export default function BeadInputScreen({ onSubmit }: BeadInputScreenProps) {
  const router = useRouter();
  const [beadCounts, setBeadCounts] = useState<BeadCounts>(() => {
    const initialCounts = {} as BeadCounts;
    BEAD_COLORS_ORDER.forEach(color => {
      initialCounts[color] = 0;
    });
    return initialCounts;
  });

  // sessionStorageからデータを読み込む
  useEffect(() => {
    const storedData = sessionStorage.getItem('beadCounts');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.beads) {
          // APIレスポンスの色名を既存の色名にマッピング
          const mappedCounts = {} as BeadCounts;
          BEAD_COLORS_ORDER.forEach(color => {
            mappedCounts[color] = 0;
          });
          
          // APIの色名と既存の色名の対応
          const colorMapping: { [key: string]: BeadColor } = {
            'red': 'red',
            'orange': 'orange',
            'yellow': 'yellow',
            'green': 'green',
            'blue': 'blue',
            'purple': 'purple',
            'black': 'black',
            'white': 'white',
            'pink': 'pink',
            'brown': 'brown',
            'maron': 'brown', // maronをbrownにマッピング
            'dark': 'black'   // darkをblackにマッピング
          };
          
          Object.entries(parsedData.beads).forEach(([apiColor, count]) => {
            const mappedColor = colorMapping[apiColor];
            if (mappedColor && mappedColor in mappedCounts) {
              mappedCounts[mappedColor] += count as number;
            }
          });
          
          setBeadCounts(mappedCounts);
          // データを使用したら削除
          sessionStorage.removeItem('beadCounts');
        }
      } catch (error) {
        console.error('Failed to parse stored bead counts:', error);
      }
    }
  }, []);

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

  const handleCamera = useCallback(() => {
    router.push('/photo');
  }, [router]);

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
      <div className="app-container">
        {/* ステップタイトル */}
        <header className="text-center">
          {/* タイトルと言語切り替えボタンの横並び */}
          <div className="flex justify-between items-center">
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
          
          <div className="inline-block text-gray-900 font-bold rounded-full text-2xl px-6 py-3 bg-white mt-4 sm:mt-6">
            Slide to choose how many colors you like.
          </div>
        </header>

        {/* メインコンテンツ */}
        <main>
          {/* ビーズ入力フォーム */}
          <div className="mt-4 sm:mt-6">
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
          <div className="mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
              <ActionButton
                icon={cameraIcon}
                text="Camera"
                alt="カメラ"
                onClick={handleCamera}
                disabled={false}
              />

              <ActionButton
                icon={resetIcon}
                text="Reset"
                alt="リセット"
                onClick={handleReset}
                disabled={!hasAnyBeads}
              />
              
              <ActionButton
                icon={nextIcon}
                text="Next"
                alt="次へ"
                onClick={handleSubmit}
                disabled={!hasAnyBeads}
              />
            </div>

            {/* ヘルプテキスト */}
            {!hasAnyBeads && (
              <div className="mt-6 text-center text-gray-500 text-xs sm:text-sm">
                ビーズ数を1個以上設定してください
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
