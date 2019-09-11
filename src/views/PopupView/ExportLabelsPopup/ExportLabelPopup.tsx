import React, { useState } from "react";
import "./ExportLabelPopup.scss";
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import { ExportFormatType } from "../../../data/enums/ExportFormatType";
import { RectLabelsExporter } from "../../../logic/export/RectLabelsExporter";
import { LabelType } from "../../../data/enums/LabelType";
import { ImageButton } from "../../Common/ImageButton/ImageButton";
import { IExportFormat } from "../../../interfaces/IExportFormat";
import { AllExportFormatData } from "../../../data/export/AllExportFormatData";
import { PointExportFormatData } from "../../../data/export/PointExportFormatData";
import { PointLabelsExporter } from "../../../logic/export/PointLabelsExport";
import { AllLabelsExporter } from "../../../logic/export/AllLabelsExport";
import { PolygonExportFormatData } from "../../../data/export/PolygonExportFormatData";
import { PolygonLabelsExporter } from "../../../logic/export/PolygonLabelsExporter";
import { PopupActions } from "../../../logic/actions/PopupActions";
import { RectExportFormatData } from "../../../data/export/RectExportFormatData";

const ExportLabelPopup: React.FC = () => {
  const [exportLabelType, setExportLabelType] = useState(LabelType.ALL);
  const [exportFormatType, setExportFormatType] = useState(null);

  const onAccept = () => {
    if (!exportFormatType) return;
    switch (exportLabelType) {
      case LabelType.RECTANGLE:
        RectLabelsExporter.export(exportFormatType);
        break;
      case LabelType.POINT:
        PointLabelsExporter.export(exportFormatType);
        break;
      case LabelType.POLYGON:
        PolygonLabelsExporter.export(exportFormatType);
        break;
      case LabelType.ALL:
        AllLabelsExporter.export(exportFormatType);
        break;
    }
    PopupActions.close();
  };

  const onReject = () => {
    PopupActions.close();
  };

  const onSelect = (exportFormatType: ExportFormatType) => {
    setExportFormatType(exportFormatType);
  };

  const getOptions = (exportFormatData: IExportFormat[]) => {
    return exportFormatData.map((entry: IExportFormat) => {
      return (
        <div className="OptionsItem" onClick={() => onSelect(entry.type)} key={entry.type}>
          {entry.type === exportFormatType ? (
            <img draggable={false} src={"ico/checkbox-checked.png"} alt={"checked"} />
          ) : (
            <img draggable={false} src={"ico/checkbox-unchecked.png"} alt={"unchecked"} />
          )}
          {entry.label}
        </div>
      );
    });
  };

  const renderContent = () => {
    return (
      <div className="ExportLabelPopupContent">
        <div className="LeftContainer">
          <ImageButton
            image={"ico/all.png"}
            imageAlt={"all"}
            size={{ width: 40, height: 40 }}
            padding={20}
            onClick={() => {
              setExportLabelType(LabelType.ALL);
              setExportFormatType(null);
            }}
            isActive={exportLabelType === LabelType.ALL}
          />
          {/* <ImageButton
            image={"ico/rectangle.png"}
            imageAlt={"rectangle"}
            size={{ width: 40, height: 40 }}
            padding={20}
            onClick={() => {
              setExportLabelType(LabelType.RECTANGLE);
              setExportFormatType(null);
            }}
            isActive={exportLabelType === LabelType.RECTANGLE}
          />
          <ImageButton
            image={"ico/point.png"}
            imageAlt={"point"}
            size={{ width: 40, height: 40 }}
            padding={20}
            onClick={() => {
              setExportLabelType(LabelType.POINT);
              setExportFormatType(null);
            }}
            isActive={exportLabelType === LabelType.POINT}
          />
          <ImageButton
            image={"ico/polygon.png"}
            imageAlt={"polygon"}
            size={{ width: 40, height: 40 }}
            padding={20}
            onClick={() => {
              setExportLabelType(LabelType.POLYGON);
              setExportFormatType(null);
            }}
            isActive={exportLabelType === LabelType.POLYGON}
          /> */}
        </div>
        <div className="RightContainer">
          <div className="Message">选择标注类型和导出文件格式</div>
          <div className="Options">
            {exportLabelType === LabelType.ALL && getOptions(AllExportFormatData)}
            {exportLabelType === LabelType.RECTANGLE && getOptions(RectExportFormatData)}
            {exportLabelType === LabelType.POINT && getOptions(PointExportFormatData)}
            {exportLabelType === LabelType.POLYGON && getOptions(PolygonExportFormatData)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <GenericYesNoPopup
      title={"导出标注"}
      renderContent={renderContent}
      acceptLabel={"导出"}
      onAccept={onAccept}
      rejectLabel={"取消"}
      onReject={onReject}
    />
  );
};

const mapDispatchToProps = {};

const mapStateToProps = (state: AppState) => ({
  imagesData: state.editor.imagesData,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExportLabelPopup);
