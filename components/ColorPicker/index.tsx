import React, { FC, useState } from 'react'
import { ChromePicker } from 'react-color';
import styled from '@emotion/styled'

const ColorButton = styled.button`
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    border: 2px solid #fff;
    background-color: transparent;
    outline: 0;
    cursor: pointer;
`

const Wrapper = styled.div`
    position: absolute;
    z-index: 2;
    margin-top: 30px;
`

const Cover = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
`

const ColorPicker: FC = () => {
    const [{ displayColorPicker, color }, setState] = useState({
        displayColorPicker: false,
        color: {
            r: '40',
            g: '40',
            b: '46',
            a: '1',
        }
    })
    const { r, g, b, a } = color

    const handleClick = () => {
        setState(prev => ({
            ...prev,
            displayColorPicker: !prev.displayColorPicker
        }))
    }

    const close = () => {
        setState(prev => ({
            ...prev,
            displayColorPicker: false
        }))
    }
    
    const handleChange = ({ rgb }) => {
        setState(prev => ({
            ...prev,
            color: rgb
        }))
    }

    return (
        <>
            <ColorButton 
                type="button" 
                onClick={handleClick}
                style={{
                    background: `rgba(${r}, ${g}, ${b}, ${a})`
                }}
            />
            {displayColorPicker ? <Wrapper>
                <Cover onClick={close} />
                <ChromePicker color={color} onChange={handleChange} />
            </Wrapper> : null}
        </>
    )
}

export default ColorPicker
