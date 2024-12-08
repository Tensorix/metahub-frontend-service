import { Message, MessageType } from '@/gen/proto/v1/message/friend';
import moment from 'moment';
import React from 'react';
import { Badge, Button, Indicator } from 'react-daisyui';

export interface InboxProps {
    friend_id: bigint
    nickname: string
    timestamp: number
    messages: Message[]
    tag: string
    count: number
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const Inbox: React.FC<InboxProps> = ({ nickname, timestamp, messages, tag, count, onClick }) => {
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
    });
    return (
        <Indicator className="w-full">
            <Button className='h-auto' color="ghost" fullWidth onClick={onClick}>
                {count != 0 &&
                    <Badge color="secondary" className={Indicator.Item.className()}>
                        {count}
                    </Badge>
                }
                <div className="w-full max-w-xs justify-center">
                    <label className="label cursor-pointer">
                        <span className="label-text">{nickname}</span>
                        <span className="label-text-alt">{timestamp != 0 && moment(timestamp * 1000).format("YYYY-MM-DD")}</span>
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">{rawmsg}</span>
                        <span className="label-text-alt">{tag}</span>
                    </label>
                </div>
            </Button>
        </Indicator>
    );
};


