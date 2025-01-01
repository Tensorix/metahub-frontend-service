import { LoButton } from "@/layout/button"
import { LoInput } from "@/layout/input"
import { LoLabel } from "@/layout/label"
import { Logo } from "@/layout/logo"
import { LoSelect } from "@/layout/select"
import { LoToast } from "@/layout/toast"
import { useEffect, useReducer, useState } from "react"
import { Join } from "react-daisyui"
import store from "store2"


function getLang(): string {
    let lang = store.get("lang")
    if (lang == undefined) {
        lang = ""
    }
    return lang
}

function getTheme(): string {
    let theme = store.get("theme")
    if (theme == undefined) {
        theme = ""
    }
    return theme
}

function getOpenAIEndpoint(): string {
    let endpoint = store.get("openai_endpoint")
    if (endpoint == undefined) {
        endpoint = ""
    }
    return endpoint
}

function getOpenAIKey(): string {
    let key = store.get("openai_key")
    if (key == undefined) {
        key = ""
    }
    return key
}


function getSTTEndpoint(): string {
    let key = store.get("stt_endpoint")
    if (key == undefined) {
        key = ""
    }
    return key
}
function getSTTKey(): string {
    let key = store.get("stt_key")
    if (key == undefined) {
        key = ""
    }
    return key
}

function SettingsPage() {
    const languages = ["en", "zh"]
    const theme = ["light", "dark"]
    const [selLang, setSelLang] = useState(getLang())
    const [toast, setToast] = useState("")
    const [selTheme, setSelTheme] = useState(getTheme())
    const [openAIEndpoint, setOpenAIEndpoint] = useState("")
    const [openAIKey, setOpenAIKey] = useState("")
    const [sttEndpoint, setSTTEndpoint] = useState("")
    const [sttKey, setSTTKey] = useState("")
    useEffect(() => {
        setOpenAIEndpoint(getOpenAIEndpoint())
        setOpenAIKey(getOpenAIKey())
        setSTTEndpoint(getSTTEndpoint())
        setSTTKey(getSTTKey())
    }, [])
    return (
        <div className="w-full flex items-center justify-center h-screen">
            <div className="flex items-center flex-col space-y-2 w-1/6">
                <Logo size="normal" variant="squircle" />
                <LoLabel size="text-4xl" value="settings" />
                <LoSelect options={languages} label="language" value={selLang} setValue={setSelLang} />
                <LoSelect options={theme} label="theme" value={selTheme} setValue={setSelTheme} />
                <LoInput className="w-full" label="openai_endpoint" value={openAIEndpoint} setValue={setOpenAIEndpoint} />
                <LoInput className="w-full" label="openai_key" value={openAIKey} setValue={setOpenAIKey} />
                <LoInput className="w-full" label="stt_endpoint" value={sttEndpoint} setValue={setSTTEndpoint} />
                <Join>
                    <LoButton className="join-item" color="primary" label="save" onClick={() => {
                        store.set("lang", selLang)
                        store.set("theme", selTheme)
                        store.set("openai_endpoint", openAIEndpoint)
                        store.set("openai_key", openAIKey)
                        store.set("stt_endpoint", sttEndpoint)
                        store.set("stt_key", sttKey)
                        setToast("save_success")
                    }} />
                    <LoButton className="join-item" color="secondary" label="restore_to_default" onClick={() => {
                        store.remove("lang")
                        store.remove("theme")
                        store.remove("openai_endpoint")
                        store.remove("openai_key")
                        store.remove("stt_endpoint")
                        store.remove("stt_key")
                        setToast("save_success")
                    }} />
                    <LoButton className="join-item" color="accent" label="clear_all_data" onClick={() => {
                        store.clearAll()
                        setToast("save_success")
                    }} />
                </Join>
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}

export default SettingsPage
