import React from 'react'
import { Alert, Button, Toast } from 'react-daisyui'
import { FormattedMessage } from 'react-intl'

interface LoToastProp {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
}

export const LoToast: React.FC<LoToastProp> = ({ value, setValue }) => {
    return (
        <>
            {value != "" && <Toast>
                <Alert status="info">
                    <FormattedMessage id={value} />
                    <Button color="ghost" onClick={() => setValue("")}>
                        X
                    </Button>
                </Alert>
            </Toast>}
        </>
    );
};
