export interface Draw {
    (context: CanvasRenderingContext2D, option: {
        frameCount: number,
        mouse?: {
            x?: number,
            y?: number
        },
    }): void;
}

export interface Options {
    preDraw(CanvasRenderingContext2D): void
    postDraw(): void
}

export interface CanvasRef {
    current: HTMLCanvasElement;
}
