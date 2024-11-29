import React from 'react'
import { Input } from 'react-daisyui'
import { FormattedMessage } from 'react-intl'

interface LoInputProps {
    className?: string | undefined
    type?: React.HTMLInputTypeAttribute
    label: string
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
}

export const LoInput: React.FC<LoInputProps> = ({ className, type, label, value, setValue }) => {
    return (
        <div className="w-full">
            <label className="label">
                <span className="label-text">
                    <FormattedMessage id={label} />
                </span>
            </label>
            <Input className={className} type={type} value={value} onChange={e => { setValue(e.target.value) }} />
        </div>
    );
};
