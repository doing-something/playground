export const ellipse = ({
    ctx, x, y, width, height
}) => {
    ctx.beginPath()
    for (let i = 0; i < Math.PI * 2; i+= Math.PI / 16) {
        ctx.lineTo(x + (Math.cos(i) * width/2), y + (Math.sin(i) * height/2));
    }
    ctx.closePath()
}

export const fillEllipse = ({
    ctx, x, y, width, height
}) => {
    ellipse({ ctx, x, y, width, height })
    ctx.fill()
    ctx.beginPath()
}
