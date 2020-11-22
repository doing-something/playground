import React, { FC, useState } from 'react'
import { CanvasWrapper } from '../../../components/Layout'
import Canvas, { fillEllipse } from '../../../components/Canvas'
import { Draw } from '../../../components/Canvas/scheme'
import { isNil } from '../../../helpers/util'

interface Prop {
    size: number;
    color: string;
}

const CanvasArea: FC<Prop> = ({ size, color }) => {
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
    console.log('ss', size, color)
    return (
        <CanvasWrapper>
            <Canvas draw={draw} width={500} height={500} />
        </CanvasWrapper>
    )
}

export default CanvasArea
