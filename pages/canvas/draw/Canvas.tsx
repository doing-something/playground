import React, { FC } from 'react'
import { CanvasWrapper } from '../../../components/Layout'
import Canvas, { fillEllipse, fillSquare, fillTriangle, cross } from '../../../components/Canvas'
import { Draw } from '../../../components/Canvas/scheme'
import { Shape } from '../../../components/ShapePicker'
import { isNil } from '../../../helpers/util'

type shapeType = typeof Shape[keyof typeof Shape]

interface Prop {
    size: number;
    color: string;
    shape: shapeType;
}

function renderShape({
    ctx, x, y, size, shape
}) {
    switch(shape) {
        case Shape.square:
            return fillSquare({
                ctx,
                x,
                y,
                width: size, 
                height: size
            })
        case Shape.triangle:
            return fillTriangle({
                ctx, 
                x1: x, 
                y1: y, 
                x2: x + (size / 2),
                y2: y + (size / 2), 
                x3: x - (size / 2), 
                y3: y + (size / 2), 
            })
        case Shape.cross:
            return cross({
                ctx,
                x,
                y,
                size
            })
        default:
            return fillEllipse({
                ctx,
                x,
                y,
                width: size, 
                height: size
            })
    }
}

const CanvasArea: FC<Prop> = ({ size, color, shape }) => {
    const draw: Draw = (ctx, { mouse: { x: mouseX, y: mouseY } }) => {
        ctx.fillStyle = color

        if (isNil(mouseX) || isNil(mouseY)) return
        
        renderShape({
            ctx,
            x: mouseX,
            y: mouseY,
            size,
            shape
        })
    }

    return (
        <CanvasWrapper>
            <Canvas draw={draw} width={500} height={500} />
        </CanvasWrapper>
    )
}

export default CanvasArea
