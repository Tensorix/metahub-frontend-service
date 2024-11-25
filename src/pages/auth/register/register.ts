import User from "@/componments/user";
import { RegisterResult } from "@/gen/proto/v1/auth/register";

export async function Register(username: string, password: string, setToast: React.Dispatch<React.SetStateAction<string>>) {
    const user = new User(username, password)
    let result: RegisterResult
    try {
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