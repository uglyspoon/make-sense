import { IRect } from '../../interfaces/IRect';
import { RenderEngineConfig } from '../../settings/RenderEngineConfig';
import { IPoint } from '../../interfaces/IPoint';
import { CanvasUtil } from '../../utils/CanvasUtil';
import { store } from '../../index';
import { ImageData, LabelPoint } from '../../store/editor/types';
import uuidv1 from 'uuid/v1';
import {
  updateActiveLabelId,
  updateFirstLabelCreatedFlag,
  updateHighlightedLabelId,
  updateImageDataById,
  updateActiveLabelNameIndex,
  findNextAvailableLabelIndex,
} from '../../store/editor/actionCreators';
import { RectUtil } from '../../utils/RectUtil';
import { DrawUtil } from '../../utils/DrawUtil';
import { updateCustomCursorStyle } from '../../store/general/actionCreators';
import { CustomCursorStyle } from '../../data/enums/CustomCursorStyle';
import { EditorSelector } from '../../store/selectors/EditorSelector';
import { EditorData } from '../../data/EditorData';
import { BaseRenderEngine } from './BaseRenderEngine';
import { RenderEngineUtil } from '../../utils/RenderEngineUtil';
import { LabelType } from '../../data/enums/LabelType';
import produce from 'immer';
import { store as storeNF } from 'react-notifications-component';

export class PointRenderEngine extends BaseRenderEngine {
  private config: RenderEngineConfig = new RenderEngineConfig();

  // =================================================================================================================
  // STATE
  // =================================================================================================================

  private transformInProgress: boolean = false;

  public constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.labelType = LabelType.POINT;
  }

  // =================================================================================================================
  // EVENT HANDLERS
  // =================================================================================================================

  public mouseDownHandler(data: EditorData): void {
    const isMouseOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
    const isMouseOverCanvas: boolean = RenderEngineUtil.isMouseOverCanvas(data);

    if (isMouseOverCanvas) {
      const labelPoint: LabelPoint = this.getLabelPointUnderMouse(data.mousePositionOnCanvas, data);
      if (!!labelPoint) {
        const pointOnCanvas: IPoint = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoint.point, data);
        const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointOnCanvas);
        const handleRect: IRect = RectUtil.getRectWithCenterAndSize(pointBetweenPixels, this.config.anchorHoverSize);
        if (RectUtil.isPointInside(handleRect, data.mousePositionOnCanvas)) {
          store.dispatch(updateActiveLabelId(labelPoint.id));
          this.transformInProgress = true;
          return;
        } else {
          store.dispatch(updateActiveLabelId(null));
          const pointOnImage: IPoint = RenderEngineUtil.transferPointFromViewPortContentToImage(
            data.mousePositionOnCanvas,
            data
          );
          this.addPointLabel(pointOnImage);
        }
      } else if (isMouseOverImage) {
        const pointOnImage: IPoint = RenderEngineUtil.transferPointFromViewPortContentToImage(data.mousePositionOnCanvas, data);
        this.addPointLabel(pointOnImage);
      }
    }
  }

  public mouseUpHandler(data: EditorData): void {
    if (this.isInProgress()) {
      const activeLabelPoint: LabelPoint = EditorSelector.getActivePointLabel();
      const pointSnapped: IPoint = RectUtil.snapPointToRect(data.mousePositionOnCanvas, data.activeImageRectOnCanvas);
      const pointOnImage: IPoint = RenderEngineUtil.transferPointFromViewPortContentToImage(pointSnapped, data);
      const imageData = EditorSelector.getActiveImageData();
      const activeGroupIndex = EditorSelector.getActiveGroupIndex();
      const newImageData = produce(imageData, draft => {
        draft.groupList[activeGroupIndex].labelPoints = imageData.groupList[activeGroupIndex].labelPoints.map(
          (labelPoint: LabelPoint) => {
            if (activeLabelPoint && labelPoint.id === activeLabelPoint.id) {
              return {
                ...labelPoint,
                point: pointOnImage,
              };
            }
            return labelPoint;
          }
        );
        draft.modified = true;
      });
      // const newImageData = produce(imageData, draft => {
      //   draft.groupList[activeGroupIndex].labelPoints.push(labelPoint);
      //   draft.modified = true;
      // });
      // //
      localStorage.setItem(newImageData.fileData.name.split('.').shift(), JSON.stringify(newImageData));
      store.dispatch(updateImageDataById(imageData.id, newImageData));
    }
    this.transformInProgress = false;
  }

  public mouseMoveHandler(data: EditorData): void {
    const isOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
    if (isOverImage) {
      const labelPoint: LabelPoint = this.getLabelPointUnderMouse(data.mousePositionOnCanvas, data);
      if (!!labelPoint) {
        if (EditorSelector.getHighlightedLabelId() !== labelPoint.id) {
          store.dispatch(updateHighlightedLabelId(labelPoint.id));
        }
      } else {
        if (EditorSelector.getHighlightedLabelId() !== null) {
          store.dispatch(updateHighlightedLabelId(null));
        }
      }
    }
  }

  // =================================================================================================================
  // RENDERING
  // =================================================================================================================

  public render(data: EditorData): void {
    if (!data.activeImageRectOnCanvas) {
      return;
    }
    const activeLabelId: string = EditorSelector.getActiveLabelId();
    const highlightedLabelId: string = EditorSelector.getHighlightedLabelId();
    const imageData: ImageData = EditorSelector.getActiveImageData();
    if (imageData) {
      const activeGroupIndex = EditorSelector.getActiveGroupIndex();
      imageData.groupList[activeGroupIndex].labelPoints.forEach((labelPoint: LabelPoint) => {
        if (labelPoint.id === activeLabelId) {
          if (this.isInProgress()) {
            const pointSnapped: IPoint = RectUtil.snapPointToRect(
              data.mousePositionOnCanvas,
              data.activeImageRectOnCanvas
            );
            const pointBetweenPixels: IPoint = RenderEngineUtil.setPointBetweenPixels(pointSnapped);
            const handleRect: IRect = RectUtil.getRectWithCenterAndSize(pointBetweenPixels, this.config.anchorSize);
            DrawUtil.drawRectWithFill(this.canvas, handleRect, this.config.activeAnchorColor);
          } else {
            this.renderPoint(labelPoint, true, data);
          }
        } else {
          this.renderPoint(labelPoint, labelPoint.id === activeLabelId || labelPoint.id === highlightedLabelId, data);
        }
      });
    }
    this.updateCursorStyle(data);
  }

  private renderPoint(labelPoint: LabelPoint, isActive: boolean, data: EditorData) {
    const pointOnImage: IPoint = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoint.point, data);
    const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointOnImage);
    const handleRect: IRect = RectUtil.getRectWithCenterAndSize(pointBetweenPixels, this.config.anchorSize);
    const handleColor: string = isActive ? this.config.activeAnchorColor : this.config.inactiveAnchorColor;
    DrawUtil.drawRectWithFill(this.canvas, handleRect, handleColor);
  }

  private updateCursorStyle(data: EditorData) {
    if (!!this.canvas && !!data.mousePositionOnCanvas) {
      const labelPoint: LabelPoint = this.getLabelPointUnderMouse(data.mousePositionOnCanvas, data);
      if (!!labelPoint) {
        const pointOnCanvas: IPoint = RenderEngineUtil.transferPointFromImageToCanvas(labelPoint.point, data);
        const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointOnCanvas);
        const handleRect: IRect = RectUtil.getRectWithCenterAndSize(pointBetweenPixels, this.config.anchorHoverSize);
        if (RectUtil.isPointInside(handleRect, data.mousePositionOnCanvas)) {
          store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
          return;
        }
      } else if (this.isInProgress()) {
        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
        return;
      }

      if (RectUtil.isPointInside({ x: 0, y: 0, ...CanvasUtil.getSize(this.canvas) }, data.mousePositionOnCanvas)) {
        RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
        this.canvas.style.cursor = 'none';
      } else {
        this.canvas.style.cursor = 'default';
      }
    }
  }

  // =================================================================================================================
  // HELPERS
  // =================================================================================================================

  public isInProgress(): boolean {
    return this.transformInProgress;
  }

  private getLabelPointUnderMouse(mousePosition: IPoint, data: EditorData): LabelPoint {
    const activeGroupIndex = EditorSelector.getActiveGroupIndex();
    const labelPoints: LabelPoint[] = EditorSelector.getActiveImageData().groupList[activeGroupIndex].labelPoints;
    for (let i = 0; i < labelPoints.length; i++) {
      const pointOnCanvas: IPoint = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoints[i].point, data);
      const handleRect: IRect = RectUtil.getRectWithCenterAndSize(pointOnCanvas, this.config.anchorHoverSize);
      if (RectUtil.isPointInside(handleRect, mousePosition)) {
        return labelPoints[i];
      }
    }
    return null;
  }

  private addPointLabel = (point: IPoint) => {
    const activeLabelIndex = EditorSelector.getActiveLabelNameIndex();
    const activeGroupIndex = EditorSelector.getActiveGroupIndex();
    const imageData: ImageData = EditorSelector.getActiveImageData();
    // const imageDatas: ImageData[] =  EditorSelector.getImagesData();
    const existedLabelIndexs = EditorSelector.getAllPointLabelIndex();
    const labelsLength = EditorSelector.getLabelNameLength();

    const labelPoint: LabelPoint = {
      id: uuidv1(),
      labelIndex: activeLabelIndex,
      checked: false,
      point,
    };

    if (existedLabelIndexs.length === labelsLength) {
      storeNF.addNotification({
        message: '已经添加全部的关节',
        type: 'warning',
        insert: 'top',
        container: 'top-center',
        animationIn: ['animated', 'fadeIn'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 1000,
        },
      });
      return;
    }

    const newImageData = produce(imageData, draft => {
      draft.groupList[activeGroupIndex].labelPoints.push(labelPoint);
      draft.modified = true;
    });
    // //
    localStorage.setItem(newImageData.fileData.name.split('.').shift(), JSON.stringify(newImageData));
    store.dispatch(updateImageDataById(imageData.id, newImageData));
    store.dispatch(updateFirstLabelCreatedFlag(true));
    store.dispatch(updateActiveLabelId(labelPoint.id));
    store.dispatch(findNextAvailableLabelIndex());
  };
}
