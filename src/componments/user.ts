import { AuthServiceClient } from "@/gen/proto/v1/auth/auth.client"
import { CheckRequest, CheckResult } from "@/gen/proto/v1/auth/check"
import { LoginRequest, LoginResult } from "@/gen/proto/v1/auth/login"
import { RegisterRequest, RegisterResult } from "@/gen/proto/v1/auth/register"
import { Detail, HeartbeatRequest } from "@/gen/proto/v1/notify/heartbeat"
import { NotifyServiceClient } from "@/gen/proto/v1/notify/notify.client"
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport"
import { Dispatch, SetStateAction } from "react"
import { NavigateFunction } from "react-router"

export default class User {
    public username: string
    public password: string | undefined
    public token: string | undefined
    public detail?: Detail[]
    private baseUrl: string = "http://localhost:8080"
    public connected: boolean = false

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
    public Heartbeat(setToast: Dispatch<SetStateAction<string>>, navigate: NavigateFunction) {
        if (this.token == undefined) {
            navigate("/auth/login")
            return
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        })
        const client = new NotifyServiceClient(transport)
        const request: HeartbeatRequest = { token: this.token }
        const streamcall = client.heartbeat(request)
        const limit = 1000
        let timeoutid = setTimeout(() => {
            setToast("connection_timeout")
        }, limit);
        streamcall.responses.onNext((message, error, complete) => {
            if (error != undefined || message == undefined || complete) {
                setToast("network_error")
                return
            }
            switch (message.result) {
                case CheckResult.UNSPECIFIED:
                    setToast("unspecified_error")
                    return
                case CheckResult.SUCCESS:
                    break
                case CheckResult.FAILED:
                    navigate("/auth/login")
                    return
            }
            this.connected = true
            const interval = message.interval
            clearTimeout(timeoutid)
            timeoutid = setTimeout(() => {
                this.connected = false
                setToast("connection_timeout")
            }, interval + limit)
            this.detail = message.detail
        })
    }
}
