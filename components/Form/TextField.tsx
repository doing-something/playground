import React, { FC } from 'react'
import styled from '@emotion/styled'
import { baseColor, textColor } from '../../styles/constants'

interface Prop {
    name: string;
    placeholder?: string;
    defaultValue?: string;
}

const Input = styled.input`
    height: 2rem;
    padding: 0 1rem;
    font-size: 1rem;
    border: 1px solid ${baseColor};
    color: ${textColor};
    background: none;
`

const TextField: FC<Prop> = ({ name, placeholder = '', defaultValue = '' }) => {
    return (
        <Input 
            type="text" 
            name={name} 
            defaultValue={defaultValue}
            placeholder={placeholder} 
        />
    )
}

export default TextField
