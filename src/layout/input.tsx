import React from 'react'
import { Input } from 'react-daisyui'
import { FormattedMessage } from 'react-intl'

interface LoInputProps {
    type?: React.HTMLInputTypeAttribute
    label: string
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
}

export const LoInput: React.FC<LoInputProps> = ({ type, label, value, setValue }) => {
    return (
        <div className="form-control w-full max-w-xs">
            <label className="label">
                <span className="label-text">
                    <FormattedMessage id={label} />
                </span>
            </label>
            <Input type={type} value={value} onChange={e => { setValue(e.target.value) }} />
        </div>
    );
};




