import { Button, Mask, Menu, Navbar } from "react-daisyui"
import { MdHome, MdLogout, MdSettings } from "react-icons/md"
import { useNavigate } from "react-router"
import { Logo } from "./logo"
import User from "@/componments/user"
import { useCookies } from "react-cookie"

interface NavBarProp {
    children: JSX.Element
}

export const NavBar: React.FC<NavBarProp> = ({ children }) => {
    const navigate = useNavigate()
    const [cookie, setCookie] = useCookies()
    const user = new User(cookie)
    const isLogin = user.username != ""

    return (
        <div className="flex flex-row h-screen">
            <Menu>
                <Menu.Item>
                    <Button className='text-xl' color="ghost" onClick={() => { navigate("/") }}>
                        <MdHome />
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button className='text-xl' color="ghost" onClick={() => { navigate("/settings") }}>
                        <MdSettings />
                    </Button>
                </Menu.Item>
            </Menu>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}