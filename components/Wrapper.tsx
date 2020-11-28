import styled from '@emotion/styled'

interface StyleProp {
    full?: boolean
}

export default function Wrapper({ children }) {
    return <>{children}</>
}

export const InlineWrapper = styled.div<StyleProp>`
    display: flex;
    width: ${({ full }) => (full ? '100%' : 'auto')};
`
