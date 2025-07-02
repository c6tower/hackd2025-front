import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatternViewScreen } from './index';
import { BeadCounts } from '@/types/index';

// 画像アセットのモック
jest.mock('@/assets/background.png', () => ({
  __esModule: true,
  default: {
    src: '/mock-background.png'
  }
}));

// モック用のパターンデータ
const mockPatternData = [
  {
    id: '1',
    pattern: 'w'.repeat(256),
    beadCounts: {
      red: 50, orange: 0, yellow: 25, green: 0, blue: 30,
      purple: 0, black: 0, white: 151, pink: 0, brown: 0
    } as BeadCounts
  },
  {
    id: '2',
    pattern: 'r'.repeat(256),
    beadCounts: {
      red: 256, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 0, pink: 0, brown: 0
    } as BeadCounts
  }
];

// PatternPreviewのモック
jest.mock('@/components/module/PatternPreview', () => ({
  PatternPreview: ({ id, selected, onSelect }: {
    id: string;
    selected: boolean;
    onSelect: (id: string) => void;
  }) => (
    <div
      data-testid={`pattern-preview-${id}`}
      data-selected={selected}
      onClick={() => onSelect(id)}
    >
      Pattern Preview {id}
    </div>
  )
}));

// PatternDetailModalのモック
jest.mock('@/components/module/PatternDetailModal', () => ({
  PatternDetailModal: ({ isOpen, onClose, onHome }: {
    isOpen: boolean;
    onClose: () => void;
    onHome: () => void;
  }) => 
    isOpen ? (
      <div data-testid="pattern-detail-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onHome}>Home from Modal</button>
        Pattern Detail Modal
      </div>
    ) : null
}));

// Buttonのモック
jest.mock('@/components/part/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, variant }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-testid={typeof children === 'string' ? children : 'button'}
    >
      {children}
    </button>
  )
}));

// Loadingのモック
jest.mock('@/components/part/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>
}));

describe('PatternViewScreen', () => {
  const mockProps = {
    patterns: mockPatternData,
    loading: false,
    onBack: jest.fn(),
    onHome: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ローディング状態', () => {
    it('loading=trueの場合、ローディング画面が表示される', () => {
      render(<PatternViewScreen {...mockProps} loading={true} />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('図案を生成中...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('errorがある場合、エラー画面が表示される', () => {
      render(
        <PatternViewScreen 
          {...mockProps} 
          error="APIエラーが発生しました" 
        />
      );
      
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('APIエラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });

    it('エラー画面の戻るボタンをクリックするとonBackが呼ばれる', () => {
      const mockOnBack = jest.fn();
      render(
        <PatternViewScreen 
          {...mockProps} 
          error="テストエラー"
          onBack={mockOnBack}
        />
      );
      
      fireEvent.click(screen.getByText('戻る'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('正常状態', () => {
    it('ヘッダーが正しく表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByText('② Step')).toBeInTheDocument();
      expect(screen.getByText('日')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('説明文が表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByText('Pick one you like.')).toBeInTheDocument();
    });

    it('パターンプレビューが表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByTestId('pattern-preview-1')).toBeInTheDocument();
      expect(screen.getByTestId('pattern-preview-2')).toBeInTheDocument();
    });
  });

  describe('図案が存在しない場合', () => {
    it('空の図案リストの場合、メッセージが表示される', () => {
      render(<PatternViewScreen {...mockProps} patterns={[]} />);
      
      expect(screen.getByText('図案が見つかりませんでした')).toBeInTheDocument();
      expect(screen.getByText('ビーズの組み合わせを変更して再度お試しください')).toBeInTheDocument();
      expect(screen.getByText('ビーズ数を変更する')).toBeInTheDocument();
    });

    it('空の場合の戻るボタンでonBackが呼ばれる', () => {
      const mockOnBack = jest.fn();
      render(
        <PatternViewScreen 
          {...mockProps} 
          patterns={[]} 
          onBack={mockOnBack}
        />
      );
      
      fireEvent.click(screen.getByText('ビーズ数を変更する'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('パターン選択機能', () => {
    it('パターンをクリックするとモーダルが開く', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      const pattern1 = screen.getByTestId('pattern-preview-1');
      fireEvent.click(pattern1);
      
      expect(screen.getByTestId('pattern-detail-modal')).toBeInTheDocument();
    });

    it('パターンをクリックすると選択状態になる', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      const pattern1 = screen.getByTestId('pattern-preview-1');
      fireEvent.click(pattern1);
      
      expect(pattern1).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('モーダル操作', () => {
    it('パターンクリックでモーダルが正しく開く', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      // パターンをクリックしてモーダルを開く
      fireEvent.click(screen.getByTestId('pattern-preview-1'));
      
      expect(screen.getByTestId('pattern-detail-modal')).toBeInTheDocument();
    });

    it('モーダルの閉じるボタンでモーダルが閉じる', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      // パターンをクリックしてモーダルを開く
      fireEvent.click(screen.getByTestId('pattern-preview-1'));
      
      expect(screen.getByTestId('pattern-detail-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Close Modal'));
      
      expect(screen.queryByTestId('pattern-detail-modal')).not.toBeInTheDocument();
    });

    it('モーダルのホームボタンでモーダルが閉じてonHomeが呼ばれる', () => {
      const mockOnHome = jest.fn();
      render(<PatternViewScreen {...mockProps} onHome={mockOnHome} />);
      
      // パターンをクリックしてモーダルを開く
      fireEvent.click(screen.getByTestId('pattern-preview-1'));
      
      // モーダルのホームボタンをクリック
      fireEvent.click(screen.getByText('Home from Modal'));
      
      expect(mockOnHome).toHaveBeenCalledTimes(1);
    });
  });

  describe('ナビゲーション', () => {
    it('言語切り替えボタンが正しく表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      const japaneseButton = screen.getByText('日');
      const englishButton = screen.getByText('EN');
      
      expect(japaneseButton).toBeInTheDocument();
      expect(englishButton).toBeInTheDocument();
    });

    it('言語切り替えボタンがクリック可能である', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      const japaneseButton = screen.getByText('日');
      const englishButton = screen.getByText('EN');
      
      // クリックイベントが発生することを確認（エラーが出ないことを確認）
      fireEvent.click(japaneseButton);
      fireEvent.click(englishButton);
      
      expect(japaneseButton).toBeInTheDocument();
      expect(englishButton).toBeInTheDocument();
    });
  });

  describe('レスポンシブ対応', () => {
    it('図案グリッドが適切なクラスを持つ', () => {
      const { container } = render(<PatternViewScreen {...mockProps} />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });
  });

  describe('アクセシビリティ', () => {
    it('メインコンテンツがmain要素で囲まれている', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('ヘッダーがheader要素で囲まれている', () => {
      const { container } = render(<PatternViewScreen {...mockProps} />);
      
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });
});
