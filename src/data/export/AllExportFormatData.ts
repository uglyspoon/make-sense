import { IExportFormat } from "../../interfaces/IExportFormat";
import { ExportFormatType } from "../enums/ExportFormatType";

export const AllExportFormatData: IExportFormat[] = [
  {
    type: ExportFormatType.JSON,
    label: "JSON格式文件",
  },
];
