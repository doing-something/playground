import React, { FC } from 'react'
import styled from '@emotion/styled'
import { baseColor, textColor } from '../../styles/constants'

interface Prop {
    name: string;
    placeholder?: string;
}

const Input = styled.input`
    height: 2rem;
    padding: 0 1rem;
    font-size: 1rem;
    border: 1px solid ${baseColor};
    color: ${textColor};
    background: none;
`

const TextField: FC<Prop> = ({ name, placeholder = '' }) => {
    return (
        <Input 
            type="text" 
            name={name} 
            placeholder={placeholder} 
        />
    )
}

export default TextField
