import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

interface Athlete { _id: string; name: string; achievements?: string[] }

function FifaPlayerCard({ athlete, onMatch, disabled, showMatchButton = true }: { athlete: Athlete; onMatch: () => void; disabled?: boolean; showMatchButton?: boolean }) {
  const rating = Math.min(99, 60 + (athlete.achievements?.length || 0) * 5);
  return (
    <div>
      <div>{rating}</div>
      <h3>{athlete.name}</h3>
      {showMatchButton && <button onClick={onMatch} disabled={disabled}>Match</button>}
    </div>
  );
}

const athlete: Athlete = { _id: '1', name: 'Test Player' };

describe('FifaPlayerCard', () => {
  it('shows Match button by default', () => {
    render(<FifaPlayerCard athlete={athlete} onMatch={() => {}} />);
    expect(screen.getByRole('button', { name: /match/i })).toBeInTheDocument();
  });

  it('hides Match button when showMatchButton is false', () => {
    render(
      <FifaPlayerCard
        athlete={athlete}
        onMatch={() => {}}
        showMatchButton={false}
      />
    );
    expect(screen.queryByRole('button', { name: /match/i })).toBeNull();
  });
});
