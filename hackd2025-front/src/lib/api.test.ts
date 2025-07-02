import { beadCountsToQueryParams, convertApiResponseToPatternData } from './api';
import { BeadCounts } from '@/types/index';

// fetchのモック
global.fetch = jest.fn();

describe('API Utils', () => {
  describe('beadCountsToQueryParams', () => {
    it('ビーズ数をクエリパラメータに正しく変換する', () => {
      const beadCounts: BeadCounts = {
        red: 10,
        orange: 0,
        yellow: 5,
        green: 0,
        blue: 3,
        purple: 0,
        black: 2,
        white: 15,
        pink: 0,
        brown: 1
      };

      const result = beadCountsToQueryParams(beadCounts);
      
      // URLSearchParamsを使用して結果を検証
      const params = new URLSearchParams(result);
      expect(params.get('red')).toBe('10');
      expect(params.get('yellow')).toBe('5');
      expect(params.get('blue')).toBe('3');
      expect(params.get('dark')).toBe('2');    // black -> dark
      expect(params.get('white')).toBe('15');
      expect(params.get('maroon')).toBe('1');  // brown -> maroon
      
      // 0の値は含まれない
      expect(params.get('orange')).toBeNull();
      expect(params.get('green')).toBeNull();
      expect(params.get('violet')).toBeNull(); // purple -> violet
      expect(params.get('pink')).toBeNull();
    });

    it('全て0の場合は空文字列を返す', () => {
      const beadCounts: BeadCounts = {
        red: 0, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      const result = beadCountsToQueryParams(beadCounts);
      expect(result).toBe('');
    });
  });

  describe('convertApiResponseToPatternData', () => {
    it('APIレスポンスをPatternDataに正しく変換する', () => {
      const apiResponse = [
        {
          pattern: 'w'.repeat(256),
          beads: {
            white: 200,
            red: 30,
            blue: 26
          } as Record<string, number>
        },
        {
          pattern: 'r'.repeat(256),
          beads: {
            red: 256
          } as Record<string, number>
        }
      ];

      const result = convertApiResponseToPatternData(apiResponse, 'test');
      
      expect(result).toHaveLength(2);
      
      // 1つ目のパターン
      expect(result[0].id).toBe('test-1');
      expect(result[0].pattern).toBe('w'.repeat(256));
      expect(result[0].beadCounts.white).toBe(200);
      expect(result[0].beadCounts.red).toBe(30);
      expect(result[0].beadCounts.blue).toBe(26);
      expect(result[0].beadCounts.orange).toBe(0); // 未使用色

      // 2つ目のパターン
      expect(result[1].id).toBe('test-2');
      expect(result[1].pattern).toBe('r'.repeat(256));
      expect(result[1].beadCounts.red).toBe(256);
      expect(result[1].beadCounts.white).toBe(0); // 未使用色
    });

    it('空の配列を正しく処理する', () => {
      const result = convertApiResponseToPatternData([], 'test');
      expect(result).toEqual([]);
    });
  });

  describe('fetchSuggestions', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockClear();
    });

    it('成功時に正しいデータを返す', async () => {
      const mockResponse = [
        {
          pattern: 'wrb' + 'n'.repeat(253),
          beads: { 
            white: 1, 
            red: 1, 
            blue: 1 
          } as Record<string, number>
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { fetchSuggestions } = await import('./api');
      
      const beadCounts: BeadCounts = {
        red: 10, orange: 0, yellow: 0, green: 0, blue: 5,
        purple: 0, black: 0, white: 8, pink: 0, brown: 0
      };

      const result = await fetchSuggestions(beadCounts);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/suggestions?'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      expect(result).toHaveLength(1);
      expect(result[0].beadCounts.white).toBe(1);
      expect(result[0].beadCounts.red).toBe(1);
      expect(result[0].beadCounts.blue).toBe(1);
    });

    it('APIエラー時に例外を投げる', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { fetchSuggestions } = await import('./api');
      
      const beadCounts: BeadCounts = {
        red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      await expect(fetchSuggestions(beadCounts)).rejects.toThrow('HTTP error! status: 500');
    });

    it('ネットワークエラー時に例外を投げる', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      const { fetchSuggestions } = await import('./api');
      
      const beadCounts: BeadCounts = {
        red: 10, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      await expect(fetchSuggestions(beadCounts)).rejects.toThrow('Failed to fetch');
    });
  });
});
