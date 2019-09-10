import { IExportFormat } from "../../interfaces/IExportFormat";
import { ExportFormatType } from "../enums/ExportFormatType";

export const PolygonExportFormatData: IExportFormat[] = [
  {
    type: ExportFormatType.VGG_JSON,
    label: "VGG JSON格式文件",
  },
];
