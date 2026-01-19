import { cn } from '../../lib/utils';

describe('Utility Functions', () => {
    describe('cn - className merger', () => {
        it('merges class names', () => {
            const result = cn('class1', 'class2');
            expect(result).toContain('class1');
            expect(result).toContain('class2');
        });

        it('handles empty inputs', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('handles conditional classes', () => {
            const result = cn('base', true && 'active', false && 'hidden');
            expect(result).toContain('base');
            expect(result).toContain('active');
            expect(result).not.toContain('hidden');
        });

        it('handles arrays of classes', () => {
            const result = cn(['class1', 'class2']);
            expect(result).toContain('class1');
        });

        it('deduplicates tailwind classes', () => {
            const result = cn('text-red-500', 'text-blue-500');
            // twMerge should keep only the last conflicting class
            expect(result).toBe('text-blue-500');
        });
    });
});
