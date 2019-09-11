import { store } from "../..";
import { ImageData, LabelPoint, LabelPolygon, LabelRect } from "../editor/types";
import _ from "lodash";
import { LabelType } from "../../data/enums/LabelType";

export class EditorSelector {
  public static getProjectName(): string {
    return store.getState().editor.projectName;
  }

  public static getLabelNames(): string[] {
    return store.getState().editor.labelNames;
  }

  public static getActiveImageIndex(): number {
    return store.getState().editor.activeImageIndex;
  }

  public static getActiveGroupIndex(): number {
    return store.getState().editor.imagesData[this.getActiveImageIndex()].activeGroupIndex;
  }

  public static getActiveLabelNameIndex(): number {
    return store.getState().editor.imagesData[this.getActiveImageIndex()].groupList[this.getActiveGroupIndex()]
      .activeLabelNameIndex;
  }

  public static getImagesData(): ImageData[] {
    return store.getState().editor.imagesData;
  }

  public static getActiveImageData(): ImageData | null {
    let activeImageIndex: number | null = EditorSelector.getActiveImageIndex();

    if (activeImageIndex === null) return null;

    let imagesData: ImageData[] = EditorSelector.getImagesData();
    return imagesData[activeImageIndex];
  }

  public static getActiveLabelId(): string | null {
    return store.getState().editor.imagesData[this.getActiveImageIndex()].groupList[this.getActiveGroupIndex()]
      .activeLabelId;
  }

  public static getHighlightedLabelId(): string | null {
    return store.getState().editor.imagesData[this.getActiveImageIndex()].groupList[this.getActiveGroupIndex()]
      .highlightedLabelId;
  }

  public static getActiveRectLabel(): LabelRect | null {
    let activeLabelId: string | null = EditorSelector.getActiveLabelId();
    let activeGroupIndex: number | null = EditorSelector.getActiveGroupIndex();

    if (activeLabelId === null) return null;

    return _.find(EditorSelector.getActiveImageData().groupList[activeGroupIndex].labelRects, { id: activeLabelId });
  }

  public static getActivePointLabel(): LabelPoint | null {
    let activeLabelId: string | null = EditorSelector.getActiveLabelId();
    let activeGroupIndex: number | null = EditorSelector.getActiveGroupIndex();

    if (activeLabelId === null) return null;

    return _.find(EditorSelector.getActiveImageData().groupList[activeGroupIndex].labelPoints, { id: activeLabelId });
  }

  public static getActivePolygonLabel(): LabelPolygon | null {
    let activeLabelId: string | null = EditorSelector.getActiveLabelId();
    let activeGroupIndex: number | null = EditorSelector.getActiveGroupIndex();

    if (activeLabelId === null) return null;

    return _.find(EditorSelector.getActiveImageData().groupList[activeGroupIndex].labelPolygons, { id: activeLabelId });
  }

  public static getActiveLabelType(): LabelType {
    return EditorSelector.getActiveImageData().groupList[EditorSelector.getActiveGroupIndex()].activeLabelType;
  }

  public static getFirstLabelCreatedFlag(): boolean {
    return EditorSelector.getActiveImageData().groupList[EditorSelector.getActiveGroupIndex()].firstLabelCreatedFlag;
  }
}
