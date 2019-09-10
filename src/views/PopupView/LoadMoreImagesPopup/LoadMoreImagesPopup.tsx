import React from "react";
import "./LoadMoreImagesPopup.scss";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import { addImageData } from "../../../store/editor/actionCreators";
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import { useDropzone } from "react-dropzone";
import { FileUtil } from "../../../utils/FileUtil";
import { ImageData } from "../../../store/editor/types";
import { AcceptedFileType } from "../../../data/enums/AcceptedFileType";
import { PopupActions } from "../../../logic/actions/PopupActions";

interface IProps {
  addImageData: (imageData: ImageData[]) => any;
}

const LoadMoreImagesPopup: React.FC<IProps> = ({ addImageData }) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: AcceptedFileType.IMAGE,
  });

  const onAccept = () => {
    if (acceptedFiles.length > 0) {
      addImageData(
        acceptedFiles.map((fileData: File) => FileUtil.mapFileDataToImageData(fileData))
      );
      PopupActions.close();
    }
  };

  const onReject = () => {
    PopupActions.close();
  };

  const getDropZoneContent = () => {
    if (acceptedFiles.length === 0)
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} alt={"upload"} src={"img/box-opened.png"} />
          <p className="extraBold">拖拽到这里</p>
          <p>或</p>
          <p className="extraBold">点击导入</p>
        </>
      );
    else if (acceptedFiles.length === 1)
      return (
        <>
          <img draggable={false} alt={"uploaded"} src={"img/box-closed.png"} />
          <p className="extraBold">导入了 1 张新图片 </p>
        </>
      );
    else
      return (
        <>
          <img draggable={false} key={1} alt={"uploaded"} src={"img/box-closed.png"} />
          <p key={2} className="extraBold">
            导入了 {acceptedFiles.length} 张新图片
          </p>
        </>
      );
  };

  const renderContent = () => {
    return (
      <div className="LoadMoreImagesPopupContent">
        <div {...getRootProps({ className: "DropZone" })}>{getDropZoneContent()}</div>
      </div>
    );
  };

  return (
    <GenericYesNoPopup
      title={"导入更多图片"}
      renderContent={renderContent}
      acceptLabel={"载入"}
      disableAcceptButton={acceptedFiles.length < 1}
      onAccept={onAccept}
      rejectLabel={"取消"}
      onReject={onReject}
    />
  );
};

const mapDispatchToProps = {
  addImageData,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadMoreImagesPopup);
