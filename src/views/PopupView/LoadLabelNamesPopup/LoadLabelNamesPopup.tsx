import React, { useState } from "react";
import "./LoadLabelNamesPopup.scss";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import {
  updateActiveLabelNameIndex,
  updateLabelNamesList,
} from "../../../store/editor/actionCreators";
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import { PopupWindowType } from "../../../data/enums/PopupWindowType";
import { updateActivePopupType } from "../../../store/general/actionCreators";
import { useDropzone } from "react-dropzone";
import { FileUtil } from "../../../utils/FileUtil";
import { AcceptedFileType } from "../../../data/enums/AcceptedFileType";
import { PopupActions } from "../../../logic/actions/PopupActions";

interface IProps {
  updateActiveLabelNameIndex: (activeLabelIndex: number) => any;
  updateLabelNamesList: (labelNames: string[]) => any;
  updateActivePopupType: (activePopupType: PopupWindowType) => any;
}

const LoadLabelNamesPopup: React.FC<IProps> = ({
  updateActiveLabelNameIndex,
  updateLabelNamesList,
  updateActivePopupType,
}) => {
  const [labelsList, setLabelsList] = useState([]);
  const [invalidFileLoadedStatus, setInvalidFileLoadedStatus] = useState(false);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: AcceptedFileType.TEXT,
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length === 1) {
        FileUtil.loadLabelsList(acceptedFiles[0], onSuccess, onFailure);
      }
    },
  });

  const onSuccess = (labelsList: string[]) => {
    setLabelsList(labelsList);
    setInvalidFileLoadedStatus(false);
  };

  const onFailure = () => {
    setInvalidFileLoadedStatus(true);
  };

  const onAccept = () => {
    if (labelsList.length > 0) {
      updateActiveLabelNameIndex(0);
      updateLabelNamesList(labelsList);
      PopupActions.close();
    }
  };

  const onReject = () => {
    updateActivePopupType(PopupWindowType.INSERT_LABEL_NAMES);
  };

  const getDropZoneContent = () => {
    if (invalidFileLoadedStatus)
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} alt={"upload"} src={"img/box-opened.png"} />
          <p className="extraBold">导入文件未成功！</p>
          <p className="extraBold">请再试一次</p>
        </>
      );
    else if (acceptedFiles.length === 0)
      return (
        <>
          <input {...getInputProps()} />
          <img draggable={false} alt={"upload"} src={"img/box-opened.png"} />
          <p className="extraBold">拖拽文件到这里</p>
          <p>或</p>
          <p className="extraBold">点击此处选择导入</p>
        </>
      );
    else if (labelsList.length === 1)
      return (
        <>
          <img draggable={false} alt={"uploaded"} src={"img/box-closed.png"} />
          <p className="extraBold">已导入了一个标签</p>
        </>
      );
    else
      return (
        <>
          <img draggable={false} alt={"uploaded"} src={"img/box-closed.png"} />
          <p className="extraBold"> 已导入了{labelsList.length}个标签</p>
        </>
      );
  };

  const renderContent = () => {
    return (
      <div className="LoadLabelsPopupContent">
        <div className="Message">
          选择一个你准备好的.txt格式的文本文件，注意每个标签应该另起一行
        </div>
        <div {...getRootProps({ className: "DropZone" })}>{getDropZoneContent()}</div>
      </div>
    );
  };

  return (
    <GenericYesNoPopup
      title={"导入标签列表文件"}
      renderContent={renderContent}
      acceptLabel={"开始"}
      onAccept={onAccept}
      disableAcceptButton={labelsList.length === 0}
      rejectLabel={"返回"}
      onReject={onReject}
    />
  );
};

const mapDispatchToProps = {
  updateActiveLabelNameIndex,
  updateLabelNamesList,
  updateActivePopupType,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadLabelNamesPopup);
