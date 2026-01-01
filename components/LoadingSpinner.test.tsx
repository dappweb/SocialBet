import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('LoadingSpinner', () => {
    it('renders without text by default', () => {
        render(<LoadingSpinner />);
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('renders with custom text', () => {
        render(<LoadingSpinner text="Testing..." />);
        expect(screen.getByText('Testing...')).toBeInTheDocument();
    });
});
