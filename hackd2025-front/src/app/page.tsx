'use client';

import { useState } from 'react';
import BeadInputScreen from '@/components/template/bead-input';
import { PatternViewScreen } from '@/components/template/pattern-view';
import { BeadCounts } from '@/types/index';
import { useSuggestions } from '@/hooks/useSuggestions';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'input' | 'patterns'>('input');
  const { patterns, loading, error, getSuggestions, reset } = useSuggestions();

  const handleSubmit = async (beadCounts: BeadCounts) => {
    console.log('ビーズ数:', beadCounts);
    await getSuggestions(beadCounts);
    if (!error && patterns.length > 0) {
      setCurrentScreen('patterns');
    }
  };

  const handleBack = () => {
    setCurrentScreen('input');
    reset();
  };

  const handleHome = () => {
    setCurrentScreen('input');
    reset();
  };

  if (currentScreen === 'patterns' && patterns.length > 0) {
    return (
      <PatternViewScreen
        patterns={patterns}
        onBack={handleBack}
        onHome={handleHome}
      />
    );
  }

  return (
    <BeadInputScreen 
      onSubmit={handleSubmit}
      loading={loading}
      error={error || undefined}
    />
  );
}
