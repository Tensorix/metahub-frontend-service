import { LoButton } from "@/layout/button"
import { LoLabel } from "@/layout/label"
import { Logo } from "@/layout/logo"
import { LoSelect } from "@/layout/select"
import { LoToast } from "@/layout/toast"
import { Dispatch, SetStateAction, useState } from "react"
import { useCookies } from "react-cookie"
import { Join } from "react-daisyui"


function save(selLang: string, selTheme: string, setCookie: any, setToast: Dispatch<SetStateAction<string>>): void {
    setCookie("lang", selLang)
    setCookie("theme", selTheme)
    setToast("save_success")
}


function getLang(cookie: { [x: string]: any }): string {
    let lang = cookie["lang"]
    if (lang == undefined) {
        lang = ""
    }
    return lang
}

function getTheme(cookie: { [x: string]: any }): string {
    let theme = cookie["theme"]
    if (theme == undefined) {
        theme = ""
    }
    return theme
}

function restore(setCookie: any, setToast: Dispatch<SetStateAction<string>>) {
    setCookie("lang")
    setToast("save_success")
}

function SettingsPage() {
    const languages = ["en", "zh"]
    const theme = ["light", "dark"]
    const [cookie, setCookie] = useCookies()
    const [selLang, setSelLang] = useState(getLang(cookie))
    const [toast, setToast] = useState("")
    const [selTheme,setSelTheme] = useState(getTheme(cookie))
    return (
        <div className="w-full flex items-center justify-center h-screen">
            <div className="flex items-center flex-col space-y-2 w-1/6">
                <Logo size="normal" variant="squircle" />
                <LoLabel size="text-4xl" value="settings" />
                <LoSelect options={languages} label="language" value={selLang} setValue={setSelLang} />
                <LoSelect options={theme} label="theme" value={selTheme} setValue={setSelTheme}/>
                <Join>
                    <LoButton className="join-item" color="primary" value="save" onClick={() => save(selLang, selTheme, setCookie, setToast)} />
                    <LoButton className="join-item" color="secondary" value="restore_to_default" onClick={() => { restore(setCookie, setToast) }} />
                </Join>
            </div>
            <LoToast value={toast} setValue={setToast} />
        </div>
    )
}

export default SettingsPage
