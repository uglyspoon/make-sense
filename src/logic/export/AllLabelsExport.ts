import { ExportFormatType } from "../../data/enums/ExportFormatType";
import { IPoint } from "../../interfaces/IPoint";
import { VGGFileData, VGGObject, VGGRegionsData } from "../../data/VGG/JSON";
import { ImageData, LabelPolygon, GroupType, LabelPoint } from "../../store/editor/types";
import { EditorSelector } from "../../store/selectors/EditorSelector";
import { saveAs } from "file-saver";
import { ExporterUtil } from "../../utils/ExporterUtil";

export class AllLabelsExporter {
  public static export(exportFormatType: ExportFormatType): void {
    switch (exportFormatType) {
      case ExportFormatType.JSON:
        AllLabelsExporter.exportAsJson();
        break;
      default:
        return;
    }
  }

  private static exportAsJson(): void {
    const imagesData: ImageData[] = EditorSelector.getImagesData();
    const labelNames: string[] = EditorSelector.getLabelNames();
    const content: string = JSON.stringify(AllLabelsExporter.mapImagesDataToVGGObject(imagesData, labelNames));
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    try {
      saveAs(blob, `${ExporterUtil.getExportFileName()}.json`);
    } catch (error) {
      // TODO
      throw new Error(error);
    }
  }

  private static mapImagesDataToVGGObject(imagesData: ImageData[], labelNames: string[]): VGGObject {
    console.log("imagesData", imagesData);
    return imagesData.reduce((data: VGGObject, image: ImageData) => {
      console.log("data", data, image, imagesData);
      const fileData: VGGFileData = AllLabelsExporter.mapImageDataToVGGFileData(image, labelNames);
      if (!!fileData) {
        data[image.fileData.name] = fileData;
      }
      return data;
    }, {});
  }

  private static mapImageDataToVGGFileData(imageData: ImageData, labelNames: string[]): VGGFileData {
    const regionsDataArray: VGGRegionsData[] = AllLabelsExporter.mapImageDataToVGG(imageData, labelNames);
    if (!regionsDataArray) return null;
    return {
      size: imageData.fileData.size,
      filename: imageData.fileData.name,
      key_points: regionsDataArray,
    };
  }

  public static mapImageDataToVGG(imageData: ImageData, labelNames: string[]): VGGRegionsData[] {
    if (
      !imageData.loadStatus ||
      !imageData.groupList[imageData.activeGroupIndex].labelPolygons ||
      !imageData.groupList[imageData.activeGroupIndex].labelPolygons.length ||
      !labelNames ||
      !labelNames.length
    )
      return null;

    const validPolygonLabelsArray: Array<LabelPolygon[]> = AllLabelsExporter.getValidPolygonLabelsArray(imageData);

    let polygonsData = [];
    if (validPolygonLabelsArray.length) {
      polygonsData = validPolygonLabelsArray.map((validLabels: LabelPolygon[]) => {
        return validLabels.reduce((data: VGGRegionsData, label: LabelPolygon, index: number) => {
          data[`${index}`] = {
            all_points: AllLabelsExporter.mapPolygonToVGG(label.vertices),
            label: labelNames[label.labelIndex],
            is_checked: label.checked ? "1" : "0",
            type: "polygon",
          };
          return data;
        }, {});
      });
    }

    const validPointLabelsArray: Array<LabelPoint[]> = AllLabelsExporter.getValidPointLabelsArray(imageData);
    let pointsData = [];
    if (validPointLabelsArray.length) {
      pointsData = validPointLabelsArray.map((validLabels: LabelPoint[]) => {
        return validLabels.reduce((data: VGGRegionsData, label: LabelPoint, index: number) => {
          data[`${index}`] = {
            all_points: `(${label.point.x}, ${label.point.y})`,
            label: labelNames[label.labelIndex],
            is_checked: label.checked ? "1" : "0",
            type: "point",
          };
          return data;
        }, {});
      });
    }

    return polygonsData.concat(pointsData);
  }

  public static getValidPolygonLabelsArray(imageData: ImageData): LabelPolygon[][] {
    return imageData.groupList.map((group: GroupType) => {
      return group.labelPolygons.filter((label: LabelPolygon) => label.labelIndex !== null && !!label.vertices.length);
    });
  }

  public static getValidPointLabelsArray(imageData: ImageData): LabelPoint[][] {
    return imageData.groupList.map((group: GroupType) => {
      return group.labelPoints.filter((label: LabelPoint) => label.labelIndex !== null && !!label.point);
    });
  }

  public static getValidPolygonLabels(imageData: ImageData): LabelPolygon[] {
    return imageData.groupList[imageData.activeGroupIndex].labelPolygons.filter(
      (label: LabelPolygon) => label.labelIndex !== null && !!label.vertices.length
    );
  }

  public static mapPolygonToVGG(path: IPoint[]): string[] {
    if (!path || !path.length) return null;
    const all_points: string[] = path
      .map((point: IPoint) => `(${point.x}, ${point.y})`)
      .concat(`(${path[0].x}, ${path[0].y})`);
    return all_points;
  }
}
