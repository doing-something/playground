import styled from '@emotion/styled'

export default function Wrapper({ children }) {
    return <>{children}</>
}

export const InlineWrapper = styled.div`
    display: flex;
`
