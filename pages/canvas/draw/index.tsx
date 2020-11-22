import React from 'react'
import Canvas, { fillEllipse } from '../../../components/Canvas'
import { Draw } from '../../../components/Canvas/scheme'
import { CanvasWrapper, Editor } from '../../../components/Layout'
import Form from './Form'
import { isNil } from '../../../helpers/util'

function App() {
    const draw: Draw = (ctx, { mouse: { x: mouseX, y: mouseY } }) => {
        ctx.fillStyle = 'rgba(255, 0, 0, .1)'

        if (isNil(mouseX) || isNil(mouseY)) return

        fillEllipse({
            ctx,
            x: mouseX,
            y: mouseY,
            width: 50, 
            height: 50
        })
    }

    return (
        <>
            <CanvasWrapper>
                <Canvas draw={draw} width={500} height={500} />
            </CanvasWrapper>
            <Editor><Form /></Editor>
        </>
    )
}

export default App
