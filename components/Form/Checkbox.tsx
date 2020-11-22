import React from 'react'
import styled from '@emotion/styled'
import { baseColor } from '../../styles/constants'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`

const Label = styled.label`
    display: flex;
    position: relative;
    padding: 0 0 0 1.25rem;
    line-height: 1.5rem;
    border: 0;
    cursor: pointer;
    user-select: none;
    &::before,
    &::after {
        content: '';
        position: absolute;
    }
    &::before {
        top: .125rem;
        left: 0;
        width: 1rem;
        height: 1rem;
        margin: .125rem;
        border: 1px solid #fff;
        border-radius: 1px;
        background-color: #fff;
    }
    &::after {
        top: .5rem;
        left: .375rem;
        width: .5625rem;
        height: .3125rem;
        margin-top: -.1875rem;
        background: none;
        transform-origin: bottom right;
        border-bottom: 2px solid #000;
        border-left: 2px solid #000;
        transform: scale(0) rotate(0deg);
    }
`

const Input = styled.input`
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    border: 0;
    clip: rect(0, 0, 0, 0);

    &:checked + label:before {
        border-width: 1px;
    }

    &:checked + label:after {
        transform: scale(1) rotate(-45deg);
    }
`

const Text = styled.span`
    padding-left: .375rem;
    color: #fff;
`

const Checkbox = ({ name, label }) => {
    return (
        <Wrapper>
            <Input type="checkbox" name={name} id={name} />
            <Label htmlFor={name}><Text>label</Text></Label>
        </Wrapper>
    )
}

export default Checkbox
