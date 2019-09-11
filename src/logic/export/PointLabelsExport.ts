import { ExportFormatType } from "../../data/enums/ExportFormatType";
import { ImageData, LabelPoint } from "../../store/editor/types";
import { saveAs } from "file-saver";
import { ImageRepository } from "../imageRepository/ImageRepository";
import { EditorSelector } from "../../store/selectors/EditorSelector";
import { ExporterUtil } from "../../utils/ExporterUtil";

export class PointLabelsExporter {
  public static export(exportFormatType: ExportFormatType): void {
    switch (exportFormatType) {
      case ExportFormatType.CSV:
        PointLabelsExporter.exportAsCSV();
        break;
      default:
        return;
    }
  }

  private static exportAsCSV(): void {
    const content: string = EditorSelector.getImagesData()
      .map((imageData: ImageData) => {
        return PointLabelsExporter.wrapRectLabelsIntoCSV(imageData);
      })
      .filter((imageLabelData: string) => {
        return !!imageLabelData;
      })
      .join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    try {
      saveAs(blob, `${ExporterUtil.getExportFileName()}.csv`);
    } catch (error) {
      // TODO
      throw new Error(error);
    }
  }

  private static wrapRectLabelsIntoCSV(imageData: ImageData): string {
    if (imageData.groupList[imageData.activeGroupIndex].labelPoints.length === 0 || !imageData.loadStatus) return null;

    const image: HTMLImageElement = ImageRepository.getById(imageData.id);
    const labelNamesList: string[] = EditorSelector.getLabelNames();
    const labelRectsString: string[] = imageData.groupList[imageData.activeGroupIndex].labelPoints.map(
      (labelPoint: LabelPoint) => {
        const labelFields = [
          labelNamesList[labelPoint.labelIndex],
          Math.round(labelPoint.point.x) + "",
          Math.round(labelPoint.point.y) + "",
          imageData.fileData.name,
          image.width + "",
          image.height + "",
        ];
        return labelFields.join(",");
      }
    );
    return labelRectsString.join("\n");
  }
}
