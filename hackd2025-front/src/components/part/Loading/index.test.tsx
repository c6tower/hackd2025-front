import { render, screen } from '@testing-library/react';
import Loading from './index';

describe('Loading', () => {
  it('renders with default props', () => {
    render(<Loading />);
    
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('読み込み中...')).toBeDefined();
  });

  it('renders with custom text', () => {
    render(<Loading text="カスタム読み込みメッセージ" />);
    
    expect(screen.getByText('カスタム読み込みメッセージ')).toBeDefined();
  });

  it('applies correct accessibility attributes', () => {
    render(<Loading />);
    
    const statusElement = screen.getByRole('status');
    expect(statusElement.getAttribute('aria-label')).toBe('読み込み中');
  });

  it('applies small size styles', () => {
    render(<Loading size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('w-6');
    expect(spinner.className).toContain('h-6');
  });

  it('applies medium size styles by default', () => {
    render(<Loading />);
    
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('w-8');
    expect(spinner.className).toContain('h-8');
  });

  it('applies large size styles', () => {
    render(<Loading size="lg" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('w-12');
    expect(spinner.className).toContain('h-12');
  });

  it('applies correct text size classes', () => {
    const { rerender } = render(<Loading size="sm" />);
    expect(screen.getByText('読み込み中...').className).toContain('text-sm');
    
    rerender(<Loading size="md" />);
    expect(screen.getByText('読み込み中...').className).toContain('text-base');
    
    rerender(<Loading size="lg" />);
    expect(screen.getByText('読み込み中...').className).toContain('text-lg');
  });

  it('has spinning animation', () => {
    render(<Loading />);
    
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('animate-spin');
  });
});
