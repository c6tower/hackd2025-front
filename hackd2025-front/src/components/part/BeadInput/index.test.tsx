import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeadInput from './index';

describe('BeadInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with given props', () => {
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const numberInput = screen.getByLabelText('赤の個数を直接入力');
    expect(numberInput).toHaveValue(10);
    expect(screen.getByText('赤')).toBeDefined();
    expect(screen.getByText('🔴')).toBeDefined();
    expect(screen.getByText('個')).toBeDefined();
  });

  it('calls onChange when slider value changes', async () => {
    const user = userEvent.setup();
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const slider = screen.getByLabelText('赤の個数を設定');
    await user.click(slider);
    // スライダーの場合は直接changeイベントをシミュレート
    fireEvent.change(slider, { target: { value: '20' } });

    expect(mockOnChange).toHaveBeenCalledWith(20);
  });

  it('calls onChange when number input changes', async () => {
    const user = userEvent.setup();
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const numberInput = screen.getByLabelText('赤の個数を直接入力');
    await user.clear(numberInput);
    await user.type(numberInput, '25');

    expect(mockOnChange).toHaveBeenCalledWith(25);
  });

  it('increments value when plus button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const plusButton = screen.getByLabelText('赤を1個増やす');
    await user.click(plusButton);

    expect(mockOnChange).toHaveBeenCalledWith(11);
  });

  it('decrements value when minus button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const minusButton = screen.getByLabelText('赤を1個減らす');
    await user.click(minusButton);

    expect(mockOnChange).toHaveBeenCalledWith(9);
  });

  it('disables minus button when value is at minimum', () => {
    render(
      <BeadInput
        color="red"
        value={0}
        onChange={mockOnChange}
        min={0}
      />
    );

    const minusButton = screen.getByLabelText('赤を1個減らす');
    expect(minusButton).toBeDisabled();
  });

  it('disables plus button when value is at maximum', () => {
    render(
      <BeadInput
        color="red"
        value={256}
        onChange={mockOnChange}
        max={256}
      />
    );

    const plusButton = screen.getByLabelText('赤を1個増やす');
    expect(plusButton).toBeDisabled();
  });

  it('handles keyboard events correctly', async () => {
    const user = userEvent.setup();
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const numberInput = screen.getByLabelText('赤の個数を直接入力');
    await user.clear(numberInput);
    await user.type(numberInput, '15');
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith(15);
  });

  it('clamps value to valid range', async () => {
    const user = userEvent.setup();
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
        min={0}
        max={256}
      />
    );

    const numberInput = screen.getByLabelText('赤の個数を直接入力');
    await user.clear(numberInput);
    await user.type(numberInput, '300');
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(256);
    });
  });

  it('renders different colors correctly', () => {
    const { rerender } = render(
      <BeadInput
        color="blue"
        value={5}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('🔵')).toBeInTheDocument();
    expect(screen.getByText('青')).toBeInTheDocument();

    rerender(
      <BeadInput
        color="green"
        value={5}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('緑')).toBeInTheDocument();
  });
});
