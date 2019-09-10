import React, { useState } from "react";
import "./InsertLabelNamesPopup.scss";
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import { PopupWindowType } from "../../../data/enums/PopupWindowType";
import { updateActiveLabelNameIndex, updateLabelNamesList } from "../../../store/editor/actionCreators";
import { updateActivePopupType } from "../../../store/general/actionCreators";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
import TextInput from "../../Common/TextInput/TextInput";
import { ImageButton } from "../../Common/ImageButton/ImageButton";
import uuidv1 from "uuid/v1";
import { PopupActions } from "../../../logic/actions/PopupActions";

interface IProps {
  updateActiveLabelNameIndex: (activeLabelIndex: number) => any;
  updateLabelNamesList: (labelNames: string[]) => any;
  updateActivePopupType: (activePopupType: PopupWindowType) => any;
}

const InsertLabelNamesPopup: React.FC<IProps> = ({
  updateActiveLabelNameIndex,
  updateLabelNamesList,
  updateActivePopupType,
}) => {
  const [labelNames, setLabelNames] = useState({});

  const addHandle = () => {
    const newLabelNames = { ...labelNames, [uuidv1()]: "" };
    setLabelNames(newLabelNames);
  };

  const deleteHandle = (key: string) => {
    const newLabelNames = { ...labelNames };
    delete newLabelNames[key];
    setLabelNames(newLabelNames);
  };

  const labelInputs = Object.keys(labelNames).map((key: string) => {
    return (
      <div className="LabelEntry" key={key}>
        <TextInput
          key={key}
          isPassword={false}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(key, event.target.value)}
          label={"标注名称"}
        />
        <ImageButton
          image={"ico/trash.png"}
          imageAlt={"remove_label"}
          size={{ width: 30, height: 30 }}
          onClick={() => deleteHandle(key)}
        />
      </div>
    );
  });

  const onChange = (key: string, value: string) => {
    const newLabelNames = { ...labelNames, [key]: value };
    setLabelNames(newLabelNames);
  };

  const onAccept = () => {
    const labelNamesList: string[] = extractLabelNamesList();
    if (labelNamesList.length > 0) {
      updateLabelNamesList(labelNamesList);
      PopupActions.close();
    }
  };

  const extractLabelNamesList = (): string[] => {
    const labelNameList: string[] = Object.values(labelNames).filter(value => !!value) as string[];
    // const defaultLabelList: string[] = [
    //   "头顶",
    //   "左手心",
    //   "右手心",
    //   "左脚跟",
    //   "左脚尖",
    //   "右脚跟",
    //   "右脚尖",
    // ];

    // return defaultLabelList.concat(labelNameList);
    return labelNameList;
  };

  const onReject = () => {
    updateActivePopupType(PopupWindowType.LOAD_LABEL_NAMES);
  };

  const renderContent = () => {
    return (
      <div className="InsertLabelNamesPopup">
        <div className="LeftContainer">
          <ImageButton
            image={"ico/plus.png"}
            imageAlt={"plus"}
            size={{ width: 40, height: 40 }}
            padding={25}
            onClick={addHandle}
          />
        </div>
        <div className="RightContainer">
          <div className="Message">在你开始之前，请创建一个即将用在你项目内的标签列表，点击左边的 + 号添加新标签</div>
          <div className="LabelsContainer">
            {Object.keys(labelNames).length !== 0 ? (
              <Scrollbars>
                <div className="InsertLabelNamesPopupContent">{labelInputs}</div>
              </Scrollbars>
            ) : (
              <div className="EmptyList" onClick={addHandle}>
                <img draggable={false} alt={"upload"} src={"img/type-writer.png"} />
                <p className="extraBold">当前项目标签列表为空</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <GenericYesNoPopup
      title={"创建标签列表"}
      renderContent={renderContent}
      acceptLabel={"开始标注"}
      onAccept={onAccept}
      disableAcceptButton={extractLabelNamesList().length === 0}
      rejectLabel={"从文件载入"}
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
)(InsertLabelNamesPopup);
