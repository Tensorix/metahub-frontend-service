
import React from 'react'
import { FormattedMessage } from 'react-intl'

interface LoLabelProp {
    size: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl'
    value: string
}

export const LoLabel: React.FC<LoLabelProp> = ({ size, value }) => {

    return (
        <div className={size}>
            <FormattedMessage id={value} />
        </div>
    );
};
