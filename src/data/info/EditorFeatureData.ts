export interface IEditorFeature {
  displayText: string;
  imageSrc: string;
  imageAlt: string;
}

export const EditorFeatureData: IEditorFeature[] = [
  {
    displayText: "不需要额外安装，仅仅打开浏览器就可以开始工作",
    imageSrc: "img/online.png",
    imageAlt: "online",
  },
  {
    displayText: "我们不存储你的图片",
    imageSrc: "img/private.png",
    imageAlt: "private",
  },
  {
    displayText: "支持点、矩形、多边形标注",
    imageSrc: "img/labels.png",
    imageAlt: "labels",
  },
  {
    displayText: "支持导出标注数据",
    imageSrc: "img/file.png",
    imageAlt: "file",
  },
  {
    displayText: "支持裁剪和调整大小",
    imageSrc: "img/crop.png",
    imageAlt: "crop",
  },
];
