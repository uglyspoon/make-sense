import React from "react";
import { ISize } from "../../../../interfaces/ISize";
import Scrollbars from "react-custom-scrollbars";
import { ImageData, LabelPolygon } from "../../../../store/editor/types";
import "./PolygonLabelsList.scss";
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

const PolygonLabelsList: React.FC<IProps> = ({
  size,
  imageData,
  updateImageDataById,
  labelNames,
  updateActiveLabelNameIndex,
  activeLabelId,
  highlightedLabelId,
  updateActiveLabelId,
}) => {
  const labelPolygons = EditorSelector.getActiveImageData().groupList[EditorSelector.getActiveGroupIndex()]
    .labelPolygons;
  const labelInputFieldHeight = 40;
  const listStyle: React.CSSProperties = {
    width: size.width,
    height: size.height,
  };
  const listStyleContent: React.CSSProperties = {
    width: size.width,
    height: labelPolygons.length * labelInputFieldHeight,
  };

  const deletePolygonLabelById = (labelPolygonId: string) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelPolygons = labelPolygons.filter((currentLabel: LabelPolygon) => {
        return currentLabel.id !== labelPolygonId;
      });
    });
    updateImageDataById(imageData.id, newImageData);
  };

  const checkPolygonLabelById = (labelPolygonId: string) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelPolygons = labelPolygons.map((currentLabel: LabelPolygon) => {
        return currentLabel.id !== labelPolygonId ? currentLabel : { ...currentLabel, checked: !currentLabel.checked };
      });
    });
    updateImageDataById(imageData.id, newImageData);
  };

  const updatePolygonLabel = (labelPolygonId: string, labelNameIndex: number) => {
    const newImageData = produce(imageData, draft => {
      draft.groupList[imageData.activeGroupIndex].labelPolygons = labelPolygons.map((currentLabel: LabelPolygon) => {
        if (currentLabel.id === labelPolygonId) {
          return {
            ...currentLabel,
            labelIndex: labelNameIndex,
          };
        } else {
          return currentLabel;
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
    return labelPolygons.map((labelPolygon: LabelPolygon) => {
      return (
        <LabelInputField
          size={{
            width: size.width,
            height: labelInputFieldHeight,
          }}
          isActive={labelPolygon.id === activeLabelId}
          isHighlighted={labelPolygon.id === highlightedLabelId}
          id={labelPolygon.id}
          key={labelPolygon.id}
          onDelete={deletePolygonLabelById}
          value={labelPolygon.labelIndex !== null ? labelNames[labelPolygon.labelIndex] : null}
          options={labelNames}
          onSelectLabel={updatePolygonLabel}
          onCheck={checkPolygonLabelById}
          checked={labelPolygon.checked}
        />
      );
    });
  };

  return (
    <div className="PolygonLabelsList" style={listStyle} onClickCapture={onClickHandler}>
      {labelPolygons.length === 0 ? (
        <EmptyLabelList labelBefore={"Mark the first polygon"} labelAfter={"No labels created for this image"} />
      ) : (
        <Scrollbars>
          <div className="PolygonLabelsListContent" style={listStyleContent}>
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
)(PolygonLabelsList);
