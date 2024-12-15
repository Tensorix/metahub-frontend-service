import { Button, Menu } from "react-daisyui"
import { MdAccountBox, MdHome, MdSettings } from "react-icons/md"
import { useLocation, useNavigate } from "react-router"

interface MenubarProp {
    children: JSX.Element
}

interface PathInfo {
    pathname: string
    icon: JSX.Element
}

export const Menubar: React.FC<MenubarProp> = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const pathname = location.pathname
    const info: PathInfo[] = [
        {
            pathname: "/",
            icon: <MdHome />
        }, {
            pathname: "/accounts",
            icon: <MdAccountBox />
        }, {
            pathname: "/settings",
            icon: <MdSettings />
        }
    ]
    return (
        <div className="flex flex-row h-screen">
            <Menu>
                {info.map((element, i) =>
                    <Menu.Item key={i}>
                        <Button className='text-xl' color={element.pathname == pathname ? "neutral" : "ghost"} onClick={() => { navigate(element.pathname) }}>
                            {element.icon}
                        </Button>
                    </Menu.Item>
                )}
            </Menu>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}
