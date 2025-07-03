'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BeadColor, BeadCounts } from '@/types';
import BeadInput from '@/components/part/BeadInput';
import ActionButton from '@/components/part/ActionButton';
import Button from '@/components/part/Button';
import Loading from '@/components/part/Loading';
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
  /** API通信のローディング状態 */
  loading?: boolean;
  /** エラーメッセージ */
  error?: string;
}

export default function BeadInputScreen({ onSubmit, loading, error }: BeadInputScreenProps) {
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
          
          // APIの色名と既存の色名の対応（より包括的なマッピング）
          const colorMapping: { [key: string]: BeadColor } = {
            // 基本的な色名
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
            
            // APIで返される可能性のある色名のバリエーション
            'maron': 'brown',     // maronをbrownにマッピング
            'maroon': 'brown',    // maroonをbrownにマッピング
            'dark': 'black',      // darkをblackにマッピング
            'light': 'white',     // lightをwhiteにマッピング
            'gray': 'black',      // grayをblackにマッピング
            'grey': 'black',      // greyをblackにマッピング
            'violet': 'purple',   // violetをpurpleにマッピング
            'lime': 'green',      // limeをgreenにマッピング
            'navy': 'blue',       // navyをblueにマッピング
            'beige': 'white',     // beigeをwhiteにマッピング
            'cream': 'white',     // creamをwhiteにマッピング
            'crimson': 'red',     // crimsonをredにマッピング
            'scarlet': 'red',     // scarletをredにマッピング
            'rose': 'pink',       // roseをpinkにマッピング
            'magenta': 'pink',    // magentaをpinkにマッピング
            'cyan': 'blue',       // cyanをblueにマッピング
            'gold': 'yellow',     // goldをyellowにマッピング
            'silver': 'white'     // silverをwhiteにマッピング
          };
          
          Object.entries(parsedData.beads).forEach(([apiColor, count]) => {
            // 色名を小文字に統一してマッピング
            const normalizedApiColor = apiColor.toLowerCase().trim();
            const mappedColor = colorMapping[normalizedApiColor];
            
            if (mappedColor && mappedColor in mappedCounts) {
              mappedCounts[mappedColor] += count as number;
              console.log(`色マッピング成功: ${apiColor} (${normalizedApiColor}) -> ${mappedColor} (${count}個)`);
            } else {
              console.warn(`未対応の色名: ${apiColor} (${normalizedApiColor}) - ${count}個`);
              // 未対応の色は最も近い色に自動マッピング（簡易実装）
              if (normalizedApiColor.includes('red') || normalizedApiColor.includes('赤')) {
                mappedCounts['red'] += count as number;
              } else if (normalizedApiColor.includes('blue') || normalizedApiColor.includes('青')) {
                mappedCounts['blue'] += count as number;
              } else if (normalizedApiColor.includes('green') || normalizedApiColor.includes('緑')) {
                mappedCounts['green'] += count as number;
              } else if (normalizedApiColor.includes('yellow') || normalizedApiColor.includes('黄')) {
                mappedCounts['yellow'] += count as number;
              } else if (normalizedApiColor.includes('purple') || normalizedApiColor.includes('紫')) {
                mappedCounts['purple'] += count as number;
              } else if (normalizedApiColor.includes('pink') || normalizedApiColor.includes('ピンク')) {
                mappedCounts['pink'] += count as number;
              } else if (normalizedApiColor.includes('brown') || normalizedApiColor.includes('茶')) {
                mappedCounts['brown'] += count as number;
              } else if (normalizedApiColor.includes('white') || normalizedApiColor.includes('白')) {
                mappedCounts['white'] += count as number;
              } else if (normalizedApiColor.includes('black') || normalizedApiColor.includes('黒')) {
                mappedCounts['black'] += count as number;
              } else {
                // どれにも該当しない場合は最初に見つかった0でない色に追加
                const firstNonZeroColor = BEAD_COLORS_ORDER.find(color => mappedCounts[color] > 0) || 'red';
                mappedCounts[firstNonZeroColor] += count as number;
                console.log(`フォールバック: ${apiColor} -> ${firstNonZeroColor}`);
              }
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
        <header className="text-center">
          <div className="flex justify-between items-center">
            {/* ステップタイトル */}
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

          <div className="mt-4 sm:mt-6">
            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-4">
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
                Please set at least one bead
              </div>
            )}
          </div>
        </main>

        {/* ローディングオーバーレイ */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-center bg-white/90 p-8 rounded-xl">
              <Loading />
              {/* <p className="mt-4 text-gray-600">Generating patterns...</p> */}
            </div>
          </div>
        )}

        {/* エラーオーバーレイ */}
        {error && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-center max-w-md mx-auto p-6 bg-white/90 rounded-xl">
              <div className="text-red-500 text-6xl mt-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mt-2">
                An error occurred
              </h2>
              <p className="text-gray-600 mt-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()} variant="primary">
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
