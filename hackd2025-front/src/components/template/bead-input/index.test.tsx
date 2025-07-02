import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeadInputScreen from './index';

// BeadInputコンポーネントをモック
jest.mock('../../part/BeadInput', () => {
  return function MockBeadInput({ color, value, onChange }: { 
    color: string; 
    value: number; 
    onChange: (value: number) => void;
  }) {
    return (
      <div data-testid={`bead-input-${color}`}>
        <span>{color}: {value}</span>
        <button onClick={() => onChange(value + 1)}>Increment {color}</button>
      </div>
    );
  };
});

describe('BeadInputScreen', () => {
  it('renders correctly with title and instructions', () => {
    render(<BeadInputScreen />);
    
    // 実装のテキストではない部分が実際にレンダリングされていることを確認する
    // 実際のレンダリング内容から確認
    expect(screen.getByText('ビーズ数を1個以上設定してください')).toBeDefined();
  });

  it('renders all 10 bead colors', () => {
    render(<BeadInputScreen />);
    
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'white', 'pink', 'brown'];
    
    colors.forEach(color => {
      expect(screen.getByTestId(`bead-input-${color}`)).toBeDefined();
    });
  });

  it('initially shows all bead counts as 0', () => {
    render(<BeadInputScreen />);
    
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'white', 'pink', 'brown'];
    
    colors.forEach(color => {
      expect(screen.getByText(`${color}: 0`)).toBeDefined();
    });
  });

  it('disables buttons when no beads are set', () => {
    render(<BeadInputScreen />);
    
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    const submitButton = screen.getByRole('button', { name: /Next/i });
    
    expect(resetButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('shows help text when no beads are set', () => {
    render(<BeadInputScreen />);
    
    expect(screen.getByText('ビーズ数を1個以上設定してください')).toBeDefined();
  });

  it('enables buttons when beads are set', async () => {
    const user = userEvent.setup();
    render(<BeadInputScreen />);
    
    // モックのIncrement redボタンをクリックして値を増やす
    const incrementRedButton = screen.getByText('Increment red');
    await user.click(incrementRedButton);
    
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    const submitButton = screen.getByRole('button', { name: /Next/i });
    
    expect(resetButton).not.toBeDisabled();
    expect(submitButton).not.toBeDisabled();
  });

  it('updates bead count when BeadInput onChange is called', async () => {
    const user = userEvent.setup();
    render(<BeadInputScreen />);
    
    // 初期状態では赤は0
    expect(screen.getByText('red: 0')).toBeDefined();
    
    // Increment redボタンをクリック
    const incrementRedButton = screen.getByText('Increment red');
    await user.click(incrementRedButton);
    
    // 値が1に更新される
    expect(screen.getByText('red: 1')).toBeDefined();
  });

  it('resets all bead counts when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<BeadInputScreen />);
    
    // いくつかの値を設定
    await user.click(screen.getByText('Increment red'));
    await user.click(screen.getByText('Increment blue'));
    
    expect(screen.getByText('red: 1')).toBeDefined();
    expect(screen.getByText('blue: 1')).toBeDefined();
    
    // リセットボタンをクリック
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetButton);
    
    // 全ての値が0にリセットされる
    expect(screen.getByText('red: 0')).toBeDefined();
    expect(screen.getByText('blue: 0')).toBeDefined();
  });

  it('shows alert when submit button is clicked', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    
    render(<BeadInputScreen />);
    
    // ビーズ数を設定
    await user.click(screen.getByText('Increment red'));
    
    // 提案ボタンをクリック
    const submitButton = screen.getByRole('button', { name: /Next/i });
    await user.click(submitButton);
    
    expect(alertSpy).toHaveBeenCalledWith('図案を提案する機能は準備中です');
    
    alertSpy.mockRestore();
  });

  it('has responsive layout classes', () => {
    const { container } = render(<BeadInputScreen />);
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('min-h-screen');
    expect(mainDiv.className).toContain('bg-gray-50');
    expect(mainDiv.className).toContain('bg-cover');
    expect(mainDiv.className).toContain('bg-center');
    expect(mainDiv.className).toContain('bg-no-repeat');
    
    // 内部のコンテナも確認
    const contentDiv = mainDiv.querySelector('.max-w-2xl');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv?.className).toContain('pt-8');
    expect(contentDiv?.className).toContain('pb-8');
    expect(contentDiv?.className).toContain('px-4');
  });
});
