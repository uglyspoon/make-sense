import { ExportFormatType } from "../../data/enums/ExportFormatType";
import { IPoint } from "../../interfaces/IPoint";
import { VGGFileData, VGGObject, VGGRegionsData } from "../../data/VGG/JSON";
import { ImageData, LabelPolygon, GroupType, LabelPoint } from "../../store/editor/types";
import JSZip from "jszip";
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
    // const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    // try {
    //   saveAs(blob, `${ExporterUtil.getExportFileName()}.json`);
    // } catch (error) {
    //   // TODO
    //   throw new Error(error);
    // }
  }

  private static mapImagesDataToVGGObject(imagesData: ImageData[], labelNames: string[]): VGGObject {
    let zip = new JSZip();
    const res = imagesData.reduce((data: VGGObject, image: ImageData) => {
      const fileData: VGGFileData = AllLabelsExporter.mapImageDataToVGGFileData(image, labelNames);
      if (!!fileData) {
        // data[image.fileData.name] = fileData;
        // const fileName: string = image.fileData.name.replace(/\.[^/.]+$/, ".txt");
        zip.file(`${image.fileData.name}.json`, JSON.stringify(fileData));
      }
      return data;
    }, {});

    try {
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${ExporterUtil.getExportFileName()}.zip`);
      });
    } catch (error) {
      // TODO
      throw new Error(error);
    }
    return res
  }

  private static mapImageDataToVGGFileData(imageData: ImageData, labelNames: string[]): VGGFileData {
    let regionsDataArray: VGGRegionsData[][] = AllLabelsExporter.mapImageDataToVGG(imageData, labelNames);
    if (!regionsDataArray) return null;

    const orderArray: string[] = labelNames;
    const tempArray = [];
    regionsDataArray.forEach(item => {
      item = Object.values(item);
      orderArray.forEach((ele, idx) => {
        if (!item.some(r => r.label === ele)) {
          item.push({
            label: ele,
            type: "point",
            is_checked: null,
            all_points: null,
          });
        }
      });
      const temp = item.sort((a, b) => {
        return orderArray.indexOf(a.label as any) - orderArray.indexOf(b.label as any);
      });
      tempArray.push(temp);
    });

    const peopleDataArray = tempArray.map((personData, idx) => {
      let result = [];
      personData.forEach((item, idx) => {
        if (item.all_points) {
          result.push(item.all_points[0], item.all_points[1], item.is_checked);
        } else {
          result.push(-1, -1, -1);
        }
      });
      return {
        pose_keypoints_2d: result,
      };
    });
    return {
      // size: imageData.fileData.size,
      label_name: labelNames,
      width: (imageData.fileData as any).width,
      height: (imageData.fileData as any).height,
      // image_name: imageData.fileData.name,
      people: peopleDataArray,
    };
  }

  public static mapImageDataToVGG(imageData: ImageData, labelNames: string[]): VGGRegionsData[][] {
    if (
      !imageData.loadStatus ||
      !imageData.groupList[imageData.activeGroupIndex].labelPoints ||
      !imageData.groupList[imageData.activeGroupIndex].labelPoints.length ||
      !labelNames ||
      !labelNames.length
    )
      return null;

    // const validPolygonLabelsArray: Array<LabelPolygon[]> = AllLabelsExporter.getValidPolygonLabelsArray(imageData);

    // let polygonsData = [];
    // if (validPolygonLabelsArray.length) {
    //   polygonsData = validPolygonLabelsArray.map((validLabels: LabelPolygon[]) => {
    //     return validLabels.reduce((data: VGGRegionsData, label: LabelPolygon, index: number) => {
    //       data[`${index}`] = {
    //         all_points: AllLabelsExporter.mapPolygonToVGG(label.vertices),
    //         label: labelNames[label.labelIndex],
    //         is_checked: label.checked ? "1" : "0",
    //         type: "polygon",
    //       };
    //       return data;
    //     }, {});
    //   });
    // }

    const validPointLabelsArray: Array<LabelPoint[]> = AllLabelsExporter.getValidPointLabelsArray(imageData);
    let pointsData = [];
    if (validPointLabelsArray.length) {
      pointsData = validPointLabelsArray.map((validLabels: LabelPoint[]) => {
        return validLabels.reduce((data: VGGRegionsData, label: LabelPoint, index: number) => {
          data[`${index}`] = {
            all_points: [label.point.x, label.point.y],
            label: labelNames[label.labelIndex],
            is_checked: label.checked ? 1 : 0,
            type: "point",
          };
          return data;
        }, {});
      });
    }
    return pointsData;
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
