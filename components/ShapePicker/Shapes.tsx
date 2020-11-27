import styled from '@emotion/styled'
import { css } from '@emotion/react'

const sizeNum = 16;
const size = `${sizeNum}px`;
const color = '#28282e'
const lightColor = '#fff'
const space = '0 1rem';

interface StyleProp {
    light?: boolean;
    margin?: boolean
}

function getPixel(val: number, times: number) {
    return `${Math.round(val * times)}px`
}

const dynamicStyle = ({ light = false, margin = false }) => css`
    background: ${light ? lightColor : color};
    margin: ${margin ? space : '0px'};
`

export const Circle = styled.div<StyleProp>`
    ${dynamicStyle}
    width: ${size};
    height: ${size};
    border-radius: 50%;
`

export const Square = styled.div<StyleProp>`
    ${dynamicStyle}
    width: ${size};
    height: ${size};
`

export const Triangle = styled.div<StyleProp>`
    width: 0;
    height: 0;
    border-left: ${getPixel(sizeNum, 0.5)} solid transparent;
    border-right: ${getPixel(sizeNum, 0.5)} solid transparent;
    border-bottom-width: ${size};
    border-bottom-style: solid;
    border-bottom-color: ${({ light }) => light ? lightColor : color};
    margin: ${({ margin }) => margin ? space : '0px'};
`

export const Cross = styled.div<StyleProp>`
    ${dynamicStyle}
    position: relative;
    width: ${getPixel(sizeNum, 0.2)};
    height: ${size};

    &::after {
        content: '';
        position: absolute;
        width: ${size};
        height: ${getPixel(sizeNum, 0.2)};
        top: ${getPixel(sizeNum, 0.4)};
        left: ${getPixel(-sizeNum, 0.4)};
        background: ${({ light }) => light ? lightColor : color};
    }
`

