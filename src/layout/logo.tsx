import React from 'react'
import { Mask } from 'react-daisyui';

interface LogoProp{
    size: "mini" | "normal" | "origin"
    variant?: 'squircle' | 'heart' | 'hexagon' | 'hexagon-2' | 'decagon' | 'pentagon' | 'diamond' | 'square' | 'circle' | 'parallelogram' | 'parallelogram-2' | 'parallelogram-3' | 'parallelogram-4' | 'star' | 'star-2' | 'triangle' | 'triangle-2' | 'triangle-3' | 'triangle-4' | 'half-1' | 'half-2' | undefined
}

export const Logo: React.FC<LogoProp> = ({size, variant}) => {
    let src = ""
    switch (size) {
        case 'mini':
            src = "/minilogo.jpg"
            break
        case 'normal':
            src = "/logo.jpg"
            break
        case 'origin':
            src = "/originlogo.jpg"
            break
    }
    return (
        <Mask src={src} variant={variant}/>
    );
};
