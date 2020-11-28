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

export const fillSquare = ({
    ctx, x, y, width, height
}) => {
    ctx.fillRect(x, y, width, height)
}

export const fillTriangle = ({
    ctx, x1, y1, x2, y2, x3, y3
}) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    ctx.fill()
    ctx.closePath()
}

export const cross = ({
    ctx, x, y, size = 20
}) => {
    ctx.font = `${size}px serif`;
    ctx.fillText('\u{002B}', x, y);
}
