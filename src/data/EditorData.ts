import { IPoint } from "../interfaces/IPoint";
import { IRect } from "../interfaces/IRect";
import { ISize } from "../interfaces/ISize";

export interface EditorData {
    mousePositionOnCanvas: IPoint,
    canvasSize: ISize,
    activeImageScale: number,
    activeImageRectOnCanvas: IRect,
    activeKeyCombo: string[],
    event?: Event
    viewPortSize: ISize,
    zoom: number,
    defaultRenderImageRect: IRect,
    realImageSize: ISize,
    absoluteViewPortContentScrollPosition: IPoint,
    viewPortContentImageRect: IRect,
}