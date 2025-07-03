'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BeadColor, BeadCounts, BEAD_COLORS_ORDER } from '@/types';
import BeadInput from '@/components/part/BeadInput';
import ActionButton from '@/components/part/ActionButton';
import Button from '@/components/part/Button';
import Loading from '@/components/part/Loading';
import backgroundImage from '@/assets/background.png';
import resetIcon from '@/assets/reset.png';
import nextIcon from '@/assets/next.png';
import cameraIcon from '@/assets/camera.png';

interface BeadInputScreenProps {
  onSubmit?: (beadCounts: BeadCounts) => Promise<void> | void;
  /** API通信のローディング状態 */
  loading?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** 初期のビーズ数（親コンポーネントから状態を受け取る） */
  initialBeadCounts?: BeadCounts;
  /** ビーズ数変更時のコールバック */
  onBeadCountsChange?: (beadCounts: BeadCounts) => void;
}

export default function BeadInputScreen({ 
  onSubmit, 
  loading, 
  error, 
  initialBeadCounts,
  onBeadCountsChange 
}: BeadInputScreenProps) {
  const router = useRouter();
  const [beadCounts, setBeadCounts] = useState<BeadCounts>(() => {
    // 初期値が渡されている場合はそれを使用
    if (initialBeadCounts) {
      return initialBeadCounts;
    }
    
    const initialCounts = {} as BeadCounts;
    BEAD_COLORS_ORDER.forEach(color => {
      initialCounts[color] = 0;
    });
    return initialCounts;
  });

  // initialBeadCountsが変更されたら状態を更新
  useEffect(() => {
    if (initialBeadCounts) {
      setBeadCounts(initialBeadCounts);
    }
  }, [initialBeadCounts]);

  const handleBeadCountChange = useCallback((color: BeadColor, value: number) => {
    const newBeadCounts = {
      ...beadCounts,
      [color]: value
    };
    setBeadCounts(newBeadCounts);
    
    // 親コンポーネントに変更を通知
    if (onBeadCountsChange) {
      onBeadCountsChange(newBeadCounts);
    }
  }, [beadCounts, onBeadCountsChange]);

  const handleReset = useCallback(() => {
    const resetCounts = {} as BeadCounts;
    BEAD_COLORS_ORDER.forEach(color => {
      resetCounts[color] = 0;
    });
    setBeadCounts(resetCounts);
    
    // 親コンポーネントに変更を通知
    if (onBeadCountsChange) {
      onBeadCountsChange(resetCounts);
    }
  }, [onBeadCountsChange]);

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
