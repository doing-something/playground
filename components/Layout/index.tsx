import React from 'react'
import styled from '@emotion/styled'

const Wrapper = styled.div`
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 400px;
    background-color: #1c1c21;

    canvas {
        background-color: #fff
    }
`
export const CanvasWrapper = styled.div`
    display: flex;
    overflow: hidden;
    justify-content: center;
    align-items: center;
`

const EditorWrapper = styled.div`
    height: 100%;
    background-color: #28282e;
`
export const Editor = ({ children }) => {
    return (
        <EditorWrapper>
            {children} 
        </EditorWrapper>
    )
}

const Layout = ({ children }) => {
    return (
        <Wrapper>
            {children}
        </Wrapper>
    )
}

export default Layout
