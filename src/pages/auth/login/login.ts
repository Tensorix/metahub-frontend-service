import User from "@/componments/user";
import { LoginResult } from "@/gen/proto/v1/auth/login";

export async function Login(username: string, password: string, navigate: any,
    setCookies: (name: string, value: string) => void,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setToast: React.Dispatch<React.SetStateAction<string>>) {
    setLoading(true)
    const user = new User(username, password)
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
            setCookies("username", username)
            setCookies("token", token)
            navigate("/")
            break
        case LoginResult.FAILED:
            setToast("login_failed")
            setLoading(false)
            break
    }
}
