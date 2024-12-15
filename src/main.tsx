import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './pages/page'
import { CookiesProvider } from 'react-cookie'
import "./global.css"
import LoginPage from './pages/auth/login/page'
import { Menubar } from './layout/menubar'
import RegisterPage from './pages/auth/register/page'
import SettingsPage from './pages/settings/page'
import { LoIntl } from './layout/intl'
import { ThemeProvider } from './layout/themeprovider'
import AccountsPage from './pages/accounts/page'

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <CookiesProvider defaultSetOptions={{ path: '/', sameSite: 'strict' }}>
        <ThemeProvider />
        <LoIntl>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Menubar><HomePage /></Menubar>} />
                    <Route path='/auth/login' element={<Menubar><LoginPage /></Menubar>} />
                    <Route path='/auth/register' element={<Menubar><RegisterPage /></Menubar>} />
                    <Route path='/settings' element={<Menubar><SettingsPage /></Menubar>} />
                    <Route path='/accounts' element={<Menubar><AccountsPage /></Menubar>} />
                </Routes>
            </BrowserRouter>
        </LoIntl>
    </CookiesProvider>
    // </StrictMode>
)
