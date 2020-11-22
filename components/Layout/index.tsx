import React from 'react'
import styled from '@emotion/styled'
import Editor from '../../components/Layout/Editor'

const Wrapper = styled.div`
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-columns: 3fr 1fr;
    background-color: #1c1c21;

    canvas {
        background-color: #fff
    }
`
const CanvasWrapper = styled.div`
    display: flex;
    overflow: hidden;
    justify-content: center;
    align-items: center;
`

const Layout = ({ children }) => {
    return (
        <Wrapper>
            <CanvasWrapper>{children}</CanvasWrapper>
            <Editor />
        </Wrapper>
    )
}

export default Layout
