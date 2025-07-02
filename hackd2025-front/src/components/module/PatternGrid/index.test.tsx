import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatternGrid } from './index';

describe('PatternGrid', () => {
  const mockPattern = 'w'.repeat(256); // 全て白のパターン

  describe('基本表示', () => {
    it('16x16のグリッドが正しく表示される', () => {
      const { container } = render(<PatternGrid pattern={mockPattern} />);
      
      // 256個のセルが存在することを確認
      const cells = container.querySelectorAll('.border-gray-200');
      expect(cells.length).toBe(256);
    });

    it('パターンが正しく色に変換される', () => {
      const colorPattern = 'rwbg' + 'n'.repeat(252); // 赤、白、青、緑、残りはnull
      const { container } = render(<PatternGrid pattern={colorPattern} />);
      
      const cells = container.querySelectorAll('.border-gray-200');
      expect(cells[0]).toHaveStyle('background-color: #FF0000'); // 赤
      expect(cells[1]).toHaveStyle('background-color: #FFFFFF'); // 白
      expect(cells[2]).toHaveStyle('background-color: #0000FF'); // 青
      expect(cells[3]).toHaveStyle('background-color: #008000'); // 緑
    });
  });

  describe('サイズ設定', () => {
    it('smallサイズでは小さなグリッドが表示される', () => {
      const { container } = render(<PatternGrid pattern={mockPattern} size="small" />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('w-32', 'h-32');
      
      const cells = container.querySelectorAll('.border-gray-200');
      expect(cells[0]).toHaveClass('w-2', 'h-2');
    });

    it('largeサイズでは大きなグリッドが表示される', () => {
      const { container } = render(<PatternGrid pattern={mockPattern} size="large" />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('w-80', 'h-80');
      
      const cells = container.querySelectorAll('.border-gray-200');
      expect(cells[0]).toHaveClass('w-5', 'h-5');
    });
  });

  describe('インタラクティブ機能', () => {
    it('interactive=trueの場合、クリック可能になる', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          interactive={true} 
          onClick={mockOnClick} 
        />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('cursor-pointer');
      expect(grid).toHaveAttribute('role', 'button');
      expect(grid).toHaveAttribute('tabIndex', '0');
    });

    it('グリッドをクリックするとonClickが呼ばれる', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          interactive={true} 
          onClick={mockOnClick} 
        />
      );
      
      const grid = container.querySelector('.grid');
      if (grid) {
        fireEvent.click(grid);
      }
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('Enterキーでもクリックイベントが発火する', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          interactive={true} 
          onClick={mockOnClick} 
        />
      );
      
      const grid = container.querySelector('.grid');
      if (grid) {
        fireEvent.keyDown(grid, { key: 'Enter' });
      }
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('スペースキーでもクリックイベントが発火する', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          interactive={true} 
          onClick={mockOnClick} 
        />
      );
      
      const grid = container.querySelector('.grid');
      if (grid) {
        fireEvent.keyDown(grid, { key: ' ' });
      }
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('選択状態', () => {
    it('selected=trueの場合、選択スタイルが適用される', () => {
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          selected={true} 
          interactive={true}
        />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('ring-4', 'ring-blue-500', 'border-blue-500');
    });

    it('選択状態で選択マーカーが表示される', () => {
      render(
        <PatternGrid 
          pattern={mockPattern} 
          selected={true} 
          interactive={true}
        />
      );
      
      expect(screen.getByText('○選択')).toBeInTheDocument();
    });

    it('非選択状態では通常のボーダーが表示される', () => {
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          selected={false} 
          interactive={true}
        />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('border-gray-300');
      expect(grid).not.toHaveClass('ring-4');
    });
  });

  describe('アクセシビリティ', () => {
    it('interactive=trueの場合、適切なaria-labelが設定される', () => {
      const { container } = render(
        <PatternGrid 
          pattern={mockPattern} 
          interactive={true} 
          patternId="1"
        />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveAttribute('aria-label', '図案1を選択');
    });

    it('セルにはaria-hiddenが設定される', () => {
      const { container } = render(<PatternGrid pattern={mockPattern} />);
      
      const cells = container.querySelectorAll('.border-gray-200');
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('256文字未満のパターンでも正常に表示される', () => {
      const shortPattern = 'rwb'; // 3文字のみ
      const { container } = render(<PatternGrid pattern={shortPattern} />);
      
      const cells = container.querySelectorAll('.border-gray-200');
      expect(cells.length).toBe(256); // 256個のセルが表示される
    });

    it('不明な文字は白として扱われる', () => {
      const invalidPattern = 'xyz' + 'n'.repeat(253);
      const { container } = render(<PatternGrid pattern={invalidPattern} />);
      
      const cells = container.querySelectorAll('.border-gray-200');
      // 不明な文字は白として表示される
      expect(cells[0]).toHaveStyle('background-color: #FFFFFF');
    });
  });
});
