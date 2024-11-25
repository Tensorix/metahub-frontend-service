import { Localization } from '@/localization';
import React from 'react'
import { useCookies } from 'react-cookie';
import { IntlProvider } from 'react-intl'

interface LoInputProps {
    children: JSX.Element
}

export const LoIntl: React.FC<LoInputProps> = ({ children }) => {
    const [cookie, _] = useCookies()
    return (
        <IntlProvider messages={Localization.getLangData(cookie)} locale="en">
            {children}
        </IntlProvider>
    );
};
