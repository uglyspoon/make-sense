import { LabelType } from "../enums/LabelType";

export interface ILabelToolkit {
  labelType: LabelType;
  headerText: string;
  imageSrc: string;
  imageAlt: string;
}

export const LabelToolkitData: ILabelToolkit[] = [
  {
    labelType: LabelType.NAME,
    headerText: "图像识别",
    imageSrc: "ico/object.png",
    imageAlt: "object",
  },
  {
    labelType: LabelType.RECTANGLE,
    headerText: "矩形",
    imageSrc: "ico/rectangle.png",
    imageAlt: "rectangle",
  },
  {
    labelType: LabelType.POINT,
    headerText: "点",
    imageSrc: "ico/point.png",
    imageAlt: "point",
  },
  {
    labelType: LabelType.POLYGON,
    headerText: "多边形",
    imageSrc: "ico/polygon.png",
    imageAlt: "polygon",
  },
];
