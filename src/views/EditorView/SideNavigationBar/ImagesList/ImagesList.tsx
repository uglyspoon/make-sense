import React from "react";
import { connect } from "react-redux";
import { LabelType } from "../../../../data/enums/LabelType";
import { ISize } from "../../../../interfaces/ISize";
import { AppState } from "../../../../store";
import { updateActiveImageIndex, updateActiveLabelId } from "../../../../store/editor/actionCreators";
import { ImageData } from "../../../../store/editor/types";
import { VirtualList } from "../../../Common/VirtualList/VirtualList";
import ImagePreview from "../ImagePreview/ImagePreview";
import "./ImagesList.scss";
import { ContextManager } from "../../../../logic/context/ContextManager";
import { ContextType } from "../../../../data/enums/ContextType";
import { EditorSelector } from "../../../../store/selectors/EditorSelector";

interface IProps {
  activeImageIndex: number;
  imagesData: ImageData[];
  updateActiveImageIndex: (activeImageIndex: number) => any;
  updateActiveLabelId: (activeLabelId: string) => any;
  activeLabelType: LabelType;
}

interface IState {
  size: ISize;
}

class ImagesList extends React.Component<IProps, IState> {
  private imagesListRef: HTMLDivElement;

  constructor(props) {
    super(props);

    this.state = {
      size: null,
    };
  }

  public componentDidMount(): void {
    this.updateListSize();
    window.addEventListener("resize", this.updateListSize);
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.updateListSize);
  }

  private updateListSize = () => {
    if (!this.imagesListRef) return;

    const listBoundingBox = this.imagesListRef.getBoundingClientRect();
    this.setState({
      size: {
        width: listBoundingBox.width,
        height: listBoundingBox.height,
      },
    });
  };

  private onClickHandler = (index: number) => {
    this.props.updateActiveImageIndex(index);
    this.props.updateActiveLabelId(null);
  };

  private renderImagePreview = (
    index: number,
    isScrolling: boolean,
    isVisible: boolean,
    style: React.CSSProperties
  ) => {
    return (
      <ImagePreview
        key={index}
        style={style}
        size={{ width: 150, height: 150 }}
        isScrolling={isScrolling}
        isChecked={
          this.props.imagesData[index].groupList.some(item => item.labelRects.length > 0) ||
          this.props.imagesData[index].groupList.some(item => item.labelPoints.length > 0) ||
          this.props.imagesData[index].groupList.some(item => item.labelPolygons.length > 0)
        }
        imageData={this.props.imagesData[index]}
        onClick={() => this.onClickHandler(index)}
        isSelected={this.props.activeImageIndex === index}
      />
    );
  };

  public render() {
    const { size } = this.state;
    return (
      <div
        className="ImagesList"
        ref={ref => (this.imagesListRef = ref)}
        onClick={() => ContextManager.switchCtx(ContextType.LEFT_NAVBAR)}
      >
        {!!size && (
          <VirtualList
            size={size}
            childSize={{ width: 150, height: 150 }}
            childCount={this.props.imagesData.length}
            childRender={this.renderImagePreview}
            overScanHeight={200}
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateActiveImageIndex,
  updateActiveLabelId,
};

const mapStateToProps = (state: AppState) => ({
  activeImageIndex: state.editor.activeImageIndex,
  imagesData: state.editor.imagesData,
  activeLabelType:
    state.editor.imagesData[EditorSelector.getActiveImageIndex()].groupList[EditorSelector.getActiveGroupIndex()]
      .activeLabelType,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagesList);
