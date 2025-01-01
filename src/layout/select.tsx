
import React from 'react'
import { Select, } from 'react-daisyui'
import { FormattedMessage } from 'react-intl'

interface LoSelectProp {
    options: string[]
    label: string
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
}

export const LoSelect: React.FC<LoSelectProp> = ({ options, label, value, setValue }) => {
    return (
        <div className="form-control w-full max-w-xs">
            <label className="label">
                <span className="label-text">
                    <FormattedMessage id={label} />
                </span>
            </label>
            <Select defaultValue={value} onChange={e => setValue(e.target.value)}>
                {options.map((option, i) =>
                    <option value={option} key={i}>
                        <FormattedMessage id={option} />
                    </option>
                )}
            </Select>
        </div>
    )
}
