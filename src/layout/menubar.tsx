import { Button, Menu } from "react-daisyui"
import { MdAccountBox, MdAccountTree, MdLogout, MdMessage, MdSettings } from "react-icons/md"
import { useLocation, useNavigate } from "react-router"
import store from "store2"

interface MenubarProp {
    children: JSX.Element
}

interface PathInfo {
    pathname: string
    icon: JSX.Element
    need_auth: boolean
}

export const Menubar: React.FC<MenubarProp> = ({ children }) => {
    const sel_color = store.get("color_selected") as "info" | "neutral"
    const navigate = useNavigate()
    const location = useLocation()
    const pathname = location.pathname
    const info: PathInfo[] = [
        {
            pathname: "/",
            icon: <MdMessage />,
            need_auth: true
        }, {
            pathname: "/friends",
            icon: <MdAccountBox />,
            need_auth: true
        }, {
            pathname: "/accounts",
            icon: <MdAccountTree />,
            need_auth: true
        }, {
            pathname: "/settings",
            icon: <MdSettings />,
            need_auth: false
        }, {
            pathname: "/auth/login",
            icon: <MdLogout />,
            need_auth: true
        }
    ]
    return (
        <div className="flex flex-row h-screen">
            <Menu>
                {info.map((element, i) => {
                    if (element.need_auth && (store.get("token") == undefined)) {
                        return <div key={i}></div>
                    }
                    return (
                        <Menu.Item key={i}>
                            <Button className='text-xl' color={element.pathname == pathname ? sel_color : "ghost"} onClick={() => {
                                navigate(element.pathname)
                            }}>
                                {element.icon}
                            </Button>
                        </Menu.Item>
                    )
                }
                )}
            </Menu>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}
