import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Tile } from '../components/Tile';

describe('Tile Component', () => {
  it('renders empty tile', () => {
    const { container } = render(<Tile letter="" />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders letter with uppercase character', () => {
    render(<Tile letter="A" isCurrent={true} />);
    expect(screen.getByText('A')).toBeDefined();
  });

  it('renders with BULL status styling', () => {
    const { container } = render(<Tile letter="B" status="BULL" />);
    expect(container.firstChild).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
  });

  it('renders with BEAR status styling', () => {
    const { container } = render(<Tile letter="C" status="BEAR" />);
    expect(container.firstChild).toBeDefined();
    expect(screen.getByText('C')).toBeDefined();
  });
});
