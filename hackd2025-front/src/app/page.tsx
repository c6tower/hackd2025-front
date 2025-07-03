'use client';

import { useState, useEffect } from 'react';
import BeadInputScreen from '@/components/template/bead-input';
import { PatternViewScreen } from '@/components/template/pattern-view';
import { BeadCounts, BeadColor } from '@/types/index';
import { useSuggestions } from '@/hooks/useSuggestions';

const BEAD_COLORS_ORDER: BeadColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 
  'purple', 'black', 'white', 'pink', 'brown'
];

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

  // 初回レンダリング時にsessionStorageから復元
  useEffect(() => {
    const storedBeadCounts = sessionStorage.getItem('currentBeadCounts');
    if (storedBeadCounts) {
      try {
        const parsedCounts = JSON.parse(storedBeadCounts);
        setBeadCounts(parsedCounts);
      } catch (error) {
        console.error('Failed to parse stored bead counts:', error);
      }
    }
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
