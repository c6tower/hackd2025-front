import { render, screen, fireEvent } from '@testing-library/react';
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

    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByText('赤')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('calls onChange when slider value changes', () => {
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });

    expect(mockOnChange).toHaveBeenCalledWith(20);
  });

  it('calls onChange when number input changes', () => {
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const numberInput = screen.getByDisplayValue('10');
    fireEvent.change(numberInput, { target: { value: '25' } });

    expect(mockOnChange).toHaveBeenCalledWith(25);
  });

  it('increments value when plus button is clicked', () => {
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const plusButton = screen.getByLabelText('赤を1個増やす');
    fireEvent.mouseDown(plusButton);

    expect(mockOnChange).toHaveBeenCalledWith(11);
  });

  it('decrements value when minus button is clicked', () => {
    render(
      <BeadInput
        color="red"
        value={10}
        onChange={mockOnChange}
      />
    );

    const minusButton = screen.getByLabelText('赤を1個減らす');
    fireEvent.mouseDown(minusButton);

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
});
