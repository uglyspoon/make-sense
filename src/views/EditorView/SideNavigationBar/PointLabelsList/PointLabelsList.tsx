import React from "react";
import { ISize } from "../../../../interfaces/ISize";
import Scrollbars from "react-custom-scrollbars";
import { ImageData, LabelPoint } from "../../../../store/editor/types";
import "./PointLabelsList.scss";
import {
  updateActiveLabelId,
  updateActiveLabelNameIndex,
  updateImageDataById,
  findNextAvailableLabelIndex,
} from "../../../../store/editor/actionCreators";
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import * as _ from "lodash";
import LabelInputField from "../LabelInputField/LabelInputField";
import EmptyLabelList from "../EmptyLabelList/EmptyLabelList";
import { EditorSelector } from "../../../../store/selectors/EditorSelector";
import produce from "immer";

interface IProps {
  size: ISize;
  imageData: ImageData;
  updateImageDataById: (id: string, newImageData: ImageData) => any;
  activeLabelId: string;
  highlightedLabelId: string;
  updateActiveLabelNameIndex: (activeLabelIndex: number) => any;
  labelNames: string[];
  updateActiveLabelId: (activeLabelId: string) => any;
  findNextAvailableLabelIndex: () => any;
}

const PointLabelsList: React.FC<IProps> = ({
  size,
  imageData,
  updateImageDataById,
  labelNames,
  updateActiveLabelNameIndex,
  activeLabelId,
  highlightedLabelId,
  updateActiveLabelId,
  findNextAvailableLabelIndex,
}) => {
  const labelPoints = EditorSelector.getActiveImageData().groupList[EditorSelector.getActiveGroupIndex()].labelPoints;
  const labelInputFieldHeight = 40;
  const listStyle: React.CSSProperties = {
    width: size.width,
    height: size.height,
  };
  const listStyleContent: React.CSSProperties = {
    width: size.width,
    height: labelPoints.length * labelInputFieldHeight,
  };

  const deletePointLabelById = (labelPointId: string) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelPoints = labelPoints.filter((currentLabel: LabelPoint) => {
        return currentLabel.id !== labelPointId;
      });
    });
    updateImageDataById(imageData.id, newImageData);
    findNextAvailableLabelIndex();
  };

  const checkPointLabelById = (labelPointId: string) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelPoints = labelPoints.map((currentLabel: LabelPoint) => {
        return currentLabel.id !== labelPointId ? currentLabel : { ...currentLabel, checked: !currentLabel.checked };
      });
    });
    updateImageDataById(imageData.id, newImageData);
  };

  const updatePointLabel = (labelPointId: string, labelNameIndex: number) => {
    let alreadyFlag: boolean = false;
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelPoints = labelPoints.map((currentLabel: LabelPoint) => {
        if (currentLabel.id === labelPointId) {
          const alreadyHasIndex = draft.groupList[imageData.activeGroupIndex].labelPoints.some(
            ele => ele.labelIndex === labelNameIndex
          );
          if (alreadyHasIndex) {
            // console.log("labelNameIndex", labelNameIndex);
            alert("已经标记过这个部位了");
            alreadyFlag = true;
            return currentLabel;
          }
          return {
            ...currentLabel,
            labelIndex: labelNameIndex,
          };
        }
        return currentLabel;
      });
    });
    updateImageDataById(imageData.id, newImageData);
    !alreadyFlag && updateActiveLabelNameIndex(labelNameIndex);
  };

  const onClickHandler = () => {
    updateActiveLabelId(null);
  };

  const getChildren = () => {
    return labelPoints.map((labelPoint: LabelPoint, labelIndex: number) => {
      return (
        <LabelInputField
          size={{
            width: size.width,
            height: labelInputFieldHeight,
          }}
          isActive={labelPoint.id === activeLabelId}
          isHighlighted={labelPoint.id === highlightedLabelId}
          id={labelPoint.id}
          key={labelPoint.id}
          onDelete={deletePointLabelById}
          value={labelPoint.labelIndex !== null ? labelNames[labelPoint.labelIndex] : null}
          options={labelNames}
          onSelectLabel={updatePointLabel}
          onCheck={checkPointLabelById}
          checked={labelPoint.checked}
          index={labelIndex}
        />
      );
    });
  };

  return (
    <div className="PointLabelsList" style={listStyle} onClickCapture={onClickHandler}>
      {labelPoints.length === 0 ? (
        <EmptyLabelList labelBefore={"标记第一个点"} labelAfter={"这张图片还没有标注"} />
      ) : (
        <Scrollbars>
          <div className="PointLabelsListContent" style={listStyleContent}>
            {getChildren()}
          </div>
        </Scrollbars>
      )}
    </div>
  );
};

const mapDispatchToProps = {
  updateImageDataById,
  updateActiveLabelNameIndex,
  updateActiveLabelId,
  findNextAvailableLabelIndex,
};

const mapStateToProps = (state: AppState) => {
  return {
    activeLabelId: EditorSelector.getActiveLabelId(),
    highlightedLabelId: EditorSelector.getHighlightedLabelId(),
    labelNames: state.editor.labelNames,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PointLabelsList);
