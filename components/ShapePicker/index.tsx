import React, { FC, useState } from 'react'
import styled from '@emotion/styled'
import useLayerPopup from '../../hooks/useLayerPopup'
import { 
    Circle,
    Square,
    Triangle,
    Cross,
    Moon
} from './Shapes'
import { InlineWrapper } from '../Wrapper'

const ShapeButton = styled.button`
    display: inline-block;
    outline: 0;
    cursor: pointer;
    background: none;
    border: 0;
`

export enum Shape {
    circle,
    square,
    triangle,
    cross,
    moon
}

const Shapes = [
    <Circle light />,
    <Square light />,
    <Triangle light />,
    <Cross light />,
    <Moon light />
]

function renderShape(idx) {
    return Shapes[idx];
}

const ShapePicker: FC = () => {
    const { LayerPopup, open } = useLayerPopup()

    const [shape, setShape] = useState(Shape.circle)

    const handleClick = () => {
        open()
    }
    
    const selectShape = (shape: Shape) => {
        setShape(shape)
    }

    return (
        <>
            <ShapeButton 
                type="button" 
                onClick={handleClick}
            >{renderShape(shape)}</ShapeButton>
            <input type="hidden" value={shape} name="shape" />
            <LayerPopup>
                <InlineWrapper>
                    <Circle margin onClick={() => selectShape(Shape.circle)} />
                    <Square margin onClick={() => selectShape(Shape.square)} />
                    <Triangle margin onClick={() => selectShape(Shape.triangle)} />
                    <Cross margin onClick={() => selectShape(Shape.cross)} />
                    <Moon margin onClick={() => selectShape(Shape.moon)} />
                </InlineWrapper>
            </LayerPopup>
        </>
    )
}

export default ShapePicker
