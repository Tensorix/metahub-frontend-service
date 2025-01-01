import { MdSearch } from "react-icons/md"
import { LoInput } from "./input"

interface SearchInputProps {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
}
export const SearchInput: React.FC<SearchInputProps> = ({ value, setValue }) => {
    return (
        <div className="flex flex-row w-full justify-center px-8">
            <div className="flex h-full aspect-square items-center justify-center">
                <MdSearch className="h-3/5 w-3/5" />
            </div>
            <LoInput value={value} setValue={setValue} />
        </div>
    )
}


