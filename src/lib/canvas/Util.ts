import { CanvasRenderingContext2D } from "skia-canvas/lib";

// 纵向画图例，返回图例区域的实际宽度和高度。
export function drawLegends(
    ctx: CanvasRenderingContext2D,
    legends: { color: string, name: string }[],
    x: number, y: number,
    legendWidth: number,
    legendHeight?: number,
    duration: number = 4,
    width?: number | undefined): { width: number, height: number } {
    if (!legendHeight) legendHeight = legendWidth;
    if (!width) width = 0;

    let maxTextWidth = 0, areaHeight = 0;
    for (const legend of legends) {
        const textMeasureResult = ctx.measureText(legend.name, width ? width - legendWidth - duration : undefined);
        const textWidth = textMeasureResult.width;
        const textHeight = textMeasureResult.lines.map(l => l.height).reduce((p, c) => p + c);
        if (textWidth > maxTextWidth) maxTextWidth = textWidth;
        ctx.save();
        ctx.fillStyle = legend.color;
        ctx.fillRect(x, y + areaHeight, legendWidth, legendHeight);
        ctx.restore();

        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(legend.name, x + legendWidth + duration, y + areaHeight + legendHeight / 2, textWidth);
        ctx.restore();

        areaHeight += Math.max(textHeight, legendHeight) + duration;
    }

    return {
        width: legendWidth + duration + maxTextWidth,
        height: areaHeight - duration // 由于固定区域高度增加一个duration，所以此处减去最后一个duration得到区域实际高度
    }
}
