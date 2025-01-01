import { Dispatch, RefObject, SetStateAction, createRef, useEffect, useRef, useState } from "react"
import User from "@/componments/user"
import { Contactbar } from "@/layout/contactbar"
import { Inbox, InboxProps } from "@/layout/inbox"
import { Button } from "react-daisyui"
import { LoInput } from "@/layout/input"
import { MdRecordVoiceOver, MdSearch, MdSend } from "react-icons/md"
import { Message } from "@/layout/message"
import { FriendMessageResponse } from "@/gen/proto/v1/notify/friendmessage"
import OpenAI from "openai"
import { MessageType } from "@/gen/proto/v1/friend/message"
import { useAudioRecorder } from "react-audio-voice-recorder"
import axios from "axios"
import store from "store2"
import { RouteArguments } from "@/layout/globalrouter"
import { SearchInput } from "@/layout/searchinput"

function setInbox(inbox: InboxProps[], friendId: number) {
    for (let i = 0; i < inbox.length; i++) {
        const box = inbox[i]
        if (friendId == box.friend_id) {
            box.selected = true
            continue
        }
        box.selected = false
    }
}

function showMessages(user: User, inbox: InboxProps[], setMessages: Dispatch<SetStateAction<FriendMessageResponse[]>>) {
    let friend_id = 0
    console.log("inbox length:",inbox.length)
    for (let i = 0; i < inbox.length; i++) {
        const element = inbox[i]
        if (element.selected) {
            friend_id = element.friend_id
        }
    }
    console.log("friend id:",friend_id)
    if (friend_id == 0) return
    user.accounts.forEach(account => {
        account.friends.forEach(friend => {
            if (friend.friend_id == friend_id) {
                setMessages(friend.messages)
                user.currentFriendId = friend.friend_id
                user.currentTag = account.tag
            }
        })
    })
}

function auto_input(setBuffer: Dispatch<SetStateAction<string>>, text: string, inputRef: RefObject<HTMLInputElement>): void {
    setBuffer(text)
    if (inputRef.current != undefined) {
        inputRef.current.focus()
    }
}

export const HomePage: React.FC<RouteArguments> = ({ user, inbox, status, count }) => {
    if (inbox == undefined || status == undefined || count == undefined) return <>123</>
    const [buffer, setBuffer] = useState("")
    const [new_inbox, setNewInbox] = useState([] as InboxProps[])
    const [messages, setMessages] = useState([] as FriendMessageResponse[])
    const [generate, setGenerate] = useState(false)
    const [hint, setHint] = useState(["", "", "", "", "", ""])
    const openAIEndpoint = store.get("openai_endpoint")
    const sttEndpoint = store.get("stt_endpoint")
    const [search_str, useSearchStr] = useState("")
    const openAIKey = store.get("openai_key")
    const inputRef: RefObject<HTMLInputElement> = createRef()
    const controller = useAudioRecorder()

    useEffect(()=>{
        console.log("inbox:" ,inbox.length)
        showMessages(user, inbox, setMessages)
    },[])

    //Filter Inbox List
    useEffect(() => {
        if (search_str == "") {
            setNewInbox(user.inbox)
            return
        }
        const friends: number[] = []
        user.accounts.forEach(account => {
            account.friends.forEach(friend => {
                if (friend.nickname.includes(search_str) || friend.remark.includes(search_str)) {
                    friends.push(friend.friend_id)
                }
                else {
                    friend.messages.forEach(friend_message => {
                        friend_message.messages.forEach(message => {
                            if (message.type == MessageType.TEXT) {
                                const decoder = new TextDecoder()
                                const content = decoder.decode(message.content)
                                if (content.includes(search_str)) {
                                    friends.push(friend.friend_id)
                                }
                            }
                        })
                    })
                }
            })
        })
        const results = Array.from(new Set(friends))
        const new_inbox: InboxProps[] = []
        inbox.forEach(element => {
            results.forEach(friend_id => {
                if (element.friend_id == friend_id) {
                    new_inbox.push(element)
                }
            })
        })
        setNewInbox(new_inbox)
    }, [search_str, inbox])

    // AI Generator
    useEffect(() => {
        let msg = ""
        const decoder = new TextDecoder()
        messages.forEach(friend_message => {
            friend_message.messages.forEach(subMsg => {
                if (subMsg.type == MessageType.TEXT) {
                    let sender = "B:"
                    if (friend_message.selfMessage) sender = "A:"
                    msg += sender + decoder.decode(subMsg.content) + "\n"
                }
            })
        })
        if (msg == "" || openAIEndpoint == undefined || openAIEndpoint == "") return
        const client = new OpenAI({
            baseURL: openAIEndpoint + "/v1",
            apiKey: openAIKey == undefined ? "" : openAIKey,
            dangerouslyAllowBrowser: true
        })
        client.chat.completions.create({
            model: "qwen2.5:14b",
            messages: [
                {
                    role: "system",
                    content: [
                        {
                            type: "text",
                            text: "用户将提供一段对话记录，其中包含两个人物——A代表自己，B代表对方。" +
                                "你的任务是根据这些对话内容，情商比正常人高两倍，根据下面的对话记录生成一个自然且亲切的回复，语气要轻松随和，" +
                                "态度可以多样化，不要过于正式或生硬，符合朋友之间的对话风格，" +
                                "不要出现感叹号以及问号针对此任务生成6个候选回复，每个回复不超过8个字，表达的情感需要多样化，" +
                                "返回的内容需为json格式：输出样例：[\"回复1\", \"回复2\", \"回复3\"]"
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: msg
                        }
                    ]
                }
            ]
        }).then(response => {
            const content = response.choices[0].message.content
            if (content == undefined) return
            const ls = JSON.parse(content) as string[]
            setHint(ls)
        })
    }, [generate])

    //AI Record Generator
    useEffect(() => {
        if (controller.recordingBlob == undefined) {
            console.log("recordingBlob is undefined")
            return
        }
        if (sttEndpoint == undefined) {
            console.log("sttEndpoint is undefined")
        }
        const reader = new FileReader()
        reader.readAsDataURL(controller.recordingBlob)
        reader.onload = function (e) {
            if (e.target == undefined) return
            const result = e.target.result as string
            if (result == undefined) return
            axios.post(sttEndpoint + "/v1/speech", {
                "config": {
                    "encoding": "OGG_OPUS",      // 音频编码格式，例如 LINEAR16, FLAC 等
                    "sampleRateHertz": 44100,   // 采样率，例如 44100 Hz
                    "languageCode": "zh-CN"     // 目标语言代码，例如 en-US, zh-CN 等
                },
                "audio": {
                    "content": result.split(',')[1]
                }
            }).then((response) => {
                const result = response.data["results"][0]["alternatives"][0]
                const transcript = result["transcript"]
                setBuffer(transcript)
            })
        }
    }, [controller.recordingBlob])

    function sendMsg() {
        if (buffer == "") return
        user.Send(buffer, setMessages)
        setBuffer("")
    }

    function handleEnterPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key != "Enter") return
        sendMsg()
    }

    return (
        <div className="flex h-screen">
            <div className="flex flex-col flex-initial w-1/5">
                <Contactbar inbox={count} status={status} />
                <SearchInput value={search_str} setValue={useSearchStr}/>
                <div className="grow pt-5 pr-5 overflow-auto">
                    {inbox.map((prop, i) =>
                        <Inbox friend_id={prop.friend_id}
                            key={i} nickname={prop.nickname} remark={prop.remark}
                            timestamp={prop.timestamp} messages={prop.messages}
                            tag={prop.tag} count={prop.count}
                            selected={prop.selected}
                            onClick={() => {
                                prop.count = 0
                                setHint(["", "", "", "", "", ""])
                                setInbox(inbox, prop.friend_id)
                                showMessages(user, inbox, setMessages)
                                setGenerate(generate => generate = !generate)
                            }} />
                    )}
                </div>
            </div>
            <div className="grow flex flex-col">
                <div className="grow overflow-auto">
                    {messages.map((message, i) =>
                        <Message key={i} {...message} />
                    )}
                </div>
                <div>
                    {hint[0] != "" &&
                        <Button variant="outline" className="w-1/6" glass color="primary" onClick={() => auto_input(setBuffer, hint[0], inputRef)}>{hint[0]}</Button>
                    }
                    {hint[1] != "" &&
                        <Button variant="outline" className="w-1/6" glass color="secondary" onClick={() => auto_input(setBuffer, hint[1], inputRef)}>{hint[1]}</Button>
                    }
                    {hint[2] != "" &&
                        <Button variant="outline" className="w-1/6" glass color="accent" onClick={() => auto_input(setBuffer, hint[2], inputRef)}>{hint[2]}</Button>
                    }
                    {hint[3] != "" &&
                        <Button variant="outline" className="w-1/6" glass color="warning" onClick={() => auto_input(setBuffer, hint[3], inputRef)}>{hint[3]}</Button>
                    }
                    {hint[4] != "" &&
                        <Button variant="outline" className="w-1/6" glass color="info" onClick={() => auto_input(setBuffer, hint[4], inputRef)}>{hint[4]}</Button>
                    }
                    {hint[5] != "" &&
                        <Button variant="outline" className="w-1/6" glass color="success" onClick={() => auto_input(setBuffer, hint[5], inputRef)}>{hint[5]}</Button>
                    }
                </div>
                <div className="w-full p-3 flex flex-row items-end">
                    <LoInput innerRef={inputRef} className="w-full grow" label="input_message" value={buffer} setValue={setBuffer} onKeyDown={handleEnterPress} />
                    <Button shape="circle" color={controller.isRecording ? "warning" : "info"} onMouseDown={() => {
                        console.log("record start")
                        controller.startRecording()
                    }} onMouseUp={() => {
                        console.log("record stop")
                        controller.stopRecording()
                    }}>
                        <MdRecordVoiceOver />
                    </Button>
                    <Button shape="circle" color="primary" onClick={() => sendMsg()}>
                        <MdSend />
                    </Button>
                </div>
            </div>
        </div>
    )
}
