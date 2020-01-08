import React from 'react';
import { connect } from 'react-redux';
import { LabelType } from '../../../../data/enums/LabelType';
import { ISize } from '../../../../interfaces/ISize';
import { AppState } from '../../../../store';
import {
  updateActiveImageIndex,
  updateActiveLabelId,
  updateActiveLabelType,
  updateGroupList,
  updateActiveGroupIndex,
  updateLabelIndexByInfo,
  addImageData
} from '../../../../store/editor/actionCreators';
import { ImageData } from '../../../../store/editor/types';
import VirtualList from '../../../Common/VirtualList/VirtualList';
import ImagePreview from '../ImagePreview/ImagePreview';
import './ImagesList.scss';
import { ContextManager } from '../../../../logic/context/ContextManager';
import { ContextType } from '../../../../data/enums/ContextType';
import { EditorSelector } from '../../../../store/selectors/EditorSelector';
import { EditorActions } from '../../../../logic/actions/EditorActions';
import { RenderEngineUtil } from '../../../../utils/RenderEngineUtil';
import { EditorModel } from '../../../../staticModels/EditorModel';
import { useCookies, Cookies } from 'react-cookie';
import { postData, makeRequest } from '../../../../utils/HttpUtils';
import { store } from 'react-notifications-component';
import TextInput from '../../../Common/TextInput/TextInput';
import uuidv1 from 'uuid/v1';

interface IProps {
  activeImageIndex: number;
  imagesData: ImageData[];
  updateActiveImageIndex: (activeImageIndex: number) => any;
  updateActiveLabelId: (activeLabelId: string) => any;
  updateActiveLabelType: (activeLabelType: LabelType) => any;
  activeLabelType: LabelType;
  updateGroupList: (groupName: string) => any;
  updateActiveGroupIndex: (groupIndex: number) => any;
  updateLabelIndexByInfo: (
    imageIndex: number,
    groupIndex: number,
    labelPointIndex: number,
    labelIndex: number,
    checked: boolean
  ) => any;
  addImageData: (imageData: ImageData[]) => any;
}

interface IState {
  size: ISize;
  searchText: string;
}
const cookies = new Cookies()

class ImagesList extends React.Component<IProps, IState> {
  private imagesListRef: HTMLDivElement;

  constructor(props) {
    super(props);

    this.state = {
      size: null,
      searchText: '',
    };
  }

  public componentDidMount(): void {
    this.updateListSize();
    window.addEventListener('resize', this.updateListSize);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateListSize);
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
    //remote request
    const activeImageIndex = this.props.activeImageIndex;
    const data = {
      id: this.props.imagesData[activeImageIndex].fileData.name,
      point: JSON.stringify(this.props.imagesData[activeImageIndex].groupList),
    };

    postData('/mark/sign/mark', data).then(resJson => {
      if (resJson.status !== 200) {
        store.addNotification({
          title: '服务器保存出错,请联系开发人员 @tuguang , @chaihang',
          message: resJson.message,
          type: 'warning',
          insert: 'top',
          container: 'top-center',
          animationIn: ['animated', 'fadeIn'],
          animationOut: ['animated', 'fadeOut'],
          dismiss: {
            duration: 1000,
          },
        });
      } else {
        store.addNotification({
          message: '保存成功',
          type: 'success',
          insert: 'top',
          container: 'top-center',
          animationIn: ['animated', 'fadeIn'],
          animationOut: ['animated', 'fadeOut'],
          dismiss: {
            duration: 500,
          },
        });
        this.props.updateActiveImageIndex(index);
        this.props.updateActiveLabelType(this.props.activeLabelType);
        this.props.updateActiveLabelId(null);
      }
    });
  };

  private onChangeSearchText = (e) => {
    this.setState({
      searchText: e.target.value
    })
  }
  private importImagesDataFromHttp = (urlAry: any[]) => {
    const that = this
    let imagesData = [];
    let number = 0;
    urlAry.forEach(async (data, idx) => {
      console.log('idx', idx)
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
          console.log('number', number, urlAry.length)
          if (number === urlAry.length) {
            imagesData.sort(function (a, b) {
              return +a.fileData.name - +b.fileData.name;
            });
            that.props.addImageData(imagesData);
            // setIsLoaded(true);
            // that.setState({
            //   loading: false
            // })
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  private onSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    postData('/mark/sign/picList', {
      dir: cookies.get('dirName'), // 文件夹名称
      pageNo: +cookies.get('pageNo') + 1, // 分页参数
      pageSize: +cookies.get('pageSize'), // 分页参数
    }).then(resJson => {
      if (resJson.status === 200) {
        cookies.set('pageNo', +cookies.get('pageNo') + 1)
        if (resJson.data.rows.length < +cookies.get('pageSize')) {
          // this.setState({
          //   isCompleted: true
          // })
        } else {
          this.importImagesDataFromHttp(resJson.data.rows);
        }

      }
      this.setState({
        searchText: ''
      })
    });
  }

  private renderImagePreview = (
    index: number,
    isScrolling: boolean,
    isVisible: boolean,
    style: React.CSSProperties
  ) => {

    return (
      <ImagePreview
        key={index}
        index={index}
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
        <div className="SearchBox">
          <TextInput isPassword={false} key="SearchBoxInput" onChange={this.onChangeSearchText} />
          <span onClick={this.onSearch}>搜索</span>
        </div>
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
  updateActiveLabelType,
  updateLabelIndexByInfo,
  updateActiveGroupIndex,
  updateGroupList,
  addImageData
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
