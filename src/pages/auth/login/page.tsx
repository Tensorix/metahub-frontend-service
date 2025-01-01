import { useEffect, useState } from "react"
import { Join } from "react-daisyui"
import { useNavigate } from "react-router"
import { Logo } from "@/layout/logo"
import { LoLabel } from "@/layout/label"
import { LoInput } from "@/layout/input"
import { LoButton } from "@/layout/button"
import { LoToast } from "@/layout/toast"
import { Login } from "./login"
import store from "store2"
import { RouteArguments } from "@/layout/globalrouter"

export const LoginPage: React.FC<RouteArguments> = ({ user }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState('')
    const navigate = useNavigate()
    useEffect(() => {
        store.remove("token")
    }, [])

    function handleEnterPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key != "Enter" || username == "" || password == "") return
        Login(user, username, password, navigate, setLoading, setToast)
    }

    return (
        <div className="w-full flex items-center justify-center h-screen">
            <div className="flex items-center flex-col space-y-2 w-1/5 p-10 shadow-lg">
                <Logo size="normal" variant="squircle" />
                <LoLabel size="text-4xl" value="login" />
                <LoInput className="w-full" label="username" value={username} setValue={setUsername} onKeyDown={handleEnterPress} />
                <LoInput className="w-full" type="password" label="password" value={password} setValue={setPassword} onKeyDown={handleEnterPress} />
                <Join>
                    <LoButton className="join-item" color="primary" label="login" disabled={loading} onClick={() => {
                        Login(user, username, password, navigate, setLoading, setToast)
                    }} />
                    <LoButton className="join-item" color="secondary" label="register" disabled={loading} onClick={() => {
                        navigate("/auth/register")
                    }} />
                </Join>
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}
export default LoginPage
