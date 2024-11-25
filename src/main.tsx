import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Router, Routes } from 'react-router'
import HomePage from './pages/page'
import { CookiesProvider } from 'react-cookie'
import "./global.css"
import LoginPage from './pages/auth/login/page'
import { Localization } from './localization'
import { NavBar } from './layout/nav'
import RegisterPage from './pages/auth/register/page'
import SettingsPage from './pages/settings/page'
import { LoIntl } from './layout/intl'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CookiesProvider defaultSetOptions={{ path: '/', sameSite: 'strict' }}>
            <LoIntl>
                <BrowserRouter>
                    <Routes>
                        <Route index element={<NavBar><HomePage /></NavBar>} />
                        <Route path='/auth/login' element={<NavBar><LoginPage /></NavBar>} />
                        <Route path='/auth/register' element={<NavBar><RegisterPage /></NavBar>} />
                        <Route path='/settings' element={<NavBar><SettingsPage /></NavBar>} />
                    </Routes>
                </BrowserRouter>
            </LoIntl>
        </CookiesProvider>
    </StrictMode>
)
