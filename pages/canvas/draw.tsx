import React from 'react'
import Canvas, { fillEllipse } from '../../components/Canvas'
import { Draw } from '../../components/Canvas/scheme'
import { isNil } from '../../helpers/util'

function App() {
    const draw: Draw = (ctx, { mouse: { x: mouseX, y: mouseY } }) => {
        ctx.fillStyle = 'red'

        if (isNil(mouseX) || isNil(mouseY)) return

        fillEllipse({
            ctx,
            x: mouseX,
            y: mouseY,
            width: 20, 
            height: 20
        })
    }

    return <Canvas 
        draw={draw} 
        width={500} 
        height={500} 
    />
}

export default App
