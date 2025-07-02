import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatternPreview } from './index';
import { BeadCounts } from '@/types/index';

// PatternGridのモック
jest.mock('@/components/module/PatternGrid', () => ({
  PatternGrid: ({ 
    interactive, 
    selected, 
    onClick, 
    patternId 
  }: {
    interactive: boolean;
    selected: boolean;
    onClick: () => void;
    patternId: string;
  }) => (
    <div
      data-testid="pattern-grid"
      data-interactive={interactive}
      data-selected={selected}
      data-pattern-id={patternId}
      onClick={onClick}
    >
      Mocked PatternGrid
    </div>
  )
}));

describe('PatternPreview', () => {
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
    id: '1',
    pattern: 'w'.repeat(256),
    beadCounts: mockBeadCounts,
    selected: false,
    onSelect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本表示', () => {
    it('コンポーネントが正しく表示される', () => {
      render(<PatternPreview {...mockProps} />);
      
      expect(screen.getByText('図案 1')).toBeInTheDocument();
      expect(screen.getByTestId('pattern-grid')).toBeInTheDocument();
    });

    it('PatternGridに正しいpropsが渡される', () => {
      render(<PatternPreview {...mockProps} />);
      
      const patternGrid = screen.getByTestId('pattern-grid');
      expect(patternGrid).toHaveAttribute('data-interactive', 'true');
      expect(patternGrid).toHaveAttribute('data-selected', 'false');
      expect(patternGrid).toHaveAttribute('data-pattern-id', '1');
    });
  });

  describe('選択状態', () => {
    it('selected=trueの場合、PatternGridにselected=trueが渡される', () => {
      render(<PatternPreview {...mockProps} selected={true} />);
      
      const patternGrid = screen.getByTestId('pattern-grid');
      expect(patternGrid).toHaveAttribute('data-selected', 'true');
    });

    it('selected=falseの場合、PatternGridにselected=falseが渡される', () => {
      render(<PatternPreview {...mockProps} selected={false} />);
      
      const patternGrid = screen.getByTestId('pattern-grid');
      expect(patternGrid).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('クリックイベント', () => {
    it('PatternGridをクリックするとonSelectが呼ばれる', () => {
      const mockOnSelect = jest.fn();
      render(<PatternPreview {...mockProps} onSelect={mockOnSelect} />);
      
      const patternGrid = screen.getByTestId('pattern-grid');
      fireEvent.click(patternGrid);
      
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });
  });

  describe('ビーズ数表示', () => {
    it('使用数の多い色から3色まで表示される', () => {
      render(<PatternPreview {...mockProps} />);
      
      // 白(151), 赤(50), 青(30) の順で表示されるはず
      expect(screen.getByText('151')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      
      // 0個の色は表示されない
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('絵文字が正しく表示される', () => {
      render(<PatternPreview {...mockProps} />);
      
      // 使用されている色の絵文字が表示される
      expect(screen.getByText('⚪')).toBeInTheDocument(); // 白
      expect(screen.getByText('🔴')).toBeInTheDocument(); // 赤
      expect(screen.getByText('🔵')).toBeInTheDocument(); // 青
    });

    it('全ての色が0個の場合、「色情報なし」が表示される', () => {
      const emptyBeadCounts: BeadCounts = {
        red: 0,
        orange: 0,
        yellow: 0,
        green: 0,
        blue: 0,
        purple: 0,
        black: 0,
        white: 0,
        pink: 0,
        brown: 0
      };

      render(
        <PatternPreview 
          {...mockProps} 
          beadCounts={emptyBeadCounts} 
        />
      );
      
      expect(screen.getByText('色情報なし')).toBeInTheDocument();
    });

    it('使用色が3色未満の場合、実際の数だけ表示される', () => {
      const limitedBeadCounts: BeadCounts = {
        red: 100,
        orange: 0,
        yellow: 50,
        green: 0,
        blue: 0,
        purple: 0,
        black: 0,
        white: 0,
        pink: 0,
        brown: 0
      };

      render(
        <PatternPreview 
          {...mockProps} 
          beadCounts={limitedBeadCounts} 
        />
      );
      
      // 2色のみ表示される
      expect(screen.getByText('100')).toBeInTheDocument(); // 赤
      expect(screen.getByText('50')).toBeInTheDocument(); // 黄
      
      // 3つ目の色要素は存在しない
      const colorElements = screen.getAllByText(/^\d+$/);
      expect(colorElements).toHaveLength(2);
    });

    it('使用数順に正しくソートされる', () => {
      const sortTestBeadCounts: BeadCounts = {
        red: 10,
        orange: 0,
        yellow: 100, // 最大
        green: 0,
        blue: 50,    // 2番目
        purple: 0,
        black: 0,
        white: 75,   // 3番目
        pink: 0,
        brown: 0
      };

      const { container } = render(
        <PatternPreview 
          {...mockProps} 
          beadCounts={sortTestBeadCounts} 
        />
      );
      
      // 色要素を順番に取得
      const colorSpans = container.querySelectorAll('.inline-flex.items-center span:last-child');
      const counts = Array.from(colorSpans).map(span => span.textContent);
      
      expect(counts).toEqual(['100', '75', '50']); // 降順
    });
  });

  describe('パターンID', () => {
    it('異なるIDで正しく表示される', () => {
      render(<PatternPreview {...mockProps} id="ABC" />);
      
      expect(screen.getByText('図案 ABC')).toBeInTheDocument();
      
      const patternGrid = screen.getByTestId('pattern-grid');
      expect(patternGrid).toHaveAttribute('data-pattern-id', 'ABC');
    });
  });

  describe('スタイリング', () => {
    it('カードコンテナが正しいクラスを持つ', () => {
      const { container } = render(<PatternPreview {...mockProps} />);
      
      const card = container.firstChild;
      expect(card).toHaveClass(
        'bg-white',
        'rounded-lg',
        'shadow-md',
        'p-4',
        'hover:shadow-lg',
        'transition-shadow'
      );
    });
  });
});
