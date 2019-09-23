import React from "react";
import "./LabelsToolkit.scss";
import { ImageData } from "../../../../store/editor/types";
import {
  updateActiveLabelId,
  updateActiveLabelType,
  updateImageDataById,
  updateGroupList,
  updateActiveGroupIndex,
  deleteGroupList,
} from "../../../../store/editor/actionCreators";
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import { LabelType } from "../../../../data/enums/LabelType";
import { ProjectType } from "../../../../data/enums/ProjectType";
import { ISize } from "../../../../interfaces/ISize";
import classNames from "classnames";
import * as _ from "lodash";
import { ILabelToolkit, LabelToolkitData } from "../../../../data/info/LabelToolkitData";
import { Settings } from "../../../../settings/Settings";
import RectLabelsList from "../RectLabelsList/RectLabelsList";
import PointLabelsList from "../PointLabelsList/PointLabelsList";
import PolygonLabelsList from "../PolygonLabelsList/PolygonLabelsList";
import { ContextManager } from "../../../../logic/context/ContextManager";
import { ContextType } from "../../../../data/enums/ContextType";
import Scrollbars from "react-custom-scrollbars";
import { GroupType } from "../../../../store/editor/types";
import { EditorSelector } from "../../../../store/selectors/EditorSelector";
import { TextButton } from "../../../Common/TextButton/TextButton";

interface IProps {
  activeImageIndex: number;
  activeLabelType: LabelType;
  imagesData: ImageData[];
  projectType: ProjectType;
  groupList: GroupType[];
  activeGroupIndex: number;
  updateImageDataById: (id: string, newImageData: ImageData) => any;
  updateActiveLabelType: (activeLabelType: LabelType) => any;
  updateActiveLabelId: (highlightedLabelId: string) => any;
  updateGroupList: (groupName: string) => any;
  updateActiveGroupIndex: (groupIndex: number) => any;
  deleteGroupList: (groupIndex: number) => any;
}

interface IState {
  size: ISize;
  activeLabelType: LabelType;
}

class LabelsToolkit extends React.Component<IProps, IState> {
  private labelsToolkitRef: HTMLDivElement;
  private readonly tabs: LabelType[];

  constructor(props) {
    super(props);

    this.tabs = props.projectType === ProjectType.IMAGE_RECOGNITION ? [LabelType.NAME] : [LabelType.POINT];
    // : [LabelType.RECTANGLE, LabelType.POINT, LabelType.POLYGON];

    const activeTab: LabelType = props.activeLabelType ? props.activeLabelType : this.tabs[0];

    this.state = {
      size: null,
      activeLabelType: activeTab,
    };
    props.updateActiveLabelType(activeTab);
  }

  public componentDidMount(): void {
    this.updateToolkitSize();
    window.addEventListener("resize", this.updateToolkitSize);
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.updateToolkitSize);
  }

  private updateToolkitSize = () => {
    if (!this.labelsToolkitRef) return;

    const listBoundingBox = this.labelsToolkitRef.getBoundingClientRect();
    this.setState({
      size: {
        width: listBoundingBox.width,
        height: listBoundingBox.height,
      },
    });
  };

  private headerClickHandler = (activeTab: LabelType) => {
    this.setState({ activeLabelType: activeTab });
    this.props.updateActiveLabelType(activeTab);
    this.props.updateActiveLabelId(null);
  };

  private renderChildren = (currentGroupIndex: number) => {
    const { activeLabelType, size } = this.state;
    const { activeImageIndex, imagesData, activeGroupIndex } = this.props;
    return this.tabs.reduce((children, labelType: LabelType, index: number) => {
      const isActive: boolean = labelType === activeLabelType && activeGroupIndex === currentGroupIndex;
      const tabData: ILabelToolkit = _.find(LabelToolkitData, { labelType });
      // const activeTabContentHeight: number = size.height - this.tabs.length * Settings.TOOLKIT_TAB_HEIGHT_PX - 50 - 50;
      const activeTabContentHeight = 300;
      const getClassName = (baseClass: string) =>
        classNames(baseClass, {
          active: isActive,
        });

      const header = (
        <div
          key={"Header_" + index}
          className={getClassName("Header")}
          onClick={() => this.headerClickHandler(labelType)}
          style={{ height: Settings.TOOLKIT_TAB_HEIGHT_PX }}
        >
          <div className="Marker" />
          <div className="HeaderGroupWrapper">
            <img draggable={false} className="Ico" src={tabData.imageSrc} alt={tabData.imageAlt} />
            {tabData.headerText}
          </div>
          <div className="HeaderGroupWrapper">
            <img draggable={false} className="Arrow" src={"ico/down.png"} alt={"down_arrow"} />
          </div>
        </div>
      );

      const content = (
        <div
          key={"Content_" + index}
          className={getClassName("Content")}
          style={{ height: isActive ? activeTabContentHeight : 0 }}
        >
          {labelType === LabelType.RECTANGLE && (
            <RectLabelsList
              size={{
                width: size.width - 20,
                height: activeTabContentHeight - 20,
              }}
              imageData={imagesData[activeImageIndex]}
            />
          )}
          {labelType === LabelType.POINT && (
            <PointLabelsList
              size={{
                width: size.width - 20,
                height: activeTabContentHeight - 20,
              }}
              imageData={imagesData[activeImageIndex]}
            />
          )}
          {labelType === LabelType.POLYGON && (
            <PolygonLabelsList
              size={{
                width: size.width - 20,
                height: activeTabContentHeight - 20,
              }}
              imageData={imagesData[activeImageIndex]}
            />
          )}
        </div>
      );

      children.push([header, content]);
      return children;
    }, []);
  };

  private buttonOnClickHandle = () => {
    this.props.updateGroupList(`group-${this.props.groupList.length + 1}`);
  };
  private renderChildrenWrapper = () => {
    const { groupList, activeGroupIndex } = this.props;
    return groupList
      .map((groupName, idx) => (
        <div className="LabelsToolkitWrapper" key={`LabelsToolkitWrapper_` + idx}>
          <div
            className={idx === activeGroupIndex ? "active pDiv" : "pDiv"}
            onClick={() => {
              this.props.updateActiveGroupIndex(idx);
              this.headerClickHandler(this.state.activeLabelType);
            }}
          >
            {`person-` + idx}
            {idx !== activeGroupIndex ? (
              <TextButton
                label="删除"
                externalClassName="buttonClass"
                onClick={() => this.props.deleteGroupList(idx)}
              ></TextButton>
            ) : null}
          </div>
          {idx === activeGroupIndex && this.renderChildren(idx)}
        </div>
      ))
      .concat(
        <div className="addButton" key="button">
          <button style={{ width: "30%" }} onClick={this.buttonOnClickHandle}>
            添加 +{" "}
          </button>
        </div>
      );
  };
  public render() {
    return (
      <div
        className="LabelsToolkit"
        ref={ref => (this.labelsToolkitRef = ref)}
        onClick={() => ContextManager.switchCtx(ContextType.RIGHT_NAVBAR)}
      >
        <Scrollbars>{this.state.size && this.renderChildrenWrapper()}</Scrollbars>
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateImageDataById,
  updateActiveLabelType,
  updateActiveLabelId,
  updateGroupList,
  updateActiveGroupIndex,
  deleteGroupList,
};

const mapStateToProps = (state: AppState) => ({
  activeImageIndex: state.editor.activeImageIndex,
  activeLabelType: EditorSelector.getActiveLabelType(),
  imagesData: state.editor.imagesData,
  projectType: state.editor.projectType,
  groupList: EditorSelector.getActiveImageData().groupList,
  activeGroupIndex: EditorSelector.getActiveGroupIndex(),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelsToolkit);
