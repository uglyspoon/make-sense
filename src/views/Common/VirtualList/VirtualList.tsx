import React from 'react';
import { ISize } from '../../../interfaces/ISize';
import { IRect } from '../../../interfaces/IRect';
import Scrollbars from 'react-custom-scrollbars';
import { VirtualListUtil } from '../../../utils/VirtualListUtil';
import { IPoint } from '../../../interfaces/IPoint';
import { RectUtil } from '../../../utils/RectUtil';
import _ from 'lodash';
import { EditorActions } from '../../../logic/actions/EditorActions';
import { EditorSelector } from '../../../store/selectors/EditorSelector';
import { ImageData } from '../../../store/editor/types';
import {
  updateGroupList,
  updateActiveGroupIndex,
  updateLabelIndexByInfo,
  updateActiveImageIndex,
} from '../../../store/editor/actionCreators';
import { RenderEngineUtil } from '../../../utils/RenderEngineUtil';
import { EditorModel } from '../../../staticModels/EditorModel';

interface IProps {
  size: ISize;
  childCount: number;
  childSize: ISize;
  childRender: (index: number, isScrolling: boolean, isVisible: boolean, style: React.CSSProperties) => any;
  overScanHeight?: number;
}

interface IState {
  viewportRect: IRect;
  isScrolling: boolean;
}

export class VirtualList extends React.Component<IProps, IState> {
  private gridSize: ISize;
  private contentSize: ISize;
  private childAnchors: IPoint[];
  private scrollbars: Scrollbars;
  private loading: boolean;

  constructor(props) {
    super(props);
    this.state = {
      viewportRect: null,
      isScrolling: false,
    };
    this.loading = false;
  }

  public componentDidMount(): void {
    const { size, childSize, childCount } = this.props;
    this.calculate(size, childSize, childCount);
    this.setState({
      viewportRect: {
        x: 0,
        y: 0,
        width: this.props.size.width,
        height: this.props.size.height,
      },
    });
  }

  public componentWillUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): void {
    const { size, childSize, childCount } = nextProps;
    if (
      this.props.size.height !== size.height ||
      this.props.size.width !== size.width ||
      this.props.childCount !== childCount
    ) {
      this.calculate(size, childSize, childCount);
      this.setState({
        viewportRect: {
          x: this.scrollbars.getValues().scrollLeft,
          y: this.scrollbars.getValues().scrollTop,
          width: size.width,
          height: size.height,
        },
      });
    }
  }

  private calculate = (size: ISize, childSize: ISize, childCount: number) => {
    this.gridSize = VirtualListUtil.calculateGridSize(size, childSize, childCount);
    this.contentSize = VirtualListUtil.calculateContentSize(size, childSize, this.gridSize);
    this.childAnchors = VirtualListUtil.calculateAnchorPoints(size, childSize, childCount);
  };

  private getVirtualListStyle = (): React.CSSProperties => {
    return {
      position: 'relative',
      width: this.props.size.width,
      height: this.props.size.height,
    };
  };

  private getVirtualListContentStyle = (): React.CSSProperties => {
    return {
      width: this.contentSize.width,
      height: this.contentSize.height,
    };
  };

  private onScrollStart = () => {
    this.setState({ isScrolling: true });
  };

  private onScrollStop = () => {
    this.setState({ isScrolling: false });
    // this.onUpdate();
  };

  private onScroll = values => {
    this.setState({
      viewportRect: {
        x: values.scrollLeft,
        y: values.scrollTop,
        width: this.props.size.width,
        height: this.props.size.height,
      },
    });
  };

  private getChildren = () => {
    const { viewportRect, isScrolling } = this.state;
    const { overScanHeight, childSize } = this.props;
    const overScan: number = !!overScanHeight ? overScanHeight : 0;

    const viewportRectWithOverScan: IRect = {
      x: viewportRect.x,
      y: viewportRect.y - overScan,
      width: viewportRect.width,
      height: viewportRect.height + 2 * overScan,
    };
    // let showImageIndexs: number[] = [];
    const result = this.childAnchors.reduce((children, anchor: IPoint, index: number) => {
      const childRect = Object.assign(anchor, childSize);
      const isVisible = RectUtil.intersect(viewportRectWithOverScan, childRect);

      if (isVisible) {
        const childStyle: React.CSSProperties = {
          position: 'absolute',
          left: anchor.x,
          top: anchor.y,
          width: childSize.width,
          height: childSize.height,
        };
        // showImageIndexs.push(index);
        return children.concat(this.props.childRender(index, isScrolling, isVisible, childStyle));
      } else {
        return children;
      }
    }, []);
    // if (showImageIndexs && !_.isEqual(showImageIndexs, (window as any).showImageIndexs)) {
    //   console.log(showImageIndexs, (window as any).showImageIndexs, '(window as any).showImageIndexs');
    //   (window as any).showImageIndexs = showImageIndexs;
    // }

    return result;
  };
  // private onUpdate = () => {
  //   const imagesData = EditorSelector.getImagesData();
  //   const activeImageIndex = EditorSelector.getActiveImageIndex();
  //   if (this.state.isScrolling) {
  //     return;
  //   }
  //   setTimeout(() => {
  //     localStorage.setItem(
  //       'offsetHeight',
  //       (document.getElementsByClassName('TopNavigationBar')[0] as any).offsetHeight
  //     );
  //     localStorage.setItem(
  //       'offsetWidth',
  //       (document.getElementsByClassName('SideNavigationBar left')[0] as any).offsetWidth
  //     );
  //     const editorData = EditorActions.getEditorData();
  //     const offsetWidth = localStorage.getItem('offsetWidth');
  //     const offsetHeight = localStorage.getItem('offsetHeight');
  //     const newIndexs: number[] = [];
  //     [].slice
  //       .call(document.getElementsByClassName('ImagePreview'))
  //       .forEach(r => newIndexs.push(+r.getAttribute('data-index')));
  //     // const showImageIndexs: number[] = (window as any).showImageIndexs || [];
  //     const showImagesData = imagesData.filter((itme, idx) => newIndexs.includes(idx));
  //     showImagesData.forEach((imageData, imageIndex) => {
  //       const localData: ImageData = JSON.parse(localStorage.getItem(imageData.fileData.name));
  //       // updateActiveImageIndex(imageIndex);
  //       const evt_click = new MouseEvent('click', {
  //         bubbles: true,
  //         view: window,
  //       });
  //       document.querySelectorAll('.VirtualListContent .ImagePreview')[imageIndex].dispatchEvent(evt_click);
  //       if (localData) {
  //         localData.groupList.forEach((item, groupIndex) => {
  //           if (groupIndex !== 0) {
  //             updateGroupList(`person-${groupIndex}`);
  //             updateActiveGroupIndex(groupIndex);
  //           }
  //           item.labelPoints.forEach((labelPoint, labelPointIndex) => {
  //             const point = RenderEngineUtil.transferPointFromImageToCanvas(labelPoint.point, editorData);
  //             const evt_up = new MouseEvent('mouseup', {
  //               bubbles: true,
  //               view: window,
  //               clientX: point.x + +offsetWidth,
  //               clientY: point.y + +offsetHeight,
  //             });
  //             const evt_down = new MouseEvent('mousedown', {
  //               bubbles: true,
  //               view: window,
  //               clientX: point.x + +offsetWidth,
  //               clientY: point.y + +offsetHeight,
  //             });
  //             EditorModel.canvas.dispatchEvent(evt_up);
  //             EditorModel.canvas.dispatchEvent(evt_down);
  //             updateLabelIndexByInfo(
  //               imageIndex,
  //               groupIndex,
  //               labelPointIndex,
  //               labelPoint.labelIndex,
  //               labelPoint.checked
  //             );
  //           });
  //         });
  //       }
  //     });
  //     //   updateActiveImageIndex(activeImageIndex);
  //   }, 1000);
  // };
  public render() {
    const displayContent = !!this.props.size && !!this.props.childSize && !!this.gridSize;

    return (
      <div className="VirtualList" style={this.getVirtualListStyle()}>
        <Scrollbars
          ref={ref => (this.scrollbars = ref)}
          onScrollFrame={this.onScroll}
          onScrollStart={this.onScrollStart}
          onScrollStop={this.onScrollStop}
          autoHide={true}
          //   onUpdate={this.onUpdate}
        >
          {displayContent && (
            <div className="VirtualListContent" style={this.getVirtualListContentStyle()}>
              {this.getChildren()}
            </div>
          )}
        </Scrollbars>
      </div>
    );
  }
}
