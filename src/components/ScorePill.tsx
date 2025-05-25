'use client';

type ScorePillProps = {
    score: number | null | undefined;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
};

export default function ScorePill({
    score, 
    size = 'xl',
    className="",
}: ScorePillProps) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
        xl: 'px-6 py-2.5 text-xl',
    };

    const getColorClass = (score: number) => {
        if (score >= 9.0) return 'bg-purple-500';
        if (score >= 7.0) return 'bg-green-600';
        if (score >= 6.0) return 'bg-yellow-500';
        return 'bg-red-600';
    };

    const isValidScore = typeof score === 'number' && !isNaN(score);
    const colorClass = isValidScore ? getColorClass(score) : 'bg-gray-500';

    return (
        <span
            className={`inline-block font-semibold text-white rounded-full shadow-md
                ${colorClass} ${sizeClasses[size]} ${className}`}
        >{isValidScore ? score.toFixed(1) : 'N/A'}</span>
    );
}