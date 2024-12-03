import { AuthServiceClient } from "@/gen/proto/v1/auth/auth.client"
import { CheckRequest, CheckResult } from "@/gen/proto/v1/auth/check"
import { LoginRequest, LoginResult } from "@/gen/proto/v1/auth/login"
import { RegisterRequest, RegisterResult } from "@/gen/proto/v1/auth/register"
import { FriendServiceClient } from "@/gen/proto/v1/friend/friend.client"
import { FriendListRequest, FriendListResponse } from "@/gen/proto/v1/friend/get"
import { Detail } from "@/gen/proto/v1/notify/heartbeat"
import { NotifyServiceClient } from "@/gen/proto/v1/notify/notify.client"
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport"
import { Dispatch, SetStateAction } from "react"
import { NavigateFunction } from "react-router"

interface Friend {
    tag: string
    user_id: bigint
    nickname: string
    remark: string
}

export default class User {
    public username: string
    public password: string | undefined
    public token: string | undefined
    public details?: Detail[]
    private baseUrl: string = "http://localhost:8080"
    public connected: number = 0
    public friends: Friend[] = []

    constructor(cookie: { [x: string]: string });
    constructor(username: string, password: string);
    constructor(userOrCookie: string | { [x: string]: string }, password?: string) {
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

    public AuthCheck(setToast: Dispatch<SetStateAction<string>>, navigate: NavigateFunction) {
        if (this.token == undefined) {
            navigate("/auth/login")
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        });
        const client = new AuthServiceClient(transport)
        const request: CheckRequest = { token: this.token }
        let response = client.check(request)
        response.status.catch((e) => {
            setToast("network_error")
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
                navigate("/auth/login")
            }
        })
    }
    public Heartbeat(setToast: Dispatch<SetStateAction<string>>,
        navigate: NavigateFunction,
        setStatus: Dispatch<SetStateAction<"error" | "success" | "warning">>) {
        if (this.token == undefined) {
            navigate("/auth/login")
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
            setToast("connection_timeout")
            setStatus("error")
        }, limit);
        streamcall.responses.onNext((message, error, complete) => {
            if (error != undefined || message == undefined || complete) {
                setToast("network_error")
                setStatus("error")
                return
            }
            switch (message.result) {
                case CheckResult.UNSPECIFIED:
                    setToast("unspecified_error")
                    setStatus("error")
                    return
                case CheckResult.SUCCESS:
                    break
                case CheckResult.FAILED:
                    navigate("/auth/login")
                    return
            }
            this.connected = 0
            const interval = message.interval
            clearTimeout(timeoutid)
            timeoutid = setTimeout(() => {
                this.connected = 0
                setToast("connection_timeout")
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
    public async GetFriendList(setToast: Dispatch<SetStateAction<string>>,
        navigate: NavigateFunction): Promise<boolean> {
        if (this.token == undefined) {
            navigate("/auth/login")
            return false
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new FriendServiceClient(transport)
        const request: FriendListRequest = { token: this.token }
        let response: FriendListResponse
        try{
            response = await client.getFriendList(request).response
        }
        catch(e){
            setToast("network_error")
            return false
        }
        const result = response.result
        switch (result) {
            case CheckResult.UNSPECIFIED:
                setToast("unspecified_error")
                return false
            case CheckResult.SUCCESS:
                break
            case CheckResult.FAILED:
                navigate("/auth/login")
                return false
        }
        const friendList = response.friendList
        this.friends = []
        friendList.forEach(friends => {
            friends.friends.forEach(friend => {
                this.friends.push({
                    tag: friends.accountTag,
                    user_id: friend.userId,
                    nickname: friend.nickname,
                    remark: friend.remark
                })
            })
        })
        return true
    }
}
