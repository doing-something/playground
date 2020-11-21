import { useRef, useEffect } from 'react'
import { Draw, Options } from './scheme'

interface CanvasRef {
    current: HTMLCanvasElement;
}

interface UseCanvas {
    (draw: Draw, options: Options): CanvasRef;
}

const _preDraw = context => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
}

const _postDraw = () => {
}

const useCanvas: UseCanvas = (draw, options) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { preDraw = _preDraw, postDraw = _postDraw } = options

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        let frameCount = 0
        let animationFrameId

        const render = () => {
            frameCount++
            preDraw(context)
            draw(context, frameCount)
            postDraw()
            animationFrameId = window.requestAnimationFrame(render)
        }

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])

    return canvasRef
}

export default useCanvas
