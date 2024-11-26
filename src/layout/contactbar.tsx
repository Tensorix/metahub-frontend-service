import React from 'react'
import { Badge, Button, Menu } from 'react-daisyui'
import { MdInbox, MdInfo } from 'react-icons/md'
import { FormattedMessage } from 'react-intl'

interface ContactbarProp {
    inbox: number
    isLogin: boolean
}

export const Contactbar: React.FC<ContactbarProp> = ({ inbox, isLogin }) => {
    return (
        <Menu className="flex flex-row justify-center">
            <Menu.Item>
                <Button color="ghost">
                    <MdInbox /><FormattedMessage id='inbox'/>: <Badge>{inbox>99?"99+":inbox}</Badge>
                </Button>
            </Menu.Item>
            <Menu.Item>
                <Button color="ghost">
                    <MdInfo /> <FormattedMessage id='status'/>: <Badge size="xs" color={isLogin?"success":"error"} />
                </Button>
            </Menu.Item>
        </Menu>
    );
};
