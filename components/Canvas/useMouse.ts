import { useState, useEffect } from 'react'
import { CanvasRef } from './scheme'

interface UseMouse {
    (canvasRef?: CanvasRef): {
        mouseX?: number,
        mouseY?: number
    }
}

const useMouse: UseMouse = canvasRef => {
    const [{ mouseX, mouseY }, setState] = useState({ mouseX: null, mouseY: null })

    function handleMouseMove(e) {
        setState({
            mouseX: e.clientX,
            mouseY: e.clientY,
        })
    }

    function handleMouseDown(e) {}

    function handleMouseUp(e) {}

    function handleMouseOut(e) {}

    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current

        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mouseout', handleMouseOut)

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('mousedown', handleMouseDown)
            canvas.removeEventListener('mouseup', handleMouseUp)
            canvas.removeEventListener('mouseout', handleMouseOut)
        }
    }, [])

    return {
        mouseX,
        mouseY
    }
}

export default useMouse
