import { useState, useCallback } from 'react';
import { BeadCounts, PatternData } from '@/types/index';
import { fetchSuggestions } from '@/lib/api';

interface UseSuggestionsReturn {
  /** 図案データ */
  patterns: PatternData[];
  /** ローディング状態 */
  loading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 図案提案を取得する関数 */
  getSuggestions: (beadCounts: BeadCounts) => Promise<PatternData[]>;
  /** 状態をリセットする関数 */
  reset: () => void;
}

/**
 * 図案提案APIを使用するためのカスタムフック
 */
export const useSuggestions = (): UseSuggestionsReturn => {
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (beadCounts: BeadCounts): Promise<PatternData[]> => {
    // 入力値の検証
    const totalBeads = Object.values(beadCounts).reduce((sum, count) => sum + count, 0);
    if (totalBeads === 0) {
      setError('Please enter at least one bead');
      return [];
    }

    setLoading(true);
    setError(null);
    setPatterns([]);

    try {
      const result = await fetchSuggestions(beadCounts);
      setPatterns(result);
      
      if (result.length === 0) {
        setError('No patterns found for the specified bead counts');
      }
      
      return result;
    } catch (err) {
      console.error('図案取得エラー:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Could not connect to server. Please check your network connection.');
        } else if (err.message.includes('500')) {
          setError('Server error occurred. Please try again later.');
        } else if (err.message.includes('404')) {
          setError('API endpoint not found.');
        } else {
          setError(`An error occurred: ${err.message}`);
        }
      } else {
        setError('An unexpected error occurred');
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPatterns([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    patterns,
    loading,
    error,
    getSuggestions,
    reset
  };
};
