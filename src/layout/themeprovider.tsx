import { useCookies } from "react-cookie";

export const ThemeProvider: React.FC = () => {
    const [cookie, _] = useCookies()
    document.documentElement.setAttribute('data-theme', cookie["theme"])
    return (<></>)
}