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
      setError('ビーズ数を1個以上入力してください');
      return [];
    }

    setLoading(true);
    setError(null);
    setPatterns([]);

    try {
      const result = await fetchSuggestions(beadCounts);
      setPatterns(result);
      
      if (result.length === 0) {
        setError('指定されたビーズ数で作成可能な図案が見つかりませんでした');
      }
      
      return result;
    } catch (err) {
      console.error('図案取得エラー:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
        } else if (err.message.includes('500')) {
          setError('サーバーでエラーが発生しました。しばらく時間をおいて再度お試しください。');
        } else if (err.message.includes('404')) {
          setError('APIエンドポイントが見つかりません。');
        } else {
          setError(`エラーが発生しました: ${err.message}`);
        }
      } else {
        setError('予期しないエラーが発生しました');
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
