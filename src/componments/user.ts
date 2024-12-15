import { AccountServiceClient } from "@/gen/proto/v1/account/account.client"
import { AddAccountRequest, AddAccountResult } from "@/gen/proto/v1/account/add"
import { AccountData, QueryAccountRequest, QueryAccountResult } from "@/gen/proto/v1/account/query"
import { RemoveAccountRequest, RemoveAccountResult } from "@/gen/proto/v1/account/remove"
import { AuthServiceClient } from "@/gen/proto/v1/auth/auth.client"
import { CheckRequest, CheckResult } from "@/gen/proto/v1/auth/check"
import { LoginRequest, LoginResult } from "@/gen/proto/v1/auth/login"
import { RegisterRequest, RegisterResult } from "@/gen/proto/v1/auth/register"
import { FriendServiceClient } from "@/gen/proto/v1/friend/friend.client"
import { FriendListRequest, FriendListResponse } from "@/gen/proto/v1/friend/get"
import { MessageType } from "@/gen/proto/v1/friend/message"
import { SendRequest } from "@/gen/proto/v1/friend/send"
import { FriendMessageResponse } from "@/gen/proto/v1/notify/friendmessage"
import { Detail } from "@/gen/proto/v1/notify/heartbeat"
import { NotifyServiceClient } from "@/gen/proto/v1/notify/notify.client"
import { InboxProps } from "@/layout/inbox"
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport"
import moment from "moment"
import { Dispatch, SetStateAction } from "react"
import { NavigateFunction } from "react-router"


interface Friend {
    user_id: bigint
    nickname: string
    remark: string
    messages: FriendMessageResponse[]
}

interface Account {
    tag: string
    friends: Friend[]
}

export interface AccountProps {
    id: number
    account_tag: string
    ip: string
    port: number
    editable: boolean
}

export default class User {
    public username: string
    public password: string | undefined
    public token: string | undefined
    public details?: Detail[]
    private baseUrl: string = "http://localhost:8080"
    public connected: number = 0
    public inbox: InboxProps[] = []
    public accounts: Account[] = []
    public accountProps: AccountProps[] = []
    public navigate: NavigateFunction
    public setToast: Dispatch<SetStateAction<string>>
    public currentFriendId: bigint = 0n
    public currentTag: string = ""

    constructor(navigate: NavigateFunction, setToast: Dispatch<SetStateAction<string>>, cookie: { [x: string]: string });
    constructor(navigate: NavigateFunction, setToast: Dispatch<SetStateAction<string>>, username: string, password: string);
    constructor(navigate: NavigateFunction, setToast: Dispatch<SetStateAction<string>>, userOrCookie: string | { [x: string]: string }, password?: string) {
        this.navigate = navigate
        this.setToast = setToast
        if (typeof userOrCookie == 'string' && password != undefined) {
            const username: string = userOrCookie
            this.username = username
            this.password = password
            return
        }
        const cookie = userOrCookie as { [x: string]: string }
        const username = cookie["username"]
        const token = cookie["token"]
        if (username == undefined || token == undefined || token == "undefined") {
            this.username = ""
            this.token = undefined
            return
        }
        this.username = username
        this.token = token
    }

    public async Login(): Promise<LoginResult> {
        if (this.password == undefined) {
            return LoginResult.FAILED
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        });
        const client = new AuthServiceClient(transport)
        const request: LoginRequest = { username: this.username, password: this.password }
        const { response } = await client.login(request)
        const result = response.result
        if (result == LoginResult.SUCCESS) {
            this.password = ""
            this.token = response.token
        }
        return result
    }

    public async Register(): Promise<RegisterResult> {
        if (this.password == undefined) {
            return RegisterResult.VALUE_NULL
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        });
        const client = new AuthServiceClient(transport)
        const request: RegisterRequest = { username: this.username, password: this.password }
        const { response } = await client.register(request)
        return response.result
    }

    public AuthCheck() {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        });
        const client = new AuthServiceClient(transport)
        const request: CheckRequest = { token: this.token }
        let response = client.check(request)
        response.status.catch((e) => {
            this.setToast("network_error")
            return
        })
        response.then(({ response }) => {
            const result = response.result
            let redirect = true
            switch (result) {
                case CheckResult.UNSPECIFIED:
                    break
                case CheckResult.SUCCESS:
                    redirect = false
                    break
                case CheckResult.FAILED:
                    break
            }
            if (redirect) {
                this.navigate("/auth/login")
            }
        })
    }
    public Heartbeat(setStatus: Dispatch<SetStateAction<"error" | "success" | "warning">>) {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new NotifyServiceClient(transport)
        const request: CheckRequest = { token: this.token }
        const streamcall = client.heartbeat(request)
        const limit = 1000
        let timeoutid = setTimeout(() => {
            this.setToast("connection_timeout")
            setStatus("error")
        }, limit);
        streamcall.responses.onNext((message, error, complete) => {
            if (error != undefined || message == undefined || complete) {
                this.setToast("network_error")
                setStatus("error")
                return
            }
            switch (message.result) {
                case CheckResult.UNSPECIFIED:
                    this.setToast("unspecified_error")
                    setStatus("error")
                    return
                case CheckResult.SUCCESS:
                    break
                case CheckResult.FAILED:
                    this.navigate("/auth/login")
                    return
            }
            this.connected = 0
            const interval = message.interval
            clearTimeout(timeoutid)
            timeoutid = setTimeout(() => {
                this.connected = 0
                this.setToast("connection_timeout")
            }, interval + limit)
            const details = message.details
            details.forEach(detail => {
                if (detail.connected) ++this.connected
            });
            if (this.connected == 0) setStatus("error")
            else if (this.connected == details.length) setStatus("success")
            else setStatus("warning")
            this.details = details
        })
    }
    public async GetFriendList(): Promise<boolean> {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new FriendServiceClient(transport)
        const request: FriendListRequest = { token: this.token }
        let response: FriendListResponse
        try {
            response = await client.getFriendList(request).response
        }
        catch (e) {
            this.setToast("network_error")
            return false
        }
        const result = response.result
        switch (result) {
            case CheckResult.UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case CheckResult.SUCCESS:
                break
            case CheckResult.FAILED:
                this.navigate("/auth/login")
                return false
        }
        const friendList = response.friendList
        this.accounts = []
        friendList.forEach(friends => {
            let account: Account = {
                tag: friends.accountTag,
                friends: []
            }
            friends.friends.forEach(friend => {
                account.friends.push({
                    user_id: friend.userId,
                    nickname: friend.nickname,
                    remark: friend.remark,
                    messages: []
                })
                this.inbox.push({
                    friend_id: friend.userId,
                    nickname: friend.nickname,
                    tag: account.tag,
                    timestamp: 0,
                    count: 0,
                    messages: [],
                    selected: false
                })
            })
            this.accounts.push(account)
        })
        return true
    }

    public GetMessage(setInbox: Dispatch<SetStateAction<InboxProps[]>>, setCount: Dispatch<SetStateAction<number>>) {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new NotifyServiceClient(transport)
        const request: CheckRequest = { token: this.token }
        const streamcall = client.friendMessage(request)
        streamcall.responses.onNext((message, error, complete) => {
            if (error != undefined || message == undefined || complete) {
                this.setToast("network_error")
                return
            }
            let count = 0
            this.accounts.forEach(account => {
                account.friends.forEach(friend => {
                    if (friend.user_id == message.friendId) {
                        friend.messages.push(message)
                    }
                    friend.messages.forEach(message => {
                        if (!message.readMark) ++count
                    })
                })
            })
            setCount(count)
            for (let i = 0; i < this.inbox.length; i++) {
                const box = this.inbox[i];
                if (box.friend_id == message.friendId) {
                    this.inbox.splice(i, 1)
                    this.inbox.unshift(box)
                    box.messages = message.messages
                    box.timestamp = Number(message.timestamp)
                    ++box.count
                }
            }
            setInbox([...this.inbox])
        })
    }

    public async Send(text: string, setInbox: React.Dispatch<React.SetStateAction<InboxProps[]>>, setMessages: React.Dispatch<React.SetStateAction<FriendMessageResponse[]>>) {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new FriendServiceClient(transport)
        const check_request: CheckRequest = {
            token: this.token
        }
        const encoder = new TextEncoder()
        const messages = [{
            type: MessageType.TEXT,
            content: encoder.encode(text)
        }]
        const request: SendRequest = {
            token: check_request,
            accountTag: this.currentTag,
            friendId: this.currentFriendId,
            messages: messages
        }
        const response = client.send(request)

        response.status.catch((e) => {
            this.setToast("network_error")
            return
        })
        response.then(({ response }) => {
            const result = response.result
            switch (result) {
                case CheckResult.UNSPECIFIED:
                    break
                case CheckResult.SUCCESS:
                    break
                case CheckResult.FAILED:
                    break
            }
        })
        this.inbox.forEach(box => {
            if (box.friend_id == this.currentFriendId) {
                box.messages = messages
                box.timestamp = moment().unix()
            }
        });
        this.accounts.forEach(account => {
            account.friends.forEach(friend => {
                if (friend.user_id == this.currentFriendId) {
                    friend.messages.push({
                        result: CheckResult.SUCCESS,
                        friendId: this.currentFriendId,
                        selfMessage: true,
                        messageId: 0n,
                        timestamp: BigInt(moment().unix()),
                        readMark: true,
                        hide: false,
                        revoke: false,
                        messages: messages
                    })
                }
            })
        })
        response.then(({ response }) => {
            const result = response.result
            let redirect = true
            switch (result) {
                case CheckResult.UNSPECIFIED:
                    break
                case CheckResult.SUCCESS:
                    redirect = false
                    break
                case CheckResult.FAILED:
                    this.setToast("send_failed")
                    break
            }
            if (redirect) {
                this.navigate("/auth/login")
            }
        })
        setInbox([...this.inbox])
    }

    public async QueryAccounts(): Promise<boolean> {
        const props: AccountProps[] = []
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AccountServiceClient(transport)
        const check_request: CheckRequest = {
            token: this.token
        }
        const request: QueryAccountRequest = {
            token: check_request,
        }
        const { response } = await client.queryAccount(request)
        const result = response.result
        if (result == undefined) {
            this.setToast("unspecified_error")
            return false
        }
        switch (result.result) {
            case CheckResult.UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case CheckResult.SUCCESS:
                break
            case CheckResult.FAILED:
                this.navigate("/auth/login")
                return false
        }
        switch (response.queryResult) {
            case QueryAccountResult.UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case QueryAccountResult.SUCCESS:
                const query_result = response.data
                query_result.forEach(account => {
                    props.push({
                        id: account.id,
                        account_tag: account.accountTag,
                        ip: account.ip,
                        port: account.port,
                        editable: false
                    })
                })
                this.accountProps = props
                return true
            case QueryAccountResult.FAILED:
                this.setToast("query_failed")
                return false
        }
    }
    public async AddAccount(accountTag: string, ipAddress: string, port: number): Promise<boolean> {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AccountServiceClient(transport)
        const check_request: CheckRequest = {
            token: this.token
        }
        const add_data: AccountData = {
            id: 0,
            accountTag: accountTag,
            ip: ipAddress,
            port: port
        }
        const request: AddAccountRequest = {
            token: check_request,
            data: add_data
        }
        const { response } = await client.addAccount(request)
        const result = response.result
        if (result == undefined) {
            this.setToast("unspecified_error")
            return false
        }
        switch (result.result) {
            case CheckResult.UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case CheckResult.SUCCESS:
                break
            case CheckResult.FAILED:
                this.navigate("/auth/login")
                return false
        }
        switch (response.addResult) {
            case AddAccountResult.ADD_RESULT_UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case AddAccountResult.ADD_RESULT_SUCCESS:
                this.setToast("add_success")
                this.accountProps.push({
                    id: response.id,
                    account_tag: accountTag,
                    ip: ipAddress,
                    port: port,
                    editable: false
                })
                return true
            case AddAccountResult.ADD_RESULT_EXISTS:
                this.setToast("field_already_exists")
                return false
            case AddAccountResult.ADD_RESULT_FAILED:
                this.setToast("add_failed")
                return false
        }
    }
    public async RemoveAccount(id: number): Promise<boolean> {
        if (this.token == undefined) {
            this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AccountServiceClient(transport)
        const check_request: CheckRequest = {
            token: this.token
        }
        const request: RemoveAccountRequest = {
            token: check_request,
            id: id
        }
        const { response } = await client.removeAccount(request)
        const result = response.result
        if (result == undefined) {
            this.setToast("unspecified_error")
            return false
        }
        switch (result.result) {
            case CheckResult.UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case CheckResult.SUCCESS:
                this.setToast("remove_success")
                break
            case CheckResult.FAILED:
                this.navigate("/auth/login")
                return false
        }
        switch (response.removeResult) {
            case RemoveAccountResult.UNSPECIFIED:
                this.setToast("unspecified_error")
                return false
            case RemoveAccountResult.SUCCESS:
                this.setToast("remove_success")
                for (let i = 0; i < this.accountProps.length; i++) {
                    const prop = this.accountProps[i];
                    if (prop.id == id) {
                        this.accountProps.splice(i, 1)
                    }
                }
                return true
            case RemoveAccountResult.NOT_EXISTS:
                this.setToast("field_not_exists")
                return false
            case RemoveAccountResult.FAILED:
                this.setToast("remove_failed")
                return false
        }
    }
}
