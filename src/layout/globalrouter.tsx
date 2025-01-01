import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import { Menubar } from "./menubar";
import LoginPage from "@/pages/auth/login/page";
import SettingsPage from "@/pages/settings/page";
import AccountsPage from "@/pages/accounts/page";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import User, { Account, UserStatus } from "@/componments/user";
import { LoToast } from "./toast";
import { InboxProps } from "./inbox";
import { FriendsPage } from "@/pages/friends/page";
import { RegisterPage } from "@/pages/auth/register/page";
import { HomePage } from "@/pages/page";

interface RouteConfig {
    path: string
    page: React.JSX.Element
}

export interface RouteArguments {
    user: User
    inbox?: InboxProps[]
    status?: UserStatus
    count?: number
    generate?: boolean
    accounts?: Account[]
    setInbox?: Dispatch<SetStateAction<InboxProps[]>>
}

interface AuthCheckArguments {
    user: User
    online?: boolean
}

const AuthCheck: React.FC<AuthCheckArguments> = ({ user, online }) => {
    const navigate = useNavigate()
    useEffect(() => {
        console.log("user online changed:", online)
        if (online == undefined) return
        if (!online) navigate('/auth/login')
    }, [online])
    return <></>
}

export function GlobalRouter() {
    const [online, setOnline] = useState(undefined as boolean | undefined)
    const [toast, setToast] = useState("")
    const [inbox, setInbox] = useState([] as InboxProps[])
    const [accounts, setAccounts] = useState([] as Account[])
    const [count, setCount] = useState(0)
    const [status, setStatus] = useState(UserStatus.ERROR)
    const [generate, setGenerate] = useState(false)
    const user = useRef(new User(setOnline, setStatus, setToast))
    useEffect(() => {
        user.current.AuthCheck()
    }, [])
    useEffect(() => {
        if (!online) return
        user.current.Heartbeat()
        user.current.GetFriendList().then((result) => {
            if (result) {
                setAccounts([...user.current.accounts])
            }
            else {
                setToast("get_friend_list_failed")
            }
        })
        user.current.GetMessage(setInbox, setCount, setGenerate)
    }, [online])
    const configs: RouteConfig[] = [
        {
            path: '/',
            page: <HomePage user={user.current} inbox={inbox} status={status} count={count} generate={generate} />
        },
        {
            path: '/auth/login',
            page: <LoginPage user={user.current} />
        },
        {
            path: '/auth/register',
            page: <RegisterPage user={user.current} />
        },
        {
            path: '/settings',
            page: <SettingsPage />
        },
        {
            path: '/accounts',
            page: <AccountsPage user={user.current} />
        },
        {
            path: '/friends',
            page: <FriendsPage user={user.current} accounts={accounts} setInbox={setInbox} />
        }
    ]
    return (
        <BrowserRouter>
            <Routes>
                {configs.map((config, i) =>
                    <Route key={i} path={config.path} element={
                        <Menubar>
                            <>
                                {config.page}
                                <AuthCheck user={user.current} online={online} />
                                <LoToast value={toast} setValue={setToast} />
                            </>
                        </Menubar>
                    } />
                )}
            </Routes>
        </BrowserRouter>
        )
}