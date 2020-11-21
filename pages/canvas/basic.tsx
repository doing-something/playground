import React from 'react'
import Canvas from '../../components/Canvas'
import { Draw } from '../../components/Canvas/scheme'

function App() {
    const draw: Draw = (ctx, frameCount) => {
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI)
        ctx.fill()
    }

    return <Canvas draw={draw} />
}

export default App
