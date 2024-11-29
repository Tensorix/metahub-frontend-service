import moment from "moment"
import { ChatBubble, Mask } from "react-daisyui"

export interface SubMessage {
    type: "text" | "image"
    text?: string
    img_url?: string
}

interface MessageProp {
    sender?: string
    me_msg?: true
    timestamp: number
    msg_id: number
    sub_msg: SubMessage[]
}

export const Message: React.FC<MessageProp> = ({ sender, me_msg, timestamp, sub_msg: messages }) => {
    const chat_time = moment.unix(timestamp).fromNow()
    const msg_body: JSX.Element[] = []
    messages.forEach(message => {
        switch (message.type) {
            case "text":
                msg_body.push(<>{message.text}</>)
            case "image":
                msg_body.push(<Mask className="max-w-48 max-h-96" src={message.img_url}/>)
        }
        msg_body.push(<></>)
    });
    return (

        <ChatBubble end={me_msg}>
            <ChatBubble.Header>{sender} <ChatBubble.Time>{chat_time}</ChatBubble.Time></ChatBubble.Header>
            <ChatBubble.Message>
                {...msg_body}
            </ChatBubble.Message>
        </ChatBubble>
    )
}
