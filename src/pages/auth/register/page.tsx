import { useState } from "react"
import { FormattedMessage } from "react-intl"
import { LoInput } from "@/layout/input"
import { LoButton } from "@/layout/button"
import { LoToast } from "@/layout/toast"
import { Logo } from "@/layout/logo"
import { Register } from "./register"

function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [toast, setToast] = useState('')
    return (
        <div className="w-full flex items-center justify-center h-screen">
            <div className="flex items-center flex-col space-y-2 w-1/6">
                <Logo size="normal" variant="squircle"/>
                <div className="text-4xl"><FormattedMessage id="register" /></div>
                <LoInput label="username" value={username} setValue={setUsername} />
                <LoInput type="password" label="password" value={password} setValue={setPassword} />
                <LoButton color="primary" value="register" onClick={() => Register(username, password, setToast)} />
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}

export default RegisterPage
