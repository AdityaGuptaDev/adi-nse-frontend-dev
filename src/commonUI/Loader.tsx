// components/Loader.tsx
import React from 'react';
import clsx from 'clsx';

interface LoaderProps {
    color?: string;
    size?: string;
    thickness?: string;
    borderColor: string;
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({
    color = 'text-white',
    size = 'w-5 h-5',
    thickness = 'border-2',
    borderColor = 'border-indigo-300',
    className = '',
}) => {
    return (
        <div
            className={clsx(
                'rounded-full animate-spin',
                thickness,
                size,
                color,
                borderColor,
                'border-t-current',
                className
            )}

        />
    );
};

export default Loader;
