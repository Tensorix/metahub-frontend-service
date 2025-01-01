import User from "@/componments/user";
import { RegisterResult } from "@/gen/proto/v1/auth/register";
import { NavigateFunction } from "react-router";

export async function Register(user: User, username: string, password: string, navigate: NavigateFunction, setToast: React.Dispatch<React.SetStateAction<string>>) {
    // const user = new User(navigate, setToast, username, password)
    let result: RegisterResult
    try {
        user.username = username
        user.password = password
        result = await user.Register()
    }
    catch {
        setToast("network_error")
        return
    }
    switch (result) {
        case RegisterResult.UNSPECIFIED:
            setToast("unspecified_error")
            break
        case RegisterResult.SUCCESS:
            setToast("create_success")
            break
        case RegisterResult.EXISTS:
            setToast("user_exists")
            break
        case RegisterResult.VALUE_NULL:
            setToast("username_or_password_cannot_be_null")
            break
    }
}