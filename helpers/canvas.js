export function createCanvas(canvasName) {
    const canvas = document.createElement('canvas');
    const body = document.querySelector('body');
    canvas.setAttribute('id', canvasName);
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    console.log('sss', ctx)
    resize();
    window.addEventListener('resize', resize, false);

    return {
        ctx,
        canvas
    };
}

function resize() {
    const c = document.getElementsByTagName('canvas');
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    for (let i=0; i<c.length; i++) {
        c[i].width = w;
        c[i].height = h;
    }
}

export function createHiddenCanvas(canvasName) {
    const { ctx, canvas } = createCanvas(canvasName);
    canvas.style.left = `${-window.innerWidth}px`;
    return { ctx, canvas }
}

export function fillEllipse({
    ctx,
    x, 
    y, 
    width, 
    height
}) {
    ctx.ellipse(x, y, width, height);
    ctx.fill();
    ctx.beginPath();
}
