import { renderHook, act } from '@testing-library/react';
import { useSuggestions } from './useSuggestions';
import { BeadCounts, PatternData } from '@/types/index';

// APIモジュールのモック
jest.mock('@/lib/api', () => ({
  fetchSuggestions: jest.fn()
}));

import { fetchSuggestions } from '@/lib/api';

const mockFetchSuggestions = fetchSuggestions as jest.MockedFunction<typeof fetchSuggestions>;

describe('useSuggestions', () => {
  beforeEach(() => {
    mockFetchSuggestions.mockClear();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useSuggestions());

    expect(result.current.patterns).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('getSuggestionsが成功時に正しく動作する', async () => {
    const mockPatterns = [
      {
        id: '1',
        pattern: 'w'.repeat(256),
        beadCounts: {
          red: 0, orange: 0, yellow: 0, green: 0, blue: 0,
          purple: 0, black: 0, white: 256, pink: 0, brown: 0
        } as BeadCounts
      }
    ];

    mockFetchSuggestions.mockResolvedValueOnce(mockPatterns);

    const { result } = renderHook(() => useSuggestions());

    const beadCounts: BeadCounts = {
      red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 50, pink: 0, brown: 0
    };

    await act(async () => {
      await result.current.getSuggestions(beadCounts);
    });

    expect(result.current.patterns).toEqual(mockPatterns);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchSuggestions).toHaveBeenCalledWith(beadCounts);
  });

  it('API呼び出し中はloadingがtrueになる', async () => {
    let resolvePromise: (value: PatternData[]) => void;
    const promise = new Promise<PatternData[]>(resolve => {
      resolvePromise = resolve;
    });
    
    mockFetchSuggestions.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useSuggestions());

    const beadCounts: BeadCounts = {
      red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 0, pink: 0, brown: 0
    };

    act(() => {
      result.current.getSuggestions(beadCounts);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // プロミスを解決
    await act(async () => {
      resolvePromise!([]);
    });

    expect(result.current.loading).toBe(false);
  });

  it('APIエラー時にエラーメッセージが設定される', async () => {
    mockFetchSuggestions.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSuggestions());

    const beadCounts: BeadCounts = {
      red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 0, pink: 0, brown: 0
    };

    await act(async () => {
      await result.current.getSuggestions(beadCounts);
    });

    expect(result.current.patterns).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('エラーが発生しました: Network error');
  });

  it('ビーズ数が0の場合にエラーメッセージが設定される', async () => {
    const { result } = renderHook(() => useSuggestions());

    const beadCounts: BeadCounts = {
      red: 0, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 0, pink: 0, brown: 0
    };

    await act(async () => {
      await result.current.getSuggestions(beadCounts);
    });

    expect(result.current.error).toBe('ビーズ数を1個以上入力してください');
    expect(mockFetchSuggestions).not.toHaveBeenCalled();
  });

  it('図案が0件の場合にエラーメッセージが設定される', async () => {
    mockFetchSuggestions.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSuggestions());

    const beadCounts: BeadCounts = {
      red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 0, pink: 0, brown: 0
    };

    await act(async () => {
      await result.current.getSuggestions(beadCounts);
    });

    expect(result.current.patterns).toEqual([]);
    expect(result.current.error).toBe('指定されたビーズ数で作成可能な図案が見つかりませんでした');
  });

  it('resetが正しく動作する', async () => {
    // 先にデータを設定
    mockFetchSuggestions.mockResolvedValueOnce([
      {
        id: '1',
        pattern: 'w'.repeat(256),
        beadCounts: {
          red: 0, orange: 0, yellow: 0, green: 0, blue: 0,
          purple: 0, black: 0, white: 256, pink: 0, brown: 0
        } as BeadCounts
      }
    ]);

    const { result } = renderHook(() => useSuggestions());

    const beadCounts: BeadCounts = {
      red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 50, pink: 0, brown: 0
    };

    await act(async () => {
      await result.current.getSuggestions(beadCounts);
    });

    // データが設定されていることを確認
    expect(result.current.patterns).toHaveLength(1);

    // リセット実行
    act(() => {
      result.current.reset();
    });

    // 初期状態に戻っていることを確認
    expect(result.current.patterns).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('エラーメッセージのパターン', () => {
    it('ネットワークエラーの場合', async () => {
      mockFetchSuggestions.mockRejectedValueOnce(new Error('Failed to fetch'));

      const { result } = renderHook(() => useSuggestions());

      const beadCounts: BeadCounts = {
        red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      await act(async () => {
        await result.current.getSuggestions(beadCounts);
      });

      expect(result.current.error).toBe('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
    });

    it('500エラーの場合', async () => {
      mockFetchSuggestions.mockRejectedValueOnce(new Error('HTTP error! status: 500'));

      const { result } = renderHook(() => useSuggestions());

      const beadCounts: BeadCounts = {
        red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      await act(async () => {
        await result.current.getSuggestions(beadCounts);
      });

      expect(result.current.error).toBe('サーバーでエラーが発生しました。しばらく時間をおいて再度お試しください。');
    });

    it('404エラーの場合', async () => {
      mockFetchSuggestions.mockRejectedValueOnce(new Error('HTTP error! status: 404'));

      const { result } = renderHook(() => useSuggestions());

      const beadCounts: BeadCounts = {
        red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      await act(async () => {
        await result.current.getSuggestions(beadCounts);
      });

      expect(result.current.error).toBe('APIエンドポイントが見つかりません。');
    });
  });
});
