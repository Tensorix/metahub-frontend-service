import store from "store2"

export const ThemeProvider: React.FC = () => {
    let theme = store.get("theme")
    if (theme == undefined) {
        let darkmode = false
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            darkmode = true
        }
        theme = darkmode ? "dark" : "light"
        store.set("theme", theme)
    }
    switch (theme) {
        case "light":
            store.set("color_selected", "info")
            break
        case "dark":
            store.set("color_selected", "neutral")
            break
    }
    document.documentElement.setAttribute('data-theme', theme)
    return (<></>)
}