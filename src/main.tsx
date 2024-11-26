import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Router, Routes } from 'react-router'
import HomePage from './pages/page'
import { CookiesProvider } from 'react-cookie'
import "./global.css"
import LoginPage from './pages/auth/login/page'
import { Localization } from './localization'
import { Menubar } from './layout/menubar'
import RegisterPage from './pages/auth/register/page'
import SettingsPage from './pages/settings/page'
import { LoIntl } from './layout/intl'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CookiesProvider defaultSetOptions={{ path: '/', sameSite: 'strict' }}>
            <LoIntl>
                <BrowserRouter>
                    <Routes>
                        <Route index element={<Menubar><HomePage /></Menubar>} />
                        <Route path='/auth/login' element={<Menubar><LoginPage /></Menubar>} />
                        <Route path='/auth/register' element={<Menubar><RegisterPage /></Menubar>} />
                        <Route path='/settings' element={<Menubar><SettingsPage /></Menubar>} />
                    </Routes>
                </BrowserRouter>
            </LoIntl>
        </CookiesProvider>
    </StrictMode>
)
