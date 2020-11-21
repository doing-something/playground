import { useRef, useEffect } from 'react'
import useMouse from './useMouse'
import { Draw, Options, CanvasRef } from './scheme'

interface Option {
    preDraw?: Options['preDraw']
    postDraw?: Options['postDraw']
}

interface UseCanvas {
    (draw: Draw, options: Option): {
        canvasRef: CanvasRef,
    };
}

const _preDraw = context => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
}

const _postDraw = () => {
}

const useCanvas: UseCanvas = (
    draw, 
    { preDraw = _preDraw, postDraw = _postDraw}
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({
        x: null,
        y: null
    })
    const { mouseX, mouseY } = useMouse(canvasRef)

    useEffect(() => {
        mouseRef.current.x = mouseX
        mouseRef.current.y = mouseY
    }, [mouseX, mouseY])

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        let frameCount = 0
        let animationFrameId

        const render = () => {
            frameCount++
            preDraw(context)

            draw(context, {
                frameCount,
                mouse: mouseRef.current,
            })
            postDraw()
            animationFrameId = window.requestAnimationFrame(render)
        }

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])

    return { 
        canvasRef
    }
}

export default useCanvas
