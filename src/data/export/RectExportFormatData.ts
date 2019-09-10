import { ExportFormatType } from "../enums/ExportFormatType";
import { IExportFormat } from "../../interfaces/IExportFormat";

export const RectExportFormatData: IExportFormat[] = [
  {
    type: ExportFormatType.YOLO,
    label: "YOLO 格式的zip包",
  },
  {
    type: ExportFormatType.VOC,
    label: "XML 格式的zip包",
  },
  {
    type: ExportFormatType.CSV,
    label: "单一的CSV文件",
  },
];
