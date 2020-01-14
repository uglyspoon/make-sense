import { PrimaryEditorRenderEngine } from "../logic/render/PrimaryEditorRenderEngine";
import { BaseRenderEngine } from "../logic/render/BaseRenderEngine";
import { IRect } from "../interfaces/IRect";
import { IPoint } from "../interfaces/IPoint";
import { ISize } from "../interfaces/ISize";
import { Scrollbars } from "react-custom-scrollbars";

export class EditorModel {
  public static canvas: HTMLCanvasElement;
  public static mousePositionIndicator: HTMLDivElement;
  public static cursor: HTMLDivElement;
  public static primaryRenderingEngine: PrimaryEditorRenderEngine;
  public static supportRenderingEngine: BaseRenderEngine;
  public static image: HTMLImageElement;
  public static imageRectOnCanvas: IRect;
  public static imageScale: number; // Image / Canvas
  public static mousePositionOnCanvas: IPoint;
  public static isLoading: boolean = false;
  public static editor: HTMLDivElement;
  public static viewPortSize: ISize;
  public static defaultRenderImageRect: IRect;
  public static viewPortScrollbars: Scrollbars;
  public static viewPortActionsDisabled: boolean = false;
}
