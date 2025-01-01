import User from "@/componments/user";
import { LoginResult } from "@/gen/proto/v1/auth/login";
import store from "store2";

export async function Login(user: User,username: string, password: string, navigate: any,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setToast: React.Dispatch<React.SetStateAction<string>>) {
    setLoading(true)
    user.username = username
    user.password = password
    let result: LoginResult
    try {
        result = await user.Login()
    }
    catch {
        setToast("network_error")
        setLoading(false)
        return
    }
    switch (result) {
        case LoginResult.UNSPECIFIED:
            setToast("unspecified_error")
            setLoading(false)
            break
        case LoginResult.SUCCESS:
            const token = user.token
            if (token == undefined) {
                setToast("unspecified_error")
                setLoading(false)
                break
            }
            store.set("username", username)
            store.set("token", token)
            navigate("/")
            break
        case LoginResult.FAILED:
            setToast("login_failed")
            setLoading(false)
            break
    }
}
