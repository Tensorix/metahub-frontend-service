import { useNavigate } from "react-router"
import { useCookies } from 'react-cookie'
import { useEffect, useRef, useState } from "react"
import User from "@/componments/user"
import { LoToast } from "@/layout/toast"
import { Contactbar } from "@/layout/contactbar"
import { Inbox, InboxProps } from "@/layout/inbox"
import { Button } from "react-daisyui"
import { LoInput } from "@/layout/input"
import { MdSend } from "react-icons/md"
import { Message } from "@/layout/message"
import { FriendMessageResponse } from "@/gen/proto/v1/notify/friendmessage"

function showMessages(user: User, friendId: bigint,
    setMessages: React.Dispatch<React.SetStateAction<FriendMessageResponse[]>>) {
    user.accounts.forEach(account => {
        account.friends.forEach(friend => {
            if (friend.user_id == friendId) {
                setMessages(friend.messages)
                user.currentFriendId = friend.user_id
                user.currentTag = account.tag
            }
        })
    })
}

function HomePage() {
    const [cookies, _] = useCookies()
    const [toast, setToast] = useState("")
    const [buffer, setBuffer] = useState("")
    const [status, setStatus] = useState("error" as "success" | "warning" | "error")
    const [inbox, setInbox] = useState([] as InboxProps[])
    const [messages, setMessages] = useState([] as FriendMessageResponse[])
    const [count, setCount] = useState(0)
    const navigate = useNavigate()
    const user = useRef(new User(navigate, setToast, cookies))
    let timeoutid: NodeJS.Timeout
    useEffect(() => {
        user.current.AuthCheck()
        user.current.Heartbeat(setStatus)
        timeoutid = setInterval(async () => {
            await setFriendList()
        }, 1000)
        setFriendList()
        user.current.GetMessage(setInbox, setCount)
    }, [])

    async function setFriendList() {
        if (user.current.details == undefined || user.current.details.length != user.current.connected) {
            return
        }
        const result = await user.current.GetFriendList()
        if (!result) {
            return
        }
        setInbox(user.current.inbox)
        clearInterval(timeoutid)
    }
    return (
        <div className="flex h-screen">
            <div className="flex flex-col flex-initial w-1/5">
                <Contactbar inbox={count} status={status} />
                <div className="grow pt-5 pr-5 overflow-auto">
                    {inbox.map((prop, i) =>
                        <Inbox friend_id={prop.friend_id}
                            key={i} nickname={prop.nickname}
                            timestamp={prop.timestamp} messages={prop.messages}
                            tag={prop.tag} count={prop.count}
                            onClick={() => showMessages(user.current, prop.friend_id, setMessages)} />
                    )}
                </div>
            </div>
            <div className="grow flex flex-col">
                <div className="grow overflow-auto">
                    {messages.map((message, i) =>
                        <Message key={i} {...message} />
                    )}
                </div>
                <div className="w-full p-3 flex flex-row items-end">
                    <LoInput className="w-full grow" label="input_message" value={buffer} setValue={setBuffer} />
                    <Button color="primary" onClick={() => {setBuffer("");user.current.Send(buffer, setInbox, setMessages)}}>
                        <MdSend />
                    </Button>
                </div>
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    );
}

export default HomePage
