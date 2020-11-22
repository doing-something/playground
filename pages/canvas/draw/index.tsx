import React, { useState } from 'react'
import { Editor } from '../../../components/Layout'
import Canvas from './Canvas'
import Form from './Form'


function App() {
    const [{ size, color }, setState] = useState({
        size: 50,
        color: '#000'
    })

    const handleSubmit = ({ size, color }) => {
        setState(prev => ({
            size: size || prev.size,
            color: color || prev.color
        }))
    }

    return (
        <>
            <Canvas size={size} color={color} />
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
