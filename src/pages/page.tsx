import { useNavigate } from "react-router"
import { useCookies } from 'react-cookie'
import { useEffect } from "react"
import User from "@/componments/user"

function HomePage() {
    const [cookies, _] = useCookies()
    const user = new User(cookies)
    const navigate = useNavigate()
    useEffect(()=>{
        user.AuthCheck(navigate)
    })

    return (
        <div>
            <h1>Hello {user.username}!</h1>
        </div>
    );

}

export default HomePage
