import { BeadCounts, PatternData, BEAD_COLOR_API_NAMES, BeadColor } from '@/types/index';

// APIのベースURL（環境変数で設定可能）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

/**
 * ビーズ数をクエリパラメータに変換
 * BeadCountsオブジェクトをAPIで使用されるフルネーム形式に変換
 */
export const beadCountsToQueryParams = (beadCounts: BeadCounts): string => {
  const params = new URLSearchParams();
  
  Object.entries(beadCounts).forEach(([color, count]) => {
    if (count > 0) {
      const apiColorName = BEAD_COLOR_API_NAMES[color as BeadColor];
      if (apiColorName) {
        params.append(apiColorName, count.toString());
      }
    }
  });
  
  return params.toString();
};

/**
 * APIレスポンスの型定義（実際のAPI形式に合わせて更新）
 */
export interface ApiPatternResponse {
  id: number;
  pattern: string;
  title: string;
  beads: Record<string, number>; // 短縮形のキー (g, m, o, など)
  category: string;
  total_num: number;
  b_num: number;
  d_num: number;
  g_num: number;
  m_num: number;
  o_num: number;
  p_num: number;
  r_num: number;
  v_num: number;
  w_num: number;
  y_num: number;
}

export interface SuggestionsApiResponse {
  success: boolean;
  data?: ApiPatternResponse[];
  error?: string;
}

/**
 * APIで使用される短縮形のキーから色名へのマッピング
 */
const SHORT_KEY_TO_BEAD_COLOR: Record<string, BeadColor> = {
  'r': 'red',
  'o': 'orange', 
  'y': 'yellow',
  'g': 'green',
  'b': 'blue',
  'v': 'purple',
  'd': 'black',
  'w': 'white',
  'p': 'pink',
  'm': 'brown',
  'n': 'null'
} as const;

/**
 * APIレスポンスをフロントエンド用データに変換
 */
export const convertApiResponseToPatternData = (
  apiResponse: ApiPatternResponse[],
  requestId: string = ''
): PatternData[] => {
  return apiResponse.map((item, index) => {
    // BeadCountsの初期化
    const beadCounts: BeadCounts = {
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
      blue: 0,
      purple: 0,
      black: 0,
      white: 0,
      pink: 0,
      brown: 0,
      null: 0
    };

    // APIレスポンスの短縮形キーをフロントエンド色名に変換
    Object.entries(item.beads).forEach(([shortKey, count]) => {
      const beadColor = SHORT_KEY_TO_BEAD_COLOR[shortKey];
      if (beadColor) {
        beadCounts[beadColor] = count;
      }
    });

    return {
      id: `${requestId}-${index + 1}`,
      pattern: item.pattern,
      beadCounts,
      title: item.title // APIから取得したタイトルを追加
    };
  });
};

/**
 * 図案提案APIを呼び出す
 */
export const fetchSuggestions = async (beadCounts: BeadCounts): Promise<PatternData[]> => {
  try {
    const queryParams = beadCountsToQueryParams(beadCounts);
    const url = `${API_BASE_URL}/api/suggestions?${queryParams}`;
    
    console.log('API呼び出し:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiPatternResponse[] = await response.json();
    
    // デバッグ情報: APIレスポンスを確認
    console.log('API Response data:', data);
    data.forEach((item, index) => {
      console.log(`API Response item ${index}:`, {
        id: item.id,
        pattern: item.pattern ? `${item.pattern.length} chars` : 'no pattern',
        title: item.title,
        beadsKeys: Object.keys(item.beads),
        beadsValues: Object.values(item.beads),
        category: item.category
      });
    });
    
    // リクエストIDを生成（タイムスタンプベース）
    const requestId = Date.now().toString();
    
    const convertedData = convertApiResponseToPatternData(data, requestId);
    
    // デバッグ情報: 変換後のデータを確認
    console.log('Converted pattern data:', convertedData);
    convertedData.forEach((item, index) => {
      console.log(`Converted item ${index}:`, {
        id: item.id,
        title: item.title,
        pattern: item.pattern ? `${item.pattern.length} chars` : 'no pattern',
        beadCountsTotal: Object.values(item.beadCounts).reduce((sum, count) => sum + count, 0)
      });
    });
    
    return convertedData;
  } catch (error) {
    console.error('API呼び出しエラー:', error);
    throw error;
  }
};
