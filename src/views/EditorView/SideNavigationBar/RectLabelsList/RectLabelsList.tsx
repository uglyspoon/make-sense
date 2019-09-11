import React from "react";
import { ISize } from "../../../../interfaces/ISize";
import Scrollbars from "react-custom-scrollbars";
import { ImageData, LabelRect } from "../../../../store/editor/types";
import "./RectLabelsList.scss";
import {
  updateActiveLabelId,
  updateActiveLabelNameIndex,
  updateImageDataById,
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
}

const RectLabelsList: React.FC<IProps> = ({
  size,
  imageData,
  updateImageDataById,
  labelNames,
  updateActiveLabelNameIndex,
  activeLabelId,
  highlightedLabelId,
  updateActiveLabelId,
}) => {
  const labelRects = EditorSelector.getActiveImageData().groupList[EditorSelector.getActiveGroupIndex()].labelRects;

  const labelInputFieldHeight = 40;
  const listStyle: React.CSSProperties = {
    width: size.width,
    height: size.height,
  };
  const listStyleContent: React.CSSProperties = {
    width: size.width,
    height: labelRects.length * labelInputFieldHeight,
  };

  const deleteRectLabelById = (labelRectId: string) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelRects = labelRects.filter((currentLabel: LabelRect) => {
        return currentLabel.id !== labelRectId;
      });
    });
    updateImageDataById(imageData.id, newImageData);
  };

  const checkRectLabelById = (labelRectId: string) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelRects = labelRects.map((currentLabel: LabelRect) => {
        return currentLabel.id !== labelRectId ? currentLabel : { ...currentLabel, checked: !currentLabel.checked };
      });
    });
    updateImageDataById(imageData.id, newImageData);
  };

  const updateRectLabel = (labelRectId: string, labelNameIndex: number) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelRects = labelRects.map((labelRect: LabelRect) => {
        if (labelRect.id === labelRectId) {
          return {
            ...labelRect,
            labelIndex: labelNameIndex,
          };
        } else {
          return labelRect;
        }
      });
    });
    updateImageDataById(imageData.id, newImageData);
    updateActiveLabelNameIndex(labelNameIndex);
  };

  const onClickHandler = () => {
    updateActiveLabelId(null);
  };

  const getChildren = () => {
    return labelRects.map((labelRect: LabelRect) => {
      return (
        <LabelInputField
          size={{
            width: size.width,
            height: labelInputFieldHeight,
          }}
          isActive={labelRect.id === activeLabelId}
          isHighlighted={labelRect.id === highlightedLabelId}
          id={labelRect.id}
          key={labelRect.id}
          onDelete={deleteRectLabelById}
          onCheck={checkRectLabelById}
          value={labelRect.labelIndex !== null ? labelNames[labelRect.labelIndex] : null}
          options={labelNames}
          onSelectLabel={updateRectLabel}
          checked={labelRect.checked}
        />
      );
    });
  };

  return (
    <div className="RectLabelsList" style={listStyle} onClickCapture={onClickHandler}>
      {labelRects.length === 0 ? (
        <EmptyLabelList labelBefore={"Draw the first rect"} labelAfter={"No labels created for this image"} />
      ) : (
        <Scrollbars>
          <div className="RectLabelsListContent" style={listStyleContent}>
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
};

const mapStateToProps = (state: AppState) => ({
  activeLabelId: EditorSelector.getActiveLabelId(),
  highlightedLabelId: EditorSelector.getHighlightedLabelId(),
  labelNames: state.editor.labelNames,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RectLabelsList);
