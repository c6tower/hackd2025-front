'use client';

import { useState, useEffect } from 'react';
import BeadInputScreen from '@/components/template/bead-input';
import { PatternViewScreen } from '@/components/template/pattern-view';
import { BeadCounts, API_NAME_TO_BEAD_COLOR, BEAD_COLORS_ORDER } from '@/types/index';
import { useSuggestions } from '@/hooks/useSuggestions';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'input' | 'patterns'>('input');
  const { patterns, loading, error, getSuggestions, reset } = useSuggestions();
  
  // ビーズ数の状態をメインコンポーネントで管理
  const [beadCounts, setBeadCounts] = useState<BeadCounts>(() => {
    const initialCounts = {} as BeadCounts;
    BEAD_COLORS_ORDER.forEach(color => {
      initialCounts[color] = 0;
    });
    return initialCounts;
  });

  // 初回レンダリング時とページフォーカス時にsessionStorageから復元
  useEffect(() => {
    const checkSessionStorage = () => {
      console.log('checkSessionStorage実行: sessionStorageをチェック中...');
      
      // sessionStorageの全体をログ出力
      console.log('sessionStorage keys:', Object.keys(sessionStorage));
      
      // URLパラメータをチェック
      const urlParams = new URLSearchParams(window.location.search);
      const cameraDataParam = urlParams.get('camera_data');
      console.log('URLパラメータのカメラデータ:', cameraDataParam);
      
      if (cameraDataParam) {
        try {
          const decodedData = decodeURIComponent(cameraDataParam);
          const parsedData = JSON.parse(decodedData);
          console.log('URLから取得したカメラデータ:', parsedData);
          
          if (parsedData && parsedData.beads) {
            console.log('URLからカメラデータを検出:', parsedData);
            console.log('beadsオブジェクト:', parsedData.beads);
            
            // URLパラメータをクリア
            window.history.replaceState({}, '', '/');
            
            // カメラからのデータを変換
            const mappedCounts = {} as BeadCounts;
            BEAD_COLORS_ORDER.forEach(color => {
              mappedCounts[color] = 0;
            });
            
            Object.entries(parsedData.beads).forEach(([apiColor, count]) => {
              console.log(`処理中の色: ${apiColor}, 数量: ${count}`);
              const normalizedApiColor = apiColor.toLowerCase().trim();
              
              // 既存の型定義のマッピングを使用
              let mappedColor = API_NAME_TO_BEAD_COLOR[normalizedApiColor];
              console.log(`直接マッピング結果: ${normalizedApiColor} -> ${mappedColor}`);
              
              // 直接マッピングできない場合のフォールバック処理
              if (!mappedColor) {
                console.log(`フォールバック処理開始: ${normalizedApiColor}`);
                if (normalizedApiColor.includes('red')) {
                  mappedColor = 'red';
                } else if (normalizedApiColor.includes('blue')) {
                  mappedColor = 'blue';
                } else if (normalizedApiColor.includes('green')) {
                  mappedColor = 'green';
                } else if (normalizedApiColor.includes('yellow')) {
                  mappedColor = 'yellow';
                } else if (normalizedApiColor.includes('purple') || normalizedApiColor.includes('violet')) {
                  mappedColor = 'purple';
                } else if (normalizedApiColor.includes('pink')) {
                  mappedColor = 'pink';
                } else if (normalizedApiColor.includes('brown') || normalizedApiColor.includes('maroon')) {
                  mappedColor = 'brown';
                } else if (normalizedApiColor.includes('white') || normalizedApiColor.includes('light')) {
                  mappedColor = 'white';
                } else if (normalizedApiColor.includes('black') || normalizedApiColor.includes('dark')) {
                  mappedColor = 'black';
                } else {
                  mappedColor = 'red'; // デフォルト
                  console.warn(`未対応の色名: ${apiColor} -> デフォルト(red)に設定`);
                }
                console.log(`フォールバック結果: ${normalizedApiColor} -> ${mappedColor}`);
              }
              
              if (mappedColor && mappedColor in mappedCounts) {
                mappedCounts[mappedColor] += count as number;
                console.log(`色マッピング成功: ${apiColor} -> ${mappedColor} (${count}個)`);
              }
            });
            
            console.log('URLからマッピング後のビーズ数:', mappedCounts);
            setBeadCounts(mappedCounts);
            console.log('URLからのsetBeadCounts実行完了');
            return;
          }
        } catch (error) {
          console.error('Failed to parse URL camera data:', error);
        }
      }
      
      // まずカメラ機能からのデータをチェック
      const storedCameraData = sessionStorage.getItem('beadCounts');
      console.log('カメラデータ(beadCounts):', storedCameraData);
      
      if (storedCameraData && storedCameraData !== 'null') {
        try {
          const parsedData = JSON.parse(storedCameraData);
          console.log('パースされたカメラデータ:', parsedData);
          
          if (parsedData && parsedData.beads) {
            console.log('カメラデータを検出:', parsedData);
            console.log('beadsオブジェクト:', parsedData.beads);
            
            // カメラからのデータを変換
            const mappedCounts = {} as BeadCounts;
            BEAD_COLORS_ORDER.forEach(color => {
              mappedCounts[color] = 0;
            });
            
            Object.entries(parsedData.beads).forEach(([apiColor, count]) => {
              console.log(`処理中の色: ${apiColor}, 数量: ${count}`);
              const normalizedApiColor = apiColor.toLowerCase().trim();
              
              // 既存の型定義のマッピングを使用
              let mappedColor = API_NAME_TO_BEAD_COLOR[normalizedApiColor];
              console.log(`直接マッピング結果: ${normalizedApiColor} -> ${mappedColor}`);
              
              // 直接マッピングできない場合のフォールバック処理
              if (!mappedColor) {
                console.log(`フォールバック処理開始: ${normalizedApiColor}`);
                if (normalizedApiColor.includes('red')) {
                  mappedColor = 'red';
                } else if (normalizedApiColor.includes('blue')) {
                  mappedColor = 'blue';
                } else if (normalizedApiColor.includes('green')) {
                  mappedColor = 'green';
                } else if (normalizedApiColor.includes('yellow')) {
                  mappedColor = 'yellow';
                } else if (normalizedApiColor.includes('purple') || normalizedApiColor.includes('violet')) {
                  mappedColor = 'purple';
                } else if (normalizedApiColor.includes('pink')) {
                  mappedColor = 'pink';
                } else if (normalizedApiColor.includes('brown') || normalizedApiColor.includes('maroon')) {
                  mappedColor = 'brown';
                } else if (normalizedApiColor.includes('white') || normalizedApiColor.includes('light')) {
                  mappedColor = 'white';
                } else if (normalizedApiColor.includes('black') || normalizedApiColor.includes('dark')) {
                  mappedColor = 'black';
                } else {
                  mappedColor = 'red'; // デフォルト
                  console.warn(`未対応の色名: ${apiColor} -> デフォルト(red)に設定`);
                }
                console.log(`フォールバック結果: ${normalizedApiColor} -> ${mappedColor}`);
              }
              
              if (mappedColor && mappedColor in mappedCounts) {
                mappedCounts[mappedColor] += count as number;
                console.log(`色マッピング成功: ${apiColor} -> ${mappedColor} (${count}個)`);
              }
            });
            
            console.log('マッピング後のビーズ数:', mappedCounts);
            setBeadCounts(mappedCounts);
            console.log('setBeadCounts実行完了');
            
            // カメラデータを使用したら削除
            sessionStorage.removeItem('beadCounts');
            console.log('カメラデータを削除しました');
            return;
          }
        } catch (error) {
          console.error('Failed to parse camera data:', error);
        }
      }
      
      // カメラデータがない場合は通常の保存データを復元
      const storedBeadCounts = sessionStorage.getItem('currentBeadCounts');
      console.log('通常の保存データ(currentBeadCounts):', storedBeadCounts);
      if (storedBeadCounts) {
        try {
          const parsedCounts = JSON.parse(storedBeadCounts);
          console.log('通常の保存データを復元:', parsedCounts);
          setBeadCounts(parsedCounts);
        } catch (error) {
          console.error('Failed to parse stored bead counts:', error);
        }
      }
    };

    // 初回実行
    checkSessionStorage();
    
    // ページフォーカス時にも実行
    const handleFocus = () => {
      console.log('ページがフォーカスされました');
      checkSessionStorage();
    };
    
    // visibility changeイベントも追加
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('ページが表示されました');
        checkSessionStorage();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ビーズ数が変更されたらsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem('currentBeadCounts', JSON.stringify(beadCounts));
  }, [beadCounts]);

  const handleSubmit = async (submitBeadCounts: BeadCounts) => {
    console.log('ビーズ数:', submitBeadCounts);
    // 現在のビーズ数を更新
    setBeadCounts(submitBeadCounts);
    
    const result = await getSuggestions(submitBeadCounts);
    
    // 図案が取得できた場合のみ画面遷移
    if (result.length > 0) {
      setCurrentScreen('patterns');
    }
  };

  const handleBack = () => {
    setCurrentScreen('input');
    reset();
    // パターンをリセットしてもビーズ数は保持する
  };

  if (currentScreen === 'patterns' && patterns.length > 0) {
    return (
      <PatternViewScreen
        patterns={patterns}
        onBack={handleBack}
      />
    );
  }

  return (
    <BeadInputScreen 
      onSubmit={handleSubmit}
      loading={loading}
      error={error || undefined}
      initialBeadCounts={beadCounts}
      onBeadCountsChange={setBeadCounts}
    />
  );
}
