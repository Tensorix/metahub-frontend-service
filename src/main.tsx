import { createRoot } from 'react-dom/client'
import "./global.css"
import { LoIntl } from './layout/intl'
import { ThemeProvider } from './layout/themeprovider'
import { GlobalRouter } from './layout/globalrouter'

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <>
        <ThemeProvider />
        <LoIntl>
            <GlobalRouter />
        </LoIntl>
    </>
    // </StrictMode>
)
