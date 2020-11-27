import React, { FC, useState } from 'react'
import { ChromePicker } from 'react-color';
import styled from '@emotion/styled'
import useLayerPopup from '../../hooks/useLayerPopup'

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

const ColorPicker: FC = () => {
    const { LayerPopup, open } = useLayerPopup({ custom: true })
    const [color, setColor] = useState({
        r: '0',
        g: '0',
        b: '0',
        a: '1',
    })
    const { r, g, b, a } = color

    const handleClick = () => {
        open()
    }
    
    const handleChange = ({ rgb }) => {
        setColor(rgb)
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
            <input type="hidden" value={`rgba(${r}, ${g}, ${b}, ${a})`} name="color" />
            <LayerPopup>
                <ChromePicker color={color} onChange={handleChange} />
            </LayerPopup>
        </>
    )
}

export default ColorPicker
