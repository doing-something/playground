import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { baseColor, textColor } from '../../styles/constants'

const style = css`
    display: flex;
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    color: ${baseColor};
`

const Title = styled.div`
    ${style};
    padding-bottom: 0;
    font-size: 1rem;
    border-top: 1px solid ${baseColor};
    color: ${textColor};
`

const Wrapper = styled.div`
    ${style};
`

const FieldSet = ({title, children }) => {
    return (
        <>
            <Title>{title}</Title>
            <Wrapper>{children}</Wrapper>
        </>
    )
}

export default FieldSet
