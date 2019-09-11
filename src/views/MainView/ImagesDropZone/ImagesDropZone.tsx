import React, { useEffect } from "react";
import "./ImagesDropZone.scss";
import { useDropzone } from "react-dropzone";
import { TextButton } from "../../Common/TextButton/TextButton";
import { ImageData } from "../../../store/editor/types";
import { connect } from "react-redux";
import { addImageData, updateActiveImageIndex, updateProjectType } from "../../../store/editor/actionCreators";
import { AppState } from "../../../store";
import { ProjectType } from "../../../data/enums/ProjectType";
import { FileUtil } from "../../../utils/FileUtil";
import { PopupWindowType } from "../../../data/enums/PopupWindowType";
import { updateActivePopupType } from "../../../store/general/actionCreators";
import { AcceptedFileType } from "../../../data/enums/AcceptedFileType";

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
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: AcceptedFileType.IMAGE,
  });

  const startEditor = (projectType: ProjectType) => {
    if (acceptedFiles.length > 0) {
      updateProjectType(projectType);
      updateActiveImageIndex(0);
      addImageData(acceptedFiles.map((fileData: File) => FileUtil.mapFileDataToImageData(fileData)));
      // updateActivePopupType(PopupWindowType.INSERT_LABEL_NAMES);
    }
  };

  const getDropZoneContent = () => {
    if (acceptedFiles.length === 0)
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} alt={"upload"} src={"img/box-opened.png"} />
          <p className="extraBold">拖拽图片至此</p>
          <p>或</p>
          <p className="extraBold">点击选取</p>
        </>
      );
    else if (acceptedFiles.length === 1)
      return (
        <>
          <img draggable={false} alt={"uploaded"} src={"img/box-closed.png"} />
          <p className="extraBold">已载入 1 张图片</p>
        </>
      );
    else
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} key={1} alt={"uploaded"} src={"img/box-closed.png"} />
          <p key={2} className="extraBold">
            已载入 {acceptedFiles.length} 张图片
          </p>
        </>
      );
  };

  return (
    <div className="ImagesDropZone">
      <div {...getRootProps({ className: "DropZone" })}>{getDropZoneContent()}</div>
      <div className="DropZoneButtons">
        {/* <TextButton label={"Image recognition"} isDisabled={true} onClick={() => {}} /> */}
        <TextButton
          label={"开始标记"}
          isDisabled={!acceptedFiles.length}
          onClick={() => startEditor(ProjectType.OBJECT_DETECTION)}
        />
      </div>
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
