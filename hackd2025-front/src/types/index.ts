// ビーズ色定義（10色）
export const BEAD_COLORS = {
  red: '#FF0000',
  orange: '#FFA500', 
  yellow: '#FFFF00',
  green: '#008000',
  blue: '#0000FF',
  purple: '#800080',
  black: '#000000',
  white: '#FFFFFF',
  pink: '#FFC0CB',
  brown: '#A52A2A'
} as const;

export type BeadColor = keyof typeof BEAD_COLORS;

// ビーズ入力コンポーネントのProps
export interface BeadInputProps {
  color: BeadColor;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

// パターングリッドコンポーネントのProps
export interface PatternGridProps {
  pattern: string; // 256文字
  size?: 'small' | 'large'; // 選択画面 or モーダル
  interactive?: boolean;
}

// APIレスポンス型
export interface PatternResponse {
  pattern: string; // 256文字の図案データ
  beads: Record<BeadColor, number>; // 色別使用数
}

// ビーズ使用数の型
export type BeadCounts = {
  [K in BeadColor]: number;
}

// ビーズ色の表示名
export const BEAD_COLOR_NAMES: Record<BeadColor, string> = {
  red: '赤',
  orange: 'オレンジ',
  yellow: '黄',
  green: '緑',
  blue: '青',
  purple: '紫',
  black: '黒',
  white: '白',
  pink: 'ピンク',
  brown: '茶'
} as const;

// ビーズ色の絵文字
export const BEAD_COLOR_EMOJIS: Record<BeadColor, string> = {
  red: '🔴',
  orange: '🟠',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  purple: '🟣',
  black: '⚫',
  white: '⚪',
  pink: '🩷',
  brown: '🤎'
} as const;

// 図案データ用の色コードマッピング（memo.mdに基づく）
export const BEAD_COLOR_CODES: Record<BeadColor, string> = {
  white: 'w',
  black: 'd', // dark
  pink: 'p',
  red: 'r',
  orange: 'o',
  yellow: 'y',
  green: 'g',
  blue: 'b',
  purple: 'v',
  brown: 'm' // maron
} as const;

// コードから色への逆マッピング
export const CODE_TO_BEAD_COLOR: Record<string, BeadColor> = {
  w: 'white',
  d: 'black',
  p: 'pink',
  r: 'red',
  o: 'orange',
  y: 'yellow',
  g: 'green',
  b: 'blue',
  v: 'purple',
  m: 'brown',
  n: 'white' // null -> white として扱う
} as const;

// 図案データの型
export interface PatternData {
  id: string;
  pattern: string; // 256文字の図案データ
  beadCounts: BeadCounts;
}

// API用の型
export interface PatternApiResponse {
  patterns: PatternData[];
  success: boolean;
  error?: string;
}

// APIで使用する色名マッピング（design.mdの仕様に基づく）
export const BEAD_COLOR_API_NAMES: Record<BeadColor, string> = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  purple: 'violet', // APIでは"violet"を使用
  black: 'dark',    // APIでは"dark"を使用
  white: 'white',
  pink: 'pink',
  brown: 'maroon'   // APIでは"maroon"を使用
} as const;

// APIの色名からBeadColorへの逆マッピング
export const API_NAME_TO_BEAD_COLOR: Record<string, BeadColor> = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  violet: 'purple',
  dark: 'black',
  white: 'white',
  pink: 'pink',
  maroon: 'brown'
} as const;
