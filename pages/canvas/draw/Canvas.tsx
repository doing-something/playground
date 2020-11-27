import React, { FC, useState } from 'react'
import { CanvasWrapper } from '../../../components/Layout'
import Canvas, { fillEllipse } from '../../../components/Canvas'
import { Draw } from '../../../components/Canvas/scheme'
import { Shape } from '../../../components/ShapePicker'
import { isNil } from '../../../helpers/util'

type shapeType = typeof Shape[keyof typeof Shape]

interface Prop {
    size: number;
    color: string;
    shape: shapeType;
}

const CanvasArea: FC<Prop> = ({ size, color, shape }) => {
    const draw: Draw = (ctx, { mouse: { x: mouseX, y: mouseY } }) => {
        ctx.fillStyle = color

        if (isNil(mouseX) || isNil(mouseY)) return

        fillEllipse({
            ctx,
            x: mouseX,
            y: mouseY,
            width: size, 
            height: size
        })
    }

    return (
        <CanvasWrapper>
            <Canvas draw={draw} width={500} height={500} />
        </CanvasWrapper>
    )
}

export default CanvasArea
