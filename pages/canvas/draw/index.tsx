import React, { useState } from 'react'
import { Editor } from '../../../components/Layout'
import { Shape } from '../../../components/ShapePicker'
import Canvas from './Canvas'
import Form from './Form'

function App() {
    const [{ size, color, shape }, setState] = useState({
        size: 20,
        color: 'rgba(0, 0, 0, .5)',
        shape: Shape.circle
    })

    const handleSubmit = ({ size, color, shape }) => {
        setState(prev => ({
            size: size || prev.size,
            color: color || prev.color,
            shape: Number(shape)
        }))
    }

    return (
        <>
            <Canvas size={size} color={color} shape={shape} />
            <Editor>
                <Form 
                    onSubmit={handleSubmit} 
                    size={size}
                />
            </Editor>
        </>
    )
}

export default App
