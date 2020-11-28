import React, { useState } from 'react'
import { Editor } from '../../../components/Layout'
import { Shape } from '../../../components/ShapePicker'
import Canvas from './Canvas'
import Form from './Form'

function App() {
    const [{ size, color, shape, updateKey }, setState] = useState({
        size: 20,
        color: 'rgba(0, 0, 0, .5)',
        shape: Shape.circle,
        updateKey: 1
    })

    const handleSubmit = ({ size, color, shape }) => {
        setState(prev => ({
            ...prev,
            size: size || prev.size,
            color: color || prev.color,
            shape: Number(shape)
        }))
    }

    const handleReset = () => {
        setState(prev => ({
            ...prev,
            updateKey: prev.updateKey + 1
        }))
    }

    return (
        <>
            <Canvas size={size} color={color} shape={shape} key={updateKey} />
            <Editor>
                <Form 
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    size={size}
                />
            </Editor>
        </>
    )
}

export default App
