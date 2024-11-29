import { useNavigate } from "react-router"
import { useCookies } from 'react-cookie'
import { useEffect, useState } from "react"
import User from "@/componments/user"
import { LoToast } from "@/layout/toast"

function HomePage() {
    const [cookies, _] = useCookies()
    const [toast, setToast] = useState("")
    const user = new User(cookies)
    const navigate = useNavigate()
    useEffect(()=>{
        user.AuthCheck(setToast, navigate)
        user.Heartbeat(setToast, navigate)
    }, [])

    return (
        <div>
            <h1>Hello {user.username}!</h1>
            <LoToast value={toast} setValue={setToast} />
        </div>
    );

}

export default HomePage
