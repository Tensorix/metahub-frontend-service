import React, { KeyboardEventHandler, RefObject } from 'react'
import { Input } from 'react-daisyui'
import { FormattedMessage } from 'react-intl'

interface LoInputProps {
    innerRef?: RefObject<HTMLInputElement>
    className?: string | undefined
    type?: React.HTMLInputTypeAttribute
    label?: string
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>
}

export const LoInput: React.FC<LoInputProps> = ({ innerRef, className, type, label, value, setValue, onKeyDown }) => {
    return (
        <div className="w-full">
            {label != undefined &&
                <label className="label">
                    <span className="label-text">
                        <FormattedMessage id={label} />
                    </span>
                </label>
            }
            <Input ref={innerRef} className={className} type={type}
                value={value} onChange={e => { setValue(e.target.value) }}
                onKeyDown={onKeyDown} />
        </div>
    );
};
