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
        const { x, y } = this;

        setState({
            mouseX: e.clientX - x,
            mouseY: e.clientY - y,
        })
    }

    function handleMouseDown(e) {}

    function handleMouseUp(e) {}

    function handleMouseOut(e) {}

    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current
        const { x = 0, y = 0 } = canvas.getBoundingClientRect();
        const boundMouseMove = handleMouseMove.bind({ x, y })

        canvas.addEventListener('mousemove', boundMouseMove)
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mouseout', handleMouseOut)

        return () => {
            canvas.removeEventListener('mousemove', boundMouseMove)
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
