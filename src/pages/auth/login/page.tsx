import { useState } from "react"
import { Join } from "react-daisyui"
import { useCookies } from 'react-cookie'
import { useNavigate } from "react-router"
import { Logo } from "@/layout/logo"
import { LoLabel } from "@/layout/label"
import { LoInput } from "@/layout/input"
import { LoButton } from "@/layout/button"
import { LoToast } from "@/layout/toast"
import { Login } from "./login"

function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [_, setCookies] = useCookies()
    const [toast, setToast] = useState('')
    const navigate = useNavigate()
    return (
        <div className="w-full flex items-center justify-center h-screen">
            <div className="flex items-center flex-col space-y-2 w-1/6">
                <Logo size="normal" variant="squircle" />
                <LoLabel size="text-4xl" value="login" />
                <LoInput label="username" value={username} setValue={setUsername} />
                <LoInput type="password" label="password" value={password} setValue={setPassword} />
                <Join>
                    <LoButton className="join-item" color="primary" value="login" disabled={loading} onClick={() => {
                        Login(username, password, navigate, setCookies, setLoading, setToast)
                    }} />
                    <LoButton className="join-item" color="secondary" value="register" disabled={loading} onClick={() => {
                        navigate("/auth/register")
                    }} />
                </Join>
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}

export default LoginPage
