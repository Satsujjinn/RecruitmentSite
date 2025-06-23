import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AthleteGrid from '../components/AthleteGrid';

// Mock FifaPlayerCard to avoid Next.js transforms
jest.mock('shared/src/components/FifaPlayerCard', () => ({
  __esModule: true,
  default: ({ athlete, onMatch, disabled }: any) => (
    <button disabled={disabled} onClick={onMatch}>{athlete.name}</button>
  ),
}));

describe('AthleteGrid', () => {
  const athletes = [
    { _id: '1', name: 'A1' },
    { _id: '2', name: 'A2' },
  ];

  it('renders a card for each athlete', () => {
    const onMatch = jest.fn();
    render(<AthleteGrid athletes={athletes} onMatch={onMatch} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('calls onMatch with athlete id', () => {
    const onMatch = jest.fn();
    render(<AthleteGrid athletes={athletes} onMatch={onMatch} />);
    const button = screen.getByText('A1');
    fireEvent.click(button);
    expect(onMatch).toHaveBeenCalledWith('1');
  });

  it('disables buttons when disabled', () => {
    const onMatch = jest.fn();
    render(<AthleteGrid athletes={athletes} onMatch={onMatch} disabled />);
    const button = screen.getByText('A1');
    expect(button).toBeDisabled();
  });
});
