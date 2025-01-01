import { AccountProps } from "@/componments/user"
import { LoLabel } from "@/layout/label"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { Button, Input, Table } from "react-daisyui"
import { MdAdd, MdEdit, MdRemove } from "react-icons/md"
import User from "@/componments/user"
import { LoToast } from "@/layout/toast"
import { useNavigate } from "react-router"
import { RouteArguments } from "@/layout/globalrouter"

function query(user: User, _setAccounts: Dispatch<SetStateAction<AccountProps[]>>) {
    user.QueryAccounts().then(result => {
        if (!result) return
        _setAccounts([...user.accountProps])
    })
}

function add(user: User, addAccountTag: string, addIPAddress: string, addPort: string, _setAccounts: Dispatch<SetStateAction<AccountProps[]>>) {
    const port = parseInt(addPort)
    if(isNaN(port)){
        user.setToast("port_is_not_number")
        return
    }
    user.AddAccount(addAccountTag, addIPAddress, port).then(result=>{
        if(!result) return
        _setAccounts([...user.accountProps])
    })
}

function remove(user: User, id: number, _setAccounts: Dispatch<SetStateAction<AccountProps[]>>) {
    user.RemoveAccount(id).then(result => {
        if(!result) return
        _setAccounts([...user.accountProps])
    })
}

export const AccountsPage: React.FC<RouteArguments> = ({ user }) => {
    const [addAccountTag, setAddAccountTag] = useState("")
    const [addIPAddress, setAddIPAddress] = useState("")
    const [addPort, setAddPort] = useState("")
    const [accounts, setAccounts] = useState([] as AccountProps[])
    const [toast, setToast] = useState("")
    useEffect(() => {
        query(user, setAccounts)
    }, [])

    return (
        <div className="w-full flex items-start justify-center h-screen">
            <Table className="w-5/6 text-center">
                <Table.Head>
                    <LoLabel size="text-lg" value="account_tag" />
                    <LoLabel size="text-lg" value="ip" />
                    <LoLabel size="text-lg" value="port" />
                    <LoLabel size="text-lg" value="action" />
                </Table.Head>
                <Table.Body>
                    {accounts.map((account, i) => {
                        return  <Table.Row key={i}>
                            <span>{account.account_tag}</span>
                            <span>{account.ip}</span>
                            <span>{account.port}</span>
                            <span>
                                {/* <Button size="xs">
                                    <MdEdit onClick={()=>{
                                        
                                    }}/>
                                </Button> */}
                                <Button size="xs" onClick={()=>{remove(user, account.id, setAccounts)}}>
                                    <MdRemove />
                                </Button>
                            </span>
                        </Table.Row>
                    }
                    )}
                    <Table.Row>
                        <span>
                            <Input value={addAccountTag} onChange={e => { setAddAccountTag(e.target.value) }} />
                        </span>
                        <span>
                            <Input value={addIPAddress} onChange={e => { setAddIPAddress(e.target.value) }} />
                        </span>
                        <span>
                            <Input value={addPort} onChange={e => { setAddPort(e.target.value) }} />
                        </span>
                        <span>
                            <Button size="xs">
                                <MdAdd onClick={() => { add(user, addAccountTag, addIPAddress, addPort, setAccounts) }} />
                            </Button>
                        </span>
                    </Table.Row>
                </Table.Body>
            </Table>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}
export default AccountsPage
