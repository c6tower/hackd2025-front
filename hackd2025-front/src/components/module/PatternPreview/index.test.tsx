import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatternPreview } from './index';

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
  const mockProps = {
    id: '1',
    title: 'テスト図案',
    pattern: 'w'.repeat(256),
    selected: false,
    onSelect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本表示', () => {
    it('コンポーネントが正しく表示される', () => {
      render(<PatternPreview {...mockProps} />);
      
      expect(screen.getByTestId('pattern-grid')).toBeInTheDocument();
    });

    it('PatternGridに正しいpropsが渡される', () => {
      render(<PatternPreview {...mockProps} />);
      
      const patternGrid = screen.getByTestId('pattern-grid');
      expect(patternGrid).toHaveAttribute('data-interactive', 'true');
      expect(patternGrid).toHaveAttribute('data-selected', 'false');
      expect(patternGrid).toHaveAttribute('data-pattern-id', '1');
    });

    it('タイトルが正しく表示される', () => {
      render(<PatternPreview {...mockProps} />);
      
      expect(screen.getByText('テスト図案')).toBeInTheDocument();
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

  describe('パターンID', () => {
    it('異なるIDで正しく表示される', () => {
      render(<PatternPreview {...mockProps} id="ABC" />);
      
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
