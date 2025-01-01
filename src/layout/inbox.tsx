import { Message, MessageType } from '@/gen/proto/v1/friend/message';
import moment from 'moment';
import React from 'react';
import { Badge, Button, Indicator } from 'react-daisyui';
import store from 'store2';

export interface InboxProps {
    friend_id: number
    nickname: string
    remark: string
    timestamp: number
    messages: Message[]
    tag: string
    count: number
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    selected: boolean
}

export const Inbox: React.FC<InboxProps> = ({ nickname, remark, timestamp, messages, tag, count, onClick, selected }) => {
    const sel_color = store.get("color_selected") as "info" | "neutral"
    let name = remark
    if(remark == "") name = nickname
    let rawmsg = ""
    messages.forEach(message => {
        switch (message.type) {
            case MessageType.UNSPECIFIED:
            case MessageType.TEXT:
                const decoder = new TextDecoder('utf-8')
                rawmsg += decoder.decode(message.content)
                break
            case MessageType.IMAGE:
                rawmsg += "[图片]"
                break
        }
    })
    return (
        <Indicator className="w-full">
            <Button className='h-auto' color={selected ? sel_color : "ghost"} fullWidth onClick={onClick}>
                {count != 0 &&
                    <Badge color="secondary" className={Indicator.Item.className()}>
                        {count}
                    </Badge>
                }
                <div className="w-full max-w-xs justify-center">
                    <label className="label cursor-pointer">
                        <span className="label-text">{name}</span>
                        <span className="label-text-alt">{timestamp != 0 && moment.unix(Number(timestamp)).fromNow()}</span>
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text truncate w-2/3 text-left">{rawmsg}</span>
                        <span className="label-text-alt">{tag}</span>
                    </label>
                </div>
            </Button>
        </Indicator>
    );
};


