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
import { store } from 'react-notifications-component';
import uuidv1 from 'uuid/v1';
import { LabelType } from '../../../data/enums/LabelType';
import { RenderEngineUtil } from '../../../utils/RenderEngineUtil';
import { EditorModel } from '../../../staticModels/EditorModel';
import { postData, makeRequest } from '../../../utils/HttpUtils';
import { useCookies, Cookies } from 'react-cookie';
import { connect } from 'react-redux';
import {
  addImageData
} from '../../../store/editor/actionCreators';
interface IProps {
  size: ISize;
  childCount: number;
  childSize: ISize;
  childRender: (index: number, isScrolling: boolean, isVisible: boolean, style: React.CSSProperties) => any;
  overScanHeight?: number;
  addImageData: (imageData: ImageData[]) => any;
}

interface IState {
  viewportRect: IRect;
  isScrolling: boolean;
  loading: boolean;
  isCompleted: boolean;
}

// const [cookies , setCookie, removeCookie] = useCookies(['token']);
const cookies = new Cookies()


class VirtualList extends React.Component<IProps, IState> {
  private gridSize: ISize;
  private contentSize: ISize;
  private childAnchors: IPoint[];
  private scrollbars: Scrollbars;

  constructor(props) {
    super(props);
    this.state = {
      viewportRect: null,
      isScrolling: false,
      loading: false,
      isCompleted: false,
    };
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
    if (values.top === 1 && !this.state.isCompleted) {
      if (this.state.loading) {
        store.addNotification({
          title: '操作频率太快啦～请稍候',
          message: '图片正在加载中.....',
          type: 'warning',
          insert: 'top',
          container: 'top-center',
          animationIn: ['animated', 'fadeIn'],
          animationOut: ['animated', 'fadeOut'],
          dismiss: {
            duration: 1000,
            // onScreen: true,
          },
        });
        return
      }
      this.setState({
        loading: true
      })
      postData('/mark/sign/picList', {
        dir: cookies.get('dirName'), // 文件夹名称
        pageNo: +cookies.get('pageNo') + 1, // 分页参数
        pageSize: +cookies.get('pageSize'), // 分页参数
      }).then(resJson => {
        if (resJson.status === 200) {
          cookies.set('pageNo', +cookies.get('pageNo') + 1)
          if (resJson.data.rows.length < +cookies.get('pageSize')) {
            this.setState({
              isCompleted: true
            })
          } else {
            this.importImagesDataFromHttp(resJson.data.rows);
          }

        }
      });
    }
    this.setState({
      viewportRect: {
        x: values.scrollLeft,
        y: values.scrollTop,
        width: this.props.size.width,
        height: this.props.size.height,
      },
    });
  };

  private importImagesDataFromHttp = (urlAry: any[]) => {
    const that = this
    let imagesData = [];
    let number = 0;
    urlAry.forEach(async (data, idx) => {
      let blob = await makeRequest('get', data.url);
      var file = new File([blob as any], data.id);
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        var image = new Image();
        image.src = reader.result as any;
        image.onload = function (img) {
          (file as any).width = (this as any).width;
          (file as any).height = (this as any).height;
          const groupListData = data.point
            ? JSON.parse(data.point)
            : [
              {
                activeLabelNameIndex: 0,
                activeLabelType: LabelType.POINT,
                activeLabelId: null,
                highlightedLabelId: null,
                firstLabelCreatedFlag: false,
                labelRects: [],
                labelPoints: [],
                labelPolygons: [],
              },
            ];
          var tempImageData = {
            activeGroupIndex: 0,
            fileData: file,
            groupList: groupListData,
            id: uuidv1(),
            loadStatus: false,
          };
          imagesData.push(tempImageData);
          number++;
          if (number === urlAry.length) {
            imagesData.sort(function (a, b) {
              return +a.fileData.name - +b.fileData.name;
            });
            that.props.addImageData(imagesData);
            // setIsLoaded(true);
            that.setState({
              loading: false
            })
          }
        };
      };
      reader.readAsDataURL(file);
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

    return result;
  };

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


const mapDispatchToProps = {
  addImageData
};

export default connect(
  () => { },
  mapDispatchToProps
)(VirtualList);