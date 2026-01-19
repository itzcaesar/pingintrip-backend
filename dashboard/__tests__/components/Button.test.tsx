/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Button } from '../../components/ui/button';

describe('Button Component', () => {
    it('renders with default variant', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('renders with destructive variant', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button', { name: /delete/i });
        expect(button).toHaveAttribute('data-variant', 'destructive');
    });

    it('renders with outline variant', () => {
        render(<Button variant="outline">Cancel</Button>);
        const button = screen.getByRole('button', { name: /cancel/i });
        expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('applies correct size', () => {
        render(<Button size="lg">Large Button</Button>);
        const button = screen.getByRole('button', { name: /large button/i });
        expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('is disabled when prop is set', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        const button = screen.getByRole('button', { name: /click/i });
        button.click();
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with ghost variant', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button', { name: /ghost/i });
        expect(button).toHaveAttribute('data-variant', 'ghost');
    });

    it('renders with secondary variant', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button', { name: /secondary/i });
        expect(button).toHaveAttribute('data-variant', 'secondary');
    });
});
