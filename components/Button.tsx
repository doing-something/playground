import React, { FC } from 'react'
import styled from '@emotion/styled'
import { baseColor, textColor } from '../styles/constants'
import { identity } from '../helpers/util'

interface StyleProp {
    block?: boolean
    primary?: boolean
}

interface Prop extends React.ButtonHTMLAttributes<HTMLButtonElement> {};
type ButtonProp = Prop & StyleProp;

const ButtonElement = styled.button<StyleProp>`
    display: ${(props) => (props.block ? 'block' : 'inline-block')};
    width: ${(props) => (props.block ? '100%' : 'auto')};
    padding: 1rem;
    font-size: 1rem;
    border: 1px solid ${baseColor};
    color: ${baseColor};
    background: ${(props) => (props.primary ? 'rgba(255, 255, 255, .9)' : 'none')};
    cursor: pointer;
    transition: background 70ms cubic-bezier(0, 0, .38, .9);
    &:hover {
        background-color: rgba(255, 255, 255, 1);
    }
`



const Button: FC<ButtonProp> = ({ 
    type = 'button', 
    onClick = identity, 
    block = false,
    primary = false,
    children 
}) => {
    return (
        <ButtonElement 
            type={type} 
            onClick={onClick} 
            block={block}
            primary={primary}
        >{children}</ButtonElement>
    )
}

export default Button
