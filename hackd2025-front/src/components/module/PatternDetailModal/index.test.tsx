import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatternDetailModal } from './index';
import { BeadCounts } from '@/types/index';

// PatternGridのモック
jest.mock('@/components/module/PatternGrid', () => ({
  PatternGrid: ({ pattern, size, interactive }: {
    pattern: string;
    size: string;
    interactive: boolean;
  }) => (
    <div
      data-testid="pattern-grid"
      data-pattern={pattern}
      data-size={size}
      data-interactive={interactive}
    >
      Mocked PatternGrid
    </div>
  )
}));

// Buttonのモック
jest.mock('@/components/part/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, 'aria-label': ariaLabel, ...props }: {
    children: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
    variant?: string;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={ariaLabel || 'button'}
      {...props}
    >
      {children}
    </button>
  )
}));

describe('PatternDetailModal', () => {
  const mockBeadCounts: BeadCounts = {
    red: 50,
    orange: 0,
    yellow: 25,
    green: 0,
    blue: 30,
    purple: 0,
    black: 0,
    white: 151,
    pink: 0,
    brown: 0
  };

  const mockProps = {
    isOpen: true,
    patternId: '1',
    pattern: 'w'.repeat(256),
    beadCounts: mockBeadCounts,
    onClose: jest.fn(),
    onHome: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('表示制御', () => {
    it('isOpen=trueの場合、モーダルが表示される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('図案詳細')).toBeInTheDocument();
    });

    it('isOpen=falseの場合、モーダルが表示されない', () => {
      render(<PatternDetailModal {...mockProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('基本表示', () => {
    it('ヘッダーのボタンとタイトルが表示される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      expect(screen.getByText('× 閉じる')).toBeInTheDocument();
      expect(screen.getByText('図案詳細')).toBeInTheDocument();
      expect(screen.getByText('🏠 ホーム')).toBeInTheDocument();
    });

    it('PatternGridが正しいpropsで表示される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      const patternGrid = screen.getByTestId('pattern-grid');
      expect(patternGrid).toHaveAttribute('data-size', 'large');
      expect(patternGrid).toHaveAttribute('data-interactive', 'false');
    });

    it('必要なビーズ数セクションが表示される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      expect(screen.getByText('必要なビーズ')).toBeInTheDocument();
    });
  });

  describe('ビーズ数表示', () => {
    it('使用されている色のビーズ数が表示される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      // 使用数が0より大きい色が表示される
      expect(screen.getByText('151個')).toBeInTheDocument(); // 白
      expect(screen.getByText('50個')).toBeInTheDocument();  // 赤
      expect(screen.getByText('30個')).toBeInTheDocument();  // 青
      expect(screen.getByText('25個')).toBeInTheDocument();  // 黄
      
      // 使用数が0の色は表示されない
      expect(screen.queryByText('0個')).not.toBeInTheDocument();
    });

    it('色名と絵文字が正しく表示される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      expect(screen.getByText('白')).toBeInTheDocument();
      expect(screen.getByText('赤')).toBeInTheDocument();
      expect(screen.getByText('⚪')).toBeInTheDocument(); // 白の絵文字
      expect(screen.getByText('🔴')).toBeInTheDocument(); // 赤の絵文字
    });

    it('使用数の多い順にソートされる', () => {
      const { container } = render(<PatternDetailModal {...mockProps} />);
      
      const beadCards = container.querySelectorAll('.bg-gray-50');
      const firstCard = beadCards[0];
      const lastCard = beadCards[beadCards.length - 1];
      
      // 最初のカードが最も使用数が多い（白：151個）
      expect(firstCard).toHaveTextContent('151個');
      // 最後のカードが最も使用数が少ない（黄：25個）
      expect(lastCard).toHaveTextContent('25個');
    });

    it('合計数が正しく計算される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      const total = 151 + 50 + 30 + 25; // 白 + 赤 + 青 + 黄
      expect(screen.getByText(`合計: ${total}個`)).toBeInTheDocument();
    });

    it('使用色がない場合、メッセージが表示される', () => {
      const emptyBeadCounts: BeadCounts = {
        red: 0, orange: 0, yellow: 0, green: 0, blue: 0,
        purple: 0, black: 0, white: 0, pink: 0, brown: 0
      };

      render(
        <PatternDetailModal 
          {...mockProps} 
          beadCounts={emptyBeadCounts} 
        />
      );
      
      expect(screen.getByText('ビーズ情報が取得できませんでした')).toBeInTheDocument();
      expect(screen.queryByText('合計:')).not.toBeInTheDocument();
    });
  });

  describe('イベントハンドリング', () => {
    it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
      const mockOnClose = jest.fn();
      render(<PatternDetailModal {...mockProps} onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByText('× 閉じる'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('ホームボタンをクリックするとonHomeが呼ばれる', () => {
      const mockOnHome = jest.fn();
      render(<PatternDetailModal {...mockProps} onHome={mockOnHome} />);
      
      fireEvent.click(screen.getByText('🏠 ホーム'));
      expect(mockOnHome).toHaveBeenCalledTimes(1);
    });

    it('背景をクリックするとonCloseが呼ばれる', () => {
      const mockOnClose = jest.fn();
      render(<PatternDetailModal {...mockProps} onClose={mockOnClose} />);
      
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('モーダル内容をクリックしてもonCloseが呼ばれない', () => {
      const mockOnClose = jest.fn();
      render(<PatternDetailModal {...mockProps} onClose={mockOnClose} />);
      
      const modalContent = screen.getByText('図案詳細');
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('Escキーを押すとonCloseが呼ばれる', async () => {
      const mockOnClose = jest.fn();
      render(<PatternDetailModal {...mockProps} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('タイトルに適切なIDが設定される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      const title = screen.getByText('図案詳細');
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('ボタンに適切なaria-labelが設定される', () => {
      render(<PatternDetailModal {...mockProps} />);
      
      expect(screen.getByLabelText('モーダルを閉じる')).toBeInTheDocument();
      expect(screen.getByLabelText('ホームに戻る')).toBeInTheDocument();
    });
  });

  describe('フォーカス管理', () => {
    it('モーダルが開くと最初のフォーカス可能要素にフォーカスが移る', async () => {
      render(<PatternDetailModal {...mockProps} />);
      
      await waitFor(() => {
        const closeButton = screen.getByText('× 閉じる');
        expect(closeButton).toHaveFocus();
      });
    });
  });

  describe('レスポンシブ対応', () => {
    it('グリッドが適切なクラスを持つ', () => {
      const { container } = render(<PatternDetailModal {...mockProps} />);
      
      const beadGrid = container.querySelector('.grid');
      expect(beadGrid).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4');
    });
  });
});
