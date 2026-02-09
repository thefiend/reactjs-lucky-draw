import React from 'react';
import { render, screen } from '@testing-library/react';
import PreviouslyDrawnItemsBlock from './index';

describe('PreviouslyDrawnItemsBlock Component', () => {
  it('renders without crashing', () => {
    render(<PreviouslyDrawnItemsBlock pastDrawnItems={[]} />);
    expect(screen.getByText('Previously Drawn')).toBeInTheDocument();
  });

  it('displays "No previous item." when pastDrawnItems is empty', () => {
    render(<PreviouslyDrawnItemsBlock pastDrawnItems={[]} />);
    expect(screen.getByText('No previous item.')).toBeInTheDocument();
  });

  it('displays a single drawn item', () => {
    const pastDrawnItems = ['Winner 1'];
    render(<PreviouslyDrawnItemsBlock pastDrawnItems={pastDrawnItems} />);
    expect(screen.getByText('Winner 1')).toBeInTheDocument();
  });

  it('displays multiple drawn items', () => {
    const pastDrawnItems = ['Winner 1', 'Winner 2', 'Winner 3'];
    render(<PreviouslyDrawnItemsBlock pastDrawnItems={pastDrawnItems} />);
    expect(screen.getByText('Winner 1')).toBeInTheDocument();
    expect(screen.getByText('Winner 2')).toBeInTheDocument();
    expect(screen.getByText('Winner 3')).toBeInTheDocument();
  });

  it('renders items in table rows', () => {
    const pastDrawnItems = ['Winner 1', 'Winner 2'];
    const { container } = render(<PreviouslyDrawnItemsBlock pastDrawnItems={pastDrawnItems} />);
    const tableRows = container.querySelectorAll('tr');
    expect(tableRows.length).toBe(2);
  });

  it('maintains the order of drawn items', () => {
    const pastDrawnItems = ['First', 'Second', 'Third'];
    const { container } = render(<PreviouslyDrawnItemsBlock pastDrawnItems={pastDrawnItems} />);
    const cells = container.querySelectorAll('td');
    expect(cells[0]).toHaveTextContent('First');
    expect(cells[1]).toHaveTextContent('Second');
    expect(cells[2]).toHaveTextContent('Third');
  });
});
