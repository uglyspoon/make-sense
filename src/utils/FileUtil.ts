import uuidv1 from 'uuid/v1';
import { ImageData } from '../store/editor/types';

export class FileUtil {
  public static mapFileDataToImageData(fileData: File): ImageData {
    if (JSON.parse(localStorage.getItem(fileData.name.split('.').shift()))) {
      var newfileData = JSON.parse(localStorage.getItem(fileData.name.split('.').shift()));
      newfileData.fileData = fileData;
      newfileData.loadStatus = false;
      // newfileData.groupList.forEach((item, idx) => {
      //   item.firstLabelCreatedFlag = false;
      //   // newfileData.groupList[idx].labelPoints = [];
      // });
      // console.log(newfileData);
      return newfileData;
    }
    return {
      id: uuidv1(),
      fileData: fileData,
      loadStatus: false,
      activeGroupIndex: 0,
      groupList: [
        {
          labelRects: [],
          labelPoints: [],
          labelPolygons: [],
          activeLabelNameIndex: 0,
          activeLabelType: null,
          activeLabelId: null,
          highlightedLabelId: null,
          firstLabelCreatedFlag: false,
        },
      ],
    };
  }

  public static loadImage(
    fileData: File,
    onSuccess: (image: HTMLImageElement) => any,
    onFailure: () => any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(fileData);
      const image = new Image();
      image.src = url;
      image.onload = () => {
        onSuccess(image);
        resolve();
      };
      image.onerror = () => {
        onFailure();
        reject();
      };
    });
  }

  public static loadLabelsList(fileData: File, onSuccess: (labels: string[]) => any, onFailure: () => any) {
    const reader = new FileReader();
    reader.readAsText(fileData);
    reader.onloadend = function (evt: any) {
      const contents: string = evt.target.result;
      onSuccess(contents.split(/[\r\n]/));
    };
    reader.onerror = () => onFailure();
  }
}
