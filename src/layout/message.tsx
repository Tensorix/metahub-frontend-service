import { FriendMessageResponse, MessageType } from "@/gen/proto/v1/message/friend"
import moment from "moment"
import { ChatBubble, Mask } from "react-daisyui"

export const Message: React.FC<FriendMessageResponse> = ({ timestamp, messages, selfMessage, friendId, readMark }) => {
    readMark = true
    const chat_time = moment.unix(timestamp).fromNow()
    const msg_body: JSX.Element[] = []
    messages.forEach(message => {
        switch (message.type) {
            case MessageType.UNSPECIFIED:
            case MessageType.TEXT:
                const decoder = new TextDecoder('utf-8')
                msg_body.push(<>{decoder.decode(message.content)}</>)
                break
            case MessageType.IMAGE:
                const blob = new Blob([message.content])
                const url = URL.createObjectURL(blob)
                msg_body.push(<Mask className="max-w-48 max-h-96" src={url}/>)
                break
            case MessageType.FACE:
                msg_body.push(<>FACE</>)
                break
        }
        msg_body.push(<></>)
    })
    return (
        <ChatBubble end={selfMessage}>
            <ChatBubble.Header>{friendId.toString()} <ChatBubble.Time>{chat_time}</ChatBubble.Time></ChatBubble.Header>
            <ChatBubble.Message>
                {...msg_body}
            </ChatBubble.Message>
        </ChatBubble>
    )
}
