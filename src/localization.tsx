export abstract class Localization {
    public static en = {
        login: "Login",
        register: "Register",
        language: "Language",
        nickname: "Nickname",
        username: "Username",
        password: "Password",
        settings: "Settings",
        unspecified_error: "Unspecified Error",
        create_success: "Create Success",
        user_exists: "User Exists",
        login_failed: "Login Failed",
        username_or_password_cannot_be_null: "Username or password cannot be null",
        zh: "Chinese",
        en: "English",
        save: "Save",
        save_success: "Save success",
        restore_to_default: "Restore to default",
        network_error: "Network error",
        inbox: "Inbox",
        status: "Status"
    }

    public static zh = {
        login: "登录",
        register: "注册",
        language: "语言",
        nickname: "昵称",
        username: "用户名",
        password: "密码",
        settings: "设置",
        unspecified_error: "未指定的错误",
        create_success: "创建成功",
        user_exists: "用户已存在",
        login_failed: "登录失败",
        username_or_password_cannot_be_null: "用户名或密码不能为空",
        zh: "中文",
        en: "英语",
        save: "保存",
        save_success: "保存成功",
        restore_to_default: "恢复默认设置",
        network_error: "网络错误",
        inbox: "收件箱",
        status: "状态"
    }

    public static getLangData(cookie: { [x: string]: string }) {
        let lang = cookie["lang"]
        if (lang == undefined || lang == "undefined") {
            lang = navigator.language
        }
        switch (lang) {
            case "zh":
            case "zh-CN":
                return Localization.zh
            case "en":
            case "en-US":
                return Localization.en
            default:
                return Localization.en
        }
    }
}
