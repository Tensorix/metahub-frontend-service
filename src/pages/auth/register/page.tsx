import { useState } from "react"
import { FormattedMessage } from "react-intl"
import { LoInput } from "@/layout/input"
import { LoButton } from "@/layout/button"
import { LoToast } from "@/layout/toast"
import { Logo } from "@/layout/logo"
import { Register } from "./register"
import { useNavigate } from "react-router"
import { RouteArguments } from "@/layout/globalrouter"

export const RegisterPage: React.FC<RouteArguments> = ({ user }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [toast, setToast] = useState('')
    const navigate = useNavigate()
    return (
        <div className="w-full flex items-center justify-center h-screen">
            <div className="flex items-center flex-col space-y-2 w-1/5 p-10 shadow-lg">
                <Logo size="normal" variant="squircle"/>
                <div className="text-4xl"><FormattedMessage id="register" /></div>
                <LoInput className="w-full" label="username" value={username} setValue={setUsername} />
                <LoInput className="w-full" type="password" label="password" value={password} setValue={setPassword} />
                <LoButton color="primary" label="register" onClick={() => Register(user, username, password, navigate, setToast)} />
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}
