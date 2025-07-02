import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionButton from './index';

// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('ActionButton', () => {
  const mockProps = {
    icon: '/mock-icon.png',
    text: 'Test Button',
    alt: 'テストアイコン',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本表示', () => {
    it('アイコンとテキストが正しく表示される', () => {
      render(<ActionButton {...mockProps} />);
      
      const icon = screen.getByAltText('テストアイコン');
      const text = screen.getByText('Test Button');
      
      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });

    it('アイコンが正しいsrcとサイズで表示される', () => {
      render(<ActionButton {...mockProps} />);
      
      const icon = screen.getByAltText('テストアイコン');
      expect(icon).toHaveAttribute('src', '/mock-icon.png');
      expect(icon).toHaveAttribute('width', '120');
      expect(icon).toHaveAttribute('height', '120');
    });
  });

  describe('クリック機能', () => {
    it('ボタンをクリックするとonClickが呼ばれる', () => {
      const mockOnClick = jest.fn();
      render(<ActionButton {...mockProps} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('無効化状態', () => {
    it('disabled=trueの場合、ボタンが無効化される', () => {
      render(<ActionButton {...mockProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disabled=trueの場合、onClickが呼ばれない', () => {
      const mockOnClick = jest.fn();
      render(<ActionButton {...mockProps} onClick={mockOnClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('disabled=trueの場合、無効化スタイルが適用される', () => {
      render(<ActionButton {...mockProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('スタイリング', () => {
    it('デフォルトのスタイルクラスが適用される', () => {
      render(<ActionButton {...mockProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-2',
        'transition-opacity',
        'hover:opacity-80',
        'w-[180px]',
        'h-[180px]',
        'bg-white',
        'rounded-full',
        'shadow-lg'
      );
    });

    it('カスタムクラス名が追加される', () => {
      render(<ActionButton {...mockProps} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('アクセシビリティ', () => {
    it('button要素として認識される', () => {
      render(<ActionButton {...mockProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('アイコンに適切なalt属性が設定される', () => {
      render(<ActionButton {...mockProps} />);
      
      const icon = screen.getByAltText('テストアイコン');
      expect(icon).toBeInTheDocument();
    });
  });
});
