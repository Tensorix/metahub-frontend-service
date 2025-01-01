import React from 'react';
import { Button } from 'react-daisyui';
import { FormattedMessage } from 'react-intl';

interface LoButtonProps {
    className?: string
    color: "neutral" | "primary" | "secondary" | "accent" | "ghost" | "info" | "success" | "warning" | "error" | undefined
    label: string
    onClick: React.MouseEventHandler
    disabled?: boolean
}

export const LoButton: React.FC<LoButtonProps> = ({ className, color, label: value, onClick, disabled }) => {
    return (
        <Button className={className} color={color} onClick={onClick} disabled={disabled}>
            <FormattedMessage id={value} />
        </Button>
    );
};
