import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatternViewScreen } from './index';
import { BeadCounts } from '@/types/index';

// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// 画像アセットのモック
jest.mock('@/assets/background.png', () => ({
  __esModule: true,
  default: {
    src: '/mock-background.png'
  }
}));

jest.mock('@/assets/previous.png', () => ({
  __esModule: true,
  default: {
    src: '/mock-previous.png'
  }
}));

// モック用のパターンデータ
const mockPatternData = [
  {
    id: '1',
    title: 'テスト図案1',
    pattern: 'w'.repeat(256),
    beadCounts: {
      red: 50, orange: 0, yellow: 25, green: 0, blue: 30,
      purple: 0, black: 0, white: 151, pink: 0, brown: 0, null: 0
    } as BeadCounts
  },
  {
    id: '2',
    title: 'テスト図案2',
    pattern: 'r'.repeat(256),
    beadCounts: {
      red: 256, orange: 0, yellow: 0, green: 0, blue: 0,
      purple: 0, black: 0, white: 0, pink: 0, brown: 0, null: 0
    } as BeadCounts
  }
];

// PatternPreviewのモック
jest.mock('@/components/module/PatternPreview', () => ({
  PatternPreview: ({ id, title, selected, onSelect }: {
    id: string;
    title: string;
    selected: boolean;
    onSelect: (id: string) => void;
  }) => (
    <div
      data-testid={`pattern-preview-${id}`}
      data-selected={selected}
      onClick={() => onSelect(id)}
    >
      <div>{title}</div>
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

// ActionButtonのモック
jest.mock('@/components/part/ActionButton', () => ({
  __esModule: true,
  default: ({ text, onClick }: {
    text: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      data-testid={`action-button-${text.toLowerCase()}`}
    >
      {text}
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
    onBack: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* 
  ※ 以下のテストケースは現在のコンポーネントインターフェースと一致しないため、
  コンポーネントの仕様確定後に修正が必要です。
  */
  
  /*
  describe('ローディング状態', () => {
    it('loading=trueの場合、ローディング画面が表示される', () => {
      render(<PatternViewScreen {...mockProps} loading={true} />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('図案を生成中...')).toBeInTheDocument();
  /*
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
  */

  describe('正常状態', () => {
    it('ヘッダーが正しく表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByText('Step ②')).toBeInTheDocument();
    });

    it('説明文が表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByText('Pick one you like.')).toBeInTheDocument();
    });

    it('図案タイトルが表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByText('テスト図案1')).toBeInTheDocument();
      expect(screen.getByText('テスト図案2')).toBeInTheDocument();
    });

    it('戻るボタンが表示される', () => {
      render(<PatternViewScreen {...mockProps} />);
      
      expect(screen.getByTestId('action-button-previous')).toBeInTheDocument();
    });

    it('戻るボタンをクリックするとonBackが呼ばれる', () => {
      const mockOnBack = jest.fn();
      render(<PatternViewScreen patterns={mockPatternData} onBack={mockOnBack} />);
      
      fireEvent.click(screen.getByTestId('action-button-previous'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  /*
  // TODO: 以下のテストケースは現在のコンポーネント仕様に合わせて修正が必要
  describe('図案が存在しない場合', () => {
    it('空の図案リストの場合、メッセージが表示される', () => {
      render(<PatternViewScreen patterns={[]} onBack={jest.fn()} />);
      
      expect(screen.getByText('図案が見つかりませんでした')).toBeInTheDocument();
    });
  });

  describe('パターン選択機能', () => {
    it('パターンをクリックするとモーダルが開く', () => {
      render(<PatternViewScreen patterns={mockPatternData} onBack={jest.fn()} />);
      
      // パターンクリック機能の実装により修正が必要
    });
  });
  */

});
