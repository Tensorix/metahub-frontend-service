import store from "store2"

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
        status: "Status",
        connection_timeout: "Connection timeout",
        input_message: "Input message",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        uid: "UID",
        account_tag: "Account Tag",
        user_id: "User ID",
        ip: "IP",
        port: "Port",
        action: "Action",
        query_failed: "Query failed",
        field_already_exists: "Field already exists",
        field_not_exists: "Field not exists",
        add_success: "Add success",
        add_failed: "Add failed",
        remove_success: "Remove success",
        remove_failed: "Remove failed",
        openai_endpoint: "OpenAI Endpoint",
        openai_key: "OpenAI Key",
        stt_endpoint: "STT Endpoint",
        stt_key: "STT Key",
        clear_all_data: "Clear all data",
        friend_id: "Friend ID",
        remark: "Remark",
        friend_info: "Friend Info",
        send_message: "Send Message",
        friend_uid: "Friend UID"
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
        status: "状态",
        connection_timeout: "连接超时",
        input_message: "输入消息",
        theme: "主题",
        light: "明亮",
        dark: "黑暗",
        uid: "UID",
        account_tag: "账号标签",
        user_id: "用户ID",
        ip: "IP",
        port: "端口",
        action: "动作",
        query_failed: "查询失败",
        field_already_exists: "字段已存在",
        field_not_exists: "字段不存在",
        add_success: "添加成功",
        add_failed: "添加失败",
        remove_success: "删除成功",
        remove_failed: "删除失败",
        openai_endpoint: "OpenAI终结点",
        openai_key: "OpenAI密钥",
        stt_endpoint: "STT终结点",
        stt_key: "STT密钥",
        clear_all_data: "清除所有数据",
        friend_id: "好友ID",
        remark: "备注",
        friend_info: "好友信息",
        send_message: "发送消息",
        friend_uid: "好友UID"
    }

    public static getLangData() {
        let lang = store.get("lang")
        if (lang == undefined) {
            lang = navigator.language
            store.set("lang", lang)
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
