import { LoButton } from "@/layout/button";
import { RouteArguments } from "@/layout/globalrouter";
import { LoLabel } from "@/layout/label";
import { SearchInput } from "@/layout/searchinput";
import { useState } from "react";
import { Accordion, Button } from "react-daisyui";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";

interface InfoFieldProp {
    label: string
    content: string
}

const InfoField: React.FC<InfoFieldProp> = ({ label, content }) => {
    return (
        <div className="flex flex-row w-full text-center py-2">
            <div className="w-1/2">
                <FormattedMessage id={label} />
            </div>
            <div className="w-1/2">
                {content}
            </div>
        </div>
    )
}

export const FriendsPage: React.FC<RouteArguments> = ({ user, accounts, setInbox }) => {
    if (accounts == undefined || setInbox == undefined) return <></>
    const navigate = useNavigate()
    // const color_selected = store.get("color_selected")
    const [search_str, useSearchStr] = useState("")
    const [friend_id, setFriendID] = useState(0)
    const [friend_uid, setFriendUID] = useState(0n)
    const [nickname, setNickname] = useState("")
    const [remark, setRemark] = useState("")
    const [tag, setTag] = useState("")
    return (
        <div className="flex h-screen">
            <div className="flex flex-col flex-initial w-1/5 overflow-auto">
                <div className="pt-5" />
                <SearchInput value={search_str} setValue={useSearchStr} />
                <div className="pb-5" />
                {accounts.map((account, i) =>
                    <Accordion key={i} icon="arrow">
                        <Accordion.Title>
                            {account.tag}
                        </Accordion.Title>
                        <Accordion.Content>
                            {account.friends.map((friend, i) => {
                                const showname = friend.remark == "" ? friend.nickname : friend.remark
                                if (!showname.includes(search_str)) return (<></>)
                                return (
                                    <Button color="ghost" key={i} className="w-full" onClick={() => {
                                        setFriendID(friend.friend_id)
                                        setFriendUID(friend.uid)
                                        setNickname(friend.nickname)
                                        setRemark(friend.remark)
                                        setTag(account.tag)
                                    }}>

                                        {showname}
                                    </Button>
                                )
                            })}
                        </Accordion.Content>
                    </Accordion>
                )}
            </div>
            <div className="w-4/5">
                <div className="w-full flex items-center justify-center h-screen">
                    {friend_id != 0 && <div className="flex items-center flex-col space-y-2 w-2/5 h-3/5 p-10 shadow-lg">
                        <div className="py-5">
                            <LoLabel size="text-2xl" value="friend_info" />
                        </div>
                        <InfoField label="friend_id" content={friend_id.toString()} />
                        <InfoField label="friend_uid" content={friend_uid.toString()} />
                        <InfoField label="nickname" content={nickname} />
                        <InfoField label="remark" content={remark} />
                        <InfoField label="account_tag" content={tag} />
                        <div className="grow" />
                        <LoButton className="w-full" color="primary" label="send_message" onClick={() => {
                            let exists = false
                            for (let i = 0; i < user.inbox.length; i++) {
                                const element = user.inbox[i];
                                if (element.friend_id == friend_id) {
                                    element.selected = true
                                    exists = true
                                    continue
                                }
                                element.selected = false
                            }
                            if (!exists) {
                                for (let i = 0; i < user.accounts.length; i++) {
                                    const account = user.accounts[i];
                                    for (let j = 0; j < account.friends.length; j++) {
                                        const friend = account.friends[j];
                                        if (friend.friend_id == friend_id) {
                                            console.log("add friend id:",friend_id)
                                            user.inbox.unshift({
                                                friend_id: friend.friend_id,
                                                nickname: friend.nickname,
                                                remark: friend.remark,
                                                timestamp: 0,
                                                messages: [],
                                                tag: account.tag,
                                                count: 0,
                                                selected: true
                                            })
                                            setInbox(user.inbox)
                                            break
                                        }
                                    }
                                }
                            }
                            navigate('/')
                        }} />
                    </div>}
                </div>
            </div>
        </div>
    )
}