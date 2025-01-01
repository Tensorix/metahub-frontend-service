import { Localization } from '@/localization';
import React from 'react'
import { IntlProvider } from 'react-intl'

interface LoInputProps {
    children: JSX.Element
}

export const LoIntl: React.FC<LoInputProps> = ({ children }) => {
    return (
        <IntlProvider messages={Localization.getLangData()} locale="en">
            {children}
        </IntlProvider>
    );
};
