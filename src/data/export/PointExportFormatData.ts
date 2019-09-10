import { ExportFormatType } from "../enums/ExportFormatType";
import { IExportFormat } from "../../interfaces/IExportFormat";

export const PointExportFormatData: IExportFormat[] = [
  {
    type: ExportFormatType.CSV,
    label: "单一的CSV文件",
  },
];
