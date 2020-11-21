import {
    createCanvas,
    createHiddenCanvas,
    fillEllipse
} from '../helpers/canvas';
import useMouseState from '../hooks/useMouseState';

function Basic() {
    const { ctx } = createCanvas('basic');
    const { canvas: hiddenCanvas, ctx: hiddenCtx } = createHiddenCanvas('hidden');

    function draw(v) {
        const { mouseX, mouseY } = v;
        console.log('ctx', ctx)
        ctx.fillStyle = 'red';
        fillEllipse({
            ctx,
            width: mouseX,
            height: mouseY,
            width: 20,
            height: 20
        });
    }

    useMouseState({
        draw
    });


    hiddenCanvas.style.left = -window.innerWidth + 'px';

    return (
        <div>ss</div>
    )
}

export default Basic
