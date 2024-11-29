import moment from 'moment';
import React from 'react';
import { Badge, Button, Indicator } from 'react-daisyui';

export interface InboxProps {
    nickname: string
    timestamp: number
    message: string
    tag: string
    count: number
}

export const Inbox: React.FC<InboxProps> = ({ nickname, timestamp, message, tag, count }) => {
    return (
        <Indicator className="w-full">
            <Button className='h-auto' color="ghost" fullWidth>
                {count != 0 &&
                    <Badge color="secondary" className={Indicator.Item.className()}>
                        {count}
                    </Badge>
                }
                <div className="w-full max-w-xs justify-center">
                    <label className="label cursor-pointer">
                        <span className="label-text">{nickname}</span>
                        <span className="label-text-alt">{moment(timestamp).format("YYYY-MM-DD")}</span>
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">{message}</span>
                        <span className="label-text-alt">{tag}</span>
                    </label>
                </div>
            </Button>
        </Indicator>
    );
};


