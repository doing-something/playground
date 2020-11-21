import React from 'react'
import useCanvas from './useCanvas'
import { Draw, Options } from './scheme'

interface CanvasProp {
    draw: Draw
    preDraw?: Options['preDraw']
    postDraw?: Options['postDraw']
    width?: number
    height?: number
}

const Canvas = ({ 
    draw, 
    preDraw,
    postDraw,
    ...rest 
}: CanvasProp) => {
    const { canvasRef } = useCanvas(draw, { preDraw, postDraw })

    return <canvas ref={canvasRef} {...rest} />
}

export default Canvas

export * from './util';
