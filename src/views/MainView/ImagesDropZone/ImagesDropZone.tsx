import React, { useEffect, useCallback, useRef } from 'react';
import './ImagesDropZone.scss';
import { useDropzone } from 'react-dropzone';
import uuidv1 from 'uuid/v1';
import { TextButton } from '../../Common/TextButton/TextButton';
import { ImageData } from '../../../store/editor/types';
import { connect } from 'react-redux';
import { addImageData, updateActiveImageIndex, updateProjectType } from '../../../store/editor/actionCreators';
import { AppState } from '../../../store';
import { ProjectType } from '../../../data/enums/ProjectType';
import { FileUtil } from '../../../utils/FileUtil';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { updateActivePopupType } from '../../../store/general/actionCreators';
import { AcceptedFileType } from '../../../data/enums/AcceptedFileType';
import _ from 'lodash';
import { store } from 'react-notifications-component';

interface IProps {
  updateActiveImageIndex: (activeImageIndex: number) => any;
  addImageData: (imageData: ImageData[]) => any;
  updateProjectType: (projectType: ProjectType) => any;
  updateActivePopupType: (activePopupType: PopupWindowType) => any;
}

const ImagesDropZone: React.FC<IProps> = ({
  updateActiveImageIndex,
  addImageData,
  updateProjectType,
  updateActivePopupType,
}) => {
  let inputRef = useRef<HTMLInputElement>();
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        var image = new Image();
        image.src = reader.result as any;
        image.onload = function (img) {
          file.width = (this as any).width;
          file.height = (this as any).height;
        };
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: AcceptedFileType.IMAGE,
    onDrop,
  });
  const onClickImport = () => {
    inputRef.current.click();
  };
  const handleChange = (files: File[]) => {
    [].slice.call(files).forEach(file => {
      // const imageName = file.name.replace('.json', '').split('_').shift()
      var reader = new FileReader();
      reader.onloadend = function (evt) {
        let jsonData = JSON.parse((evt.target as any).result);
        const imageName = file.name.split('_').shift();
        if (!imageName) {
          store.addNotification({
            title: '导入失败!',
            message: `${file.name}文件中找不到image_name字段`,
            type: 'danger',
            insert: 'top',
            container: 'top-center',
            animationIn: ['animated', 'fadeIn'],
            animationOut: ['animated', 'fadeOut'],
            dismiss: {
              duration: 5000,
              // onScreen: true,
            },
          });
          return;
        }
        // for (let imageName in jsonData) {
        //单json 多图片处理逻辑
        // }
        let saveImageData = {
          activeGroupIndex: 0,
          fileData: {},
          groupList: [],
          id: uuidv1(),
          loadStatus: false,
        };
        jsonData.people.forEach((groupData, groupIndex) => {
          let pointList = _.chunk(groupData.pose_keypoints_2d, 3);
          let labelPoints = [];
          for (let i in pointList) {
            if (pointList[i][2] === -1) {
              continue;
            }
            labelPoints.push({
              checked: pointList[i][2] < 0.3 ? true : false,
              id: uuidv1(),
              labelIndex: i,
              point: {
                x: pointList[i][0],
                y: pointList[i][1],
              },
            });
          }
          let groupTmp = {
            activeLabelId: uuidv1(),
            activeLabelNameIndex: 0,
            activeLabelType: 'POINT',
            firstLabelCreatedFlag: true,
            highlightedLabelId: null,
            labelPolygons: [],
            labelRects: [],
            labelPoints,
          };
          saveImageData.groupList.push(groupTmp);
        });
        localStorage.setItem(imageName, JSON.stringify(saveImageData));
        // startEditor(ProjectType.OBJECT_DETECTION);
      };
      reader.readAsText(file);
    });
    store.addNotification({
      title: '导入成功!',
      message: '可以继续导入或者开始标记',
      type: 'success',
      insert: 'top',
      container: 'top-center',
      animationIn: ['animated', 'fadeIn'],
      animationOut: ['animated', 'fadeOut'],
      dismiss: {
        duration: 1000,
        // onScreen: true,
      },
    });
  };
  const startEditor = (projectType: ProjectType) => {
    if (acceptedFiles.length > 0) {
      addImageData(acceptedFiles.map((fileData: File) => FileUtil.mapFileDataToImageData(fileData)));
      updateActiveImageIndex(0);
      updateProjectType(projectType);
    }
  };

  const clearLocalStorge = () => {
    localStorage.clear();
    store.addNotification({
      // title: '!',
      message: '已清除所有缓存',
      type: 'success',
      insert: 'top',
      container: 'top-center',
      animationIn: ['animated', 'fadeIn'],
      animationOut: ['animated', 'fadeOut'],
      dismiss: {
        duration: 1000,
        // onScreen: true,
      },
    });
  };
  const getDropZoneContent = () => {
    if (acceptedFiles.length === 0)
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} alt={'upload'} src={'img/box-opened.png'} />
          <p className="extraBold">拖拽图片至此</p>
          <p>或</p>
          <p className="extraBold">点击选取</p>
        </>
      );
    else if (acceptedFiles.length === 1)
      return (
        <>
          <img draggable={false} alt={'uploaded'} src={'img/box-closed.png'} />
          <p className="extraBold">已载入 1 张图片</p>
        </>
      );
    else
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} key={1} alt={'uploaded'} src={'img/box-closed.png'} />
          <p key={2} className="extraBold">
            已载入 {acceptedFiles.length} 张图片
          </p>
        </>
      );
  };
  return (
    <div className="ImagesDropZone">
      <div {...getRootProps({ className: 'DropZone' })}>{getDropZoneContent()}</div>
      <div className="DropZoneButtons">
        <TextButton
          label={'导入标记'}
          // isDisabled={!acceptedFiles.length}
          onClick={() => onClickImport()}
          style={{ marginRight: 10 }}
        />
        <TextButton
          label={'开始标记'}
          isDisabled={!acceptedFiles.length}
          onClick={() => startEditor(ProjectType.OBJECT_DETECTION)}
        />
      </div>
      <div className="DropZoneButtons">
        <TextButton label={'清除缓存'} style={{ marginTop: 10 }} onClick={() => clearLocalStorge()} />
      </div>
      <input
        type="file"
        style={{ display: 'none' }}
        ref={inputRef}
        accept="application/json"
        onChange={(e: any) => handleChange(e.target.files)}
        multiple
      />
    </div>
  );
};

const mapDispatchToProps = {
  updateActiveImageIndex,
  addImageData,
  updateProjectType,
  updateActivePopupType,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagesDropZone);
