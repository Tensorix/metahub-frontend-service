import { useNavigate } from "react-router"
import { useCookies } from 'react-cookie'
import { useEffect } from "react"
import User from "@/componments/user"

function HomePage() {
    const [cookies, _] = useCookies()
    const user = new User(cookies)
    const navigate = useNavigate()
    if(user.username == undefined || user.token == undefined){
        useEffect(()=>{navigate("/auth/login")})
        return (<></>)
    }
    return (
        <div>
            {cookies.username && <h1>Hello {cookies.username}!</h1>}
        </div>
    );

}

export default HomePage
