import { AuthServiceClient } from "@/gen/proto/v1/auth/auth.client"
import { LoginRequest, LoginResult } from "@/gen/proto/v1/auth/login"
import { RegisterRequest, RegisterResult } from "@/gen/proto/v1/auth/register"
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport"
import { NavigateFunction } from "react-router"

export default class User {
    public username: string
    public password: string | undefined
    public token: string | undefined
    public baseUrl: string = "http://localhost:8080"
    constructor(cookie:{[x: string]: string});
    constructor(username: string,password: string);
    constructor(userOrToken: string | {[x: string]: string}, password?: string){
        if (typeof userOrToken == 'string' && password != undefined) {
            const username: string = userOrToken
            this.username = username
            this.password = password
            return
        }
        const cookie = userOrToken as {[x: string]: string}
        const username = cookie["username"]
        const token  = cookie["token"]
        if(username == undefined || username == "undefined" || token == undefined || token == "undefined"){
            this.username = ""
            return
        }
        this.username = username
        this.token = token
    }

    public async Login(): Promise<LoginResult>{
        if(this.password == undefined){
            return LoginResult.FAILED
        }
        const transport = new GrpcWebFetchTransport({
            baseUrl: this.baseUrl
        });
        const client = new AuthServiceClient(transport)
        const request: LoginRequest = { username: this.username, password: this.password }
        const { response } = await client.login(request)
        const result = response.result
        if(result == LoginResult.SUCCESS){
            this.password = ""
            this.token = response.token
        }
        return result
    }
    public async Register(): Promise<RegisterResult>{
        if(this.password == undefined){
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
}
