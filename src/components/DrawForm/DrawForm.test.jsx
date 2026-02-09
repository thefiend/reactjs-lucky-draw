import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DrawForm from './index';

describe('DrawForm Component', () => {
  const mockProps = {
    style: {},
    className: 'test-class',
    onSubmit: jest.fn(),
    onChange: jest.fn(),
    placeholder: 'Enter items here',
    value: 'Item 1\nItem 2\nItem 3',
    drawItems: ['Item 1', 'Item 2', 'Item 3'],
    handleSkipAnimationChange: jest.fn(),
    handleRemoveDrawnItemChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DrawForm {...mockProps} />);
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('displays the correct placeholder', () => {
    render(<DrawForm {...mockProps} />);
    const textarea = screen.getByPlaceholderText('Enter items here');
    expect(textarea).toBeInTheDocument();
  });

  it('displays the correct value', () => {
    render(<DrawForm {...mockProps} />);
    const textarea = screen.getByPlaceholderText('Enter items here');
    expect(textarea.value).toBe('Item 1\nItem 2\nItem 3');
  });

  it('calls onChange when textarea value changes', () => {
    render(<DrawForm {...mockProps} />);
    const textarea = screen.getByPlaceholderText('Enter items here');
    fireEvent.change(textarea, { target: { name: 'drawItems', value: 'New Item' } });
    expect(mockProps.onChange).toHaveBeenCalled();
    expect(mockProps.onChange.mock.calls[0][0]).toHaveProperty('name', 'drawItems');
  });

  it('calls onSubmit when form is submitted', () => {
    render(<DrawForm {...mockProps} />);
    const form = screen.getByRole('button', { name: /configure/i }).closest('form');
    fireEvent.submit(form);
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('calls handleSkipAnimationChange when Skip Animation checkbox is changed', () => {
    render(<DrawForm {...mockProps} />);
    const checkbox = screen.getByLabelText('Skip Animation');
    fireEvent.click(checkbox);
    expect(mockProps.handleSkipAnimationChange).toHaveBeenCalled();
  });

  it('calls handleRemoveDrawnItemChange when Remove Drawn Item checkbox is changed', () => {
    render(<DrawForm {...mockProps} />);
    const checkbox = screen.getByLabelText('Remove Drawn Item');
    fireEvent.click(checkbox);
    expect(mockProps.handleRemoveDrawnItemChange).toHaveBeenCalled();
  });

  it('disables Configure button when drawItems has less than 2 items', () => {
    const propsWithFewItems = { ...mockProps, drawItems: ['Item 1'] };
    render(<DrawForm {...propsWithFewItems} />);
    const button = screen.getByRole('button', { name: /configure/i });
    expect(button).toBeDisabled();
  });

  it('enables Configure button when drawItems has 2 or more items', () => {
    render(<DrawForm {...mockProps} />);
    const button = screen.getByRole('button', { name: /configure/i });
    expect(button).not.toBeDisabled();
  });

  it('renders Skip Animation checkbox', () => {
    render(<DrawForm {...mockProps} />);
    expect(screen.getByLabelText('Skip Animation')).toBeInTheDocument();
  });

  it('renders Remove Drawn Item checkbox', () => {
    render(<DrawForm {...mockProps} />);
    expect(screen.getByLabelText('Remove Drawn Item')).toBeInTheDocument();
  });
});
