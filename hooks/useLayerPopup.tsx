import { FC, useState } from 'react'
import styled from '@emotion/styled'

interface Prop {
    isOpen?: boolean
}

const Wrapper = styled.div`
    position: absolute;
    z-index: 2;
    margin-top: 30px;
`

const Cover = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
`

const LayerWrapper = styled.div`
    position: relative;
    padding: 1rem;
    background-color: rgb(255, 255, 255);
    border-radius: 2px;
`

const useLayerPopup = ({ isOpen = false, custom = false } = {}) => {
    const [isModalOpen, setIsModalOpen] = useState(isOpen);

    const open = () => setIsModalOpen(true)
    const close = () => setIsModalOpen(false)

    const LayerPopup: FC<Prop> = ({ children }) => {
        if (!isModalOpen) return null;

        return (
            <Wrapper>
            <Cover onClick={close} />
            {custom ? children : 
                <LayerWrapper>
                    {children}
                </LayerWrapper>
            }
            </Wrapper>
        )
    }

    return {
        open,
        close,
        LayerPopup
    }
}

export default useLayerPopup;
