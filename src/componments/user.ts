import { AccountsServiceClient } from "@/gen/proto/v1/accounts/accounts.client"
import { AddAccountRequest, AddAccountResult } from "@/gen/proto/v1/accounts/add"
import { AccountData, QueryAccountRequest, QueryAccountResult } from "@/gen/proto/v1/accounts/query"
import { RemoveAccountRequest, RemoveAccountResult } from "@/gen/proto/v1/accounts/remove"
import { AuthServiceClient } from "@/gen/proto/v1/auth/auth.client"
import { CheckRequest, CheckResponse, CheckResult } from "@/gen/proto/v1/auth/check"
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
import store from "store2"
export enum UserStatus {
    ERROR = "error",
    WARNING = "warning",
    SUCCESS = "success"
}

interface Friend {
    friend_id: number
    uid: bigint
    nickname: string
    remark: string
    messages: FriendMessageResponse[]
}

export interface Account {
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
    public username: string = ""
    public password?: string
    public token: string | undefined
    public details?: Detail[]
    private baseUrl: string = "http://localhost:8080/"
    public connected: number = 0
    public inbox: InboxProps[] = []
    public accounts: Account[] = []
    public accountProps: AccountProps[] = []
    public setToast: Dispatch<SetStateAction<string>>
    public currentFriendId: number = 0
    public currentTag: string = ""
    public setStatus: Dispatch<SetStateAction<UserStatus>>
    public setOnline: Dispatch<SetStateAction<boolean | undefined>>

    constructor(setOnline: Dispatch<SetStateAction<boolean | undefined>> ,setStatus: Dispatch<SetStateAction<UserStatus>>,setToast: Dispatch<SetStateAction<string>>) {
        this.setOnline = setOnline
        this.setStatus = setStatus
        this.setToast = setToast
        const token = store.get("token")
        const username = store.get("username")
        if (username != undefined) this.username = username
        this.token = token
    }

    public async Login(): Promise<LoginResult> {
        if (this.password == undefined) {
            return LoginResult.FAILED
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AuthServiceClient(transport)
        const request: LoginRequest = { username: this.username, password: this.password }
        const { response } = await client.login(request)
        const result = response.result
        if (result == LoginResult.SUCCESS) {
            this.password = ""
            this.token = response.token
            this.setOnline(true)
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

    public async AuthCheck() {
        if (this.token == undefined) {
            this.setOnline(false)
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        });
        const client = new AuthServiceClient(transport)
        const request: CheckRequest = { token: this.token }
        let res: CheckResponse
        try {
            let { response } = await client.check(request)
            res = response
        }
        catch (e) {
            this.setOnline(false)
            return
        }
        const result = res.result
        switch (result) {
            case CheckResult.UNSPECIFIED:
                this.setOnline(false)
                return
            case CheckResult.SUCCESS:
                this.setOnline(true)
                return
            case CheckResult.FAILED:
                this.setOnline(false)
                return
        }
    }
    public Heartbeat() {
        if (this.token == undefined) {
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new NotifyServiceClient(transport)
        const request: CheckRequest = { token: this.token }
        const streamcall = client.heartbeat(request)
        const limit = 3000
        let timeoutid = setTimeout(() => {
            this.setToast("connection_timeout")
            this.setStatus(UserStatus.ERROR)
        }, limit)

        streamcall.responses.onNext((message, error, complete) => {
            if (error != undefined || message == undefined || complete) {
                this.setToast("network_error")
                this.setStatus(UserStatus.ERROR)
                return
            }
            switch (message.result) {
                case CheckResult.UNSPECIFIED:
                    this.setToast("unspecified_error")
                    this.setStatus(UserStatus.ERROR)
                    return
                case CheckResult.SUCCESS:
                    break
                case CheckResult.FAILED:
                    this.setOnline(false)
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
            if (this.connected == 0) this.setStatus(UserStatus.ERROR)
            else if (this.connected == details.length) this.setStatus(UserStatus.SUCCESS)
            else this.setStatus(UserStatus.WARNING)
            this.details = details
        })
    }
    public async GetFriendList(): Promise<boolean> {
        if (this.token == undefined) {
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
                this.setOnline(false)
                return false
        }
        const friendList = response.friendList
        const recordAccounts = this.accounts
        this.accounts = []
        friendList.forEach(friends => {
            let account: Account = {
                tag: friends.accountTag,
                friends: []
            }
            friends.friends.forEach(friend => {
                account.friends.push({
                    friend_id: friend.userId,
                    uid: friend.uid,
                    nickname: friend.nickname,
                    remark: friend.remark,
                    messages: []
                })
            })
            this.accounts.push(account)
        })
        if (recordAccounts.length == this.accounts.length) {
            this.accounts = recordAccounts
        }
        return true
    }

    public GetMessage(setInbox: Dispatch<SetStateAction<InboxProps[]>>,
        setCount: Dispatch<SetStateAction<number>>, setGenerate: Dispatch<SetStateAction<boolean>>) {
        if (this.token == undefined) {
            // this.navigate("/auth/login")
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
            let exist = false

            //add messages
            let count = 0
            this.accounts.forEach(account => {
                account.friends.forEach(friend => {
                    console.log("get_message friend_id:", friend.friend_id)
                    if (friend.friend_id == message.friendId) {
                        friend.messages.push(message)
                    }
                    friend.messages.forEach(message => {
                        if (!message.readMark) ++count
                    })
                })
            })
            setCount(count)

            // inbox exists
            for (let i = 0; i < this.inbox.length; i++) {
                const element = this.inbox[i];
                if (message.friendId == element.friend_id) {
                    this.inbox.splice(i, 1)
                    this.inbox.unshift(element)
                    ++element.count
                    element.messages = message.messages
                    element.timestamp = Number(message.timestamp)
                    if (element.selected) setGenerate(generate => !generate)
                    exist = true
                    break
                }
            }

            // inbox not exists
            if (!exist) {
                this.accounts.forEach(account => {
                    account.friends.forEach(friend => {
                        if (friend.friend_id == message.friendId) {
                            this.inbox.push({
                                friend_id: message.friendId,
                                nickname: friend.nickname,
                                remark: friend.remark,
                                timestamp: Number(message.timestamp),
                                messages: message.messages,
                                tag: account.tag,
                                count: 1,
                                selected: false,
                            })
                        }
                    })
                })
            }
            setInbox([...this.inbox])
        })
    }

    public async Send(text: string, setMessages: React.Dispatch<React.SetStateAction<FriendMessageResponse[]>>) {
        if (this.token == undefined) {
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
                    this.setOnline(false)
                    break
            }
        })
        for (let i = 0; i < this.inbox.length; i++) {
            const element = this.inbox[i];
            if (element.friend_id == this.currentFriendId) {
                element.messages = messages
                element.timestamp = moment().unix()
                this.inbox.splice(i, 1)
                this.inbox.unshift(element)
            }
        }
        this.accounts.forEach(account => {
            account.friends.forEach(friend => {
                if (friend.friend_id == this.currentFriendId) {
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
            // let redirect = true
            switch (result) {
                case CheckResult.UNSPECIFIED:
                    break
                case CheckResult.SUCCESS:
                    // redirect = false
                    break
                case CheckResult.FAILED:
                    this.setToast("send_failed")
                    break
            }
            // if (redirect) {
            //     this.navigate("/auth/login")
            // }
        })
    }

    public async QueryAccounts(): Promise<boolean> {
        const props: AccountProps[] = []
        if (this.token == undefined) {
            // this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AccountsServiceClient(transport)
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
                this.setOnline(false)
                // this.navigate("/auth/login")
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
            // this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AccountsServiceClient(transport)
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
                // this.navigate("/auth/login")
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
            // this.navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new AccountsServiceClient(transport)
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
                // this.navigate("/auth/login")
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
