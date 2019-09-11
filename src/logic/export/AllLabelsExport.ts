import { ExportFormatType } from "../../data/enums/ExportFormatType";
import { IPoint } from "../../interfaces/IPoint";
import { VGGFileData, VGGObject, VGGPolygon, VGGRegionsData } from "../../data/VGG/IVGG";
import { ImageData, LabelPolygon } from "../../store/editor/types";
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
    return imagesData.reduce((data: VGGObject, image: ImageData) => {
      const fileData: VGGFileData = AllLabelsExporter.mapImageDataToVGGFileData(image, labelNames);
      if (!!fileData) {
        data[image.fileData.name] = fileData;
      }
      return data;
    }, {});
  }

  private static mapImageDataToVGGFileData(imageData: ImageData, labelNames: string[]): VGGFileData {
    const regionsData: VGGRegionsData = AllLabelsExporter.mapImageDataToVGG(imageData, labelNames);
    if (!regionsData) return null;
    return {
      fileref: "",
      size: imageData.fileData.size,
      filename: imageData.fileData.name,
      base64_img_data: "",
      file_attributes: {},
      regions: regionsData,
    };
  }

  public static mapImageDataToVGG(imageData: ImageData, labelNames: string[]): VGGRegionsData {
    if (
      !imageData.loadStatus ||
      !imageData.groupList[imageData.activeGroupIndex].labelPolygons ||
      !imageData.groupList[imageData.activeGroupIndex].labelPolygons.length ||
      !labelNames ||
      !labelNames.length
    )
      return null;

    const validLabels: LabelPolygon[] = AllLabelsExporter.getValidPolygonLabels(imageData);

    if (!validLabels.length) return null;

    return validLabels.reduce((data: VGGRegionsData, label: LabelPolygon, index: number) => {
      data[`${index}`] = {
        shape_attributes: AllLabelsExporter.mapPolygonToVGG(label.vertices),
        region_attributes: {
          label: labelNames[label.labelIndex],
        },
      };
      return data;
    }, {});
  }

  public static getValidPolygonLabels(imageData: ImageData): LabelPolygon[] {
    return imageData.groupList[imageData.activeGroupIndex].labelPolygons.filter(
      (label: LabelPolygon) => label.labelIndex !== null && !!label.vertices.length
    );
  }

  public static mapPolygonToVGG(path: IPoint[]): VGGPolygon {
    if (!path || !path.length) return null;

    const all_points_x: number[] = path.map((point: IPoint) => point.x).concat(path[0].x);
    const all_points_y: number[] = path.map((point: IPoint) => point.y).concat(path[0].y);
    return {
      name: "polygon",
      all_points_x,
      all_points_y,
    };
  }
}
