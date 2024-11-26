import { Button, Menu } from "react-daisyui"
import { MdHome, MdSettings } from "react-icons/md"
import { useNavigate } from "react-router"

interface MenubarProp {
    children: JSX.Element
}

export const Menubar: React.FC<MenubarProp> = ({ children }) => {
    const navigate = useNavigate()

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
            <div className="flex flex-col w-full">
                {children}
            </div>
        </div>
    )
}