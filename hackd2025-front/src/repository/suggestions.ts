import { BeadCounts, PatternData, BEAD_COLOR_API_NAMES, API_NAME_TO_BEAD_COLOR, BeadColor } from '@/types/index';

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
 * APIレスポンスの型定義
 */
export interface ApiPatternResponse {
  pattern: string;
  title: string;
  beads: Record<string, number>; // APIはフルネームで返す
}

export interface SuggestionsApiResponse {
  success: boolean;
  data?: ApiPatternResponse[];
  error?: string;
}

/**
 * APIレスポンスをフロントエンド用データに変換
 */
export const convertApiResponseToPatternData = (
  apiResponse: ApiPatternResponse[],
  requestId: string = ''
): PatternData[] => {
  return apiResponse.map((item, index) => {
    // APIのフルネーム形式をフロントエンド形式に変換
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

    // APIレスポンスのフルネームをフロントエンド色名に変換
    Object.entries(item.beads).forEach(([apiColorName, count]) => {
      const beadColor = API_NAME_TO_BEAD_COLOR[apiColorName];
      if (beadColor) {
        beadCounts[beadColor] = count;
      }
    });

    return {
      id: `${requestId}-${index + 1}`,
      title: item.title,
      pattern: item.pattern,
      beadCounts
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
    
    // リクエストIDを生成（タイムスタンプベース）
    const requestId = Date.now().toString();
    
    return convertApiResponseToPatternData(data, requestId);
  } catch (error) {
    console.error('API呼び出しエラー:', error);
    throw error;
  }
};
