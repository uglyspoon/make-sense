import React from 'react';
import './Editor.scss';
import { ISize } from '../../../interfaces/ISize';
import { ImageData } from '../../../store/editor/types';
import { FileUtil } from '../../../utils/FileUtil';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { updateImageDataById } from '../../../store/editor/actionCreators';
import { ImageRepository } from '../../../logic/imageRepository/ImageRepository';
import { LabelType } from '../../../data/enums/LabelType';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { CanvasUtil } from '../../../utils/CanvasUtil';
import { CustomCursorStyle } from '../../../data/enums/CustomCursorStyle';
import { ImageLoadManager } from '../../../logic/imageRepository/ImageLoadManager';
import { EventType } from '../../../data/enums/EventType';
import { EditorData } from '../../../data/EditorData';
import { EditorModel } from '../../../staticModels/EditorModel';
import { EditorActions } from '../../../logic/actions/EditorActions';
import { EditorUtil } from '../../../utils/EditorUtil';
import { ContextManager } from '../../../logic/context/ContextManager';
import { ContextType } from '../../../data/enums/ContextType';
import { loadDataFromLocalStorge } from '../../../store/editor/actionCreators';

import { EditorSelector } from '../../../store/selectors/EditorSelector';
import produce from 'immer';
import { ViewPortActions } from '../../../logic/actions/ViewPortActions';
import Scrollbars from 'react-custom-scrollbars';
import { isEqual } from 'lodash';
import { PlatformModel } from '../../../staticModels/PlatformModel';

interface IProps {
  size: ISize;
  imageData: ImageData;
  activeLabelType: LabelType;
  updateImageDataById: (id: string, newImageData: ImageData) => any;
  activePopupType: PopupWindowType;
  activeLabelId: string;
  loadDataFromLocalStorge: () => any;
  customCursorStyle: CustomCursorStyle;
  imageDragMode: boolean;
  zoom: number;

}
interface IState {
  viewPortSize: ISize
}

class Editor extends React.Component<IProps, IState> {

  constructor(props) {
    super(props);
    this.state = {
      viewPortSize: {
        width: 0,
        height: 0
      },
    };
  }

  // =================================================================================================================
  // LIFE CYCLE
  // =================================================================================================================

  public componentDidMount(): void {
    this.mountEventListeners();

    const { imageData, activeLabelType } = this.props;
    ContextManager.switchCtx(ContextType.EDITOR);
    EditorActions.mountRenderEngines(activeLabelType);
    ImageLoadManager.addAndRun(this.loadImage(imageData));
  }

  public componentWillUnmount(): void {
    this.unmountEventListeners();
  }

  public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
    const { imageData, activeLabelType } = this.props;
    prevProps.imageData.id !== imageData.id && ImageLoadManager.addAndRun(this.loadImage(imageData));
    prevProps.activeLabelType !== activeLabelType && EditorActions.swapSupportRenderingEngine(activeLabelType);
    this.updateModelAndRender();
  }

  // =================================================================================================================
  // EVENT HANDLERS
  // =================================================================================================================

  private mountEventListeners() {
    window.addEventListener(EventType.MOUSE_MOVE, this.update);
    window.addEventListener(EventType.MOUSE_UP, this.update);
    EditorModel.canvas.addEventListener(EventType.MOUSE_DOWN, this.update);
    EditorModel.canvas.addEventListener(EventType.MOUSE_WHEEL, this.handleZoom);
  }

  private unmountEventListeners() {
    window.removeEventListener(EventType.MOUSE_MOVE, this.update);
    window.removeEventListener(EventType.MOUSE_UP, this.update);
    EditorModel.canvas.removeEventListener(EventType.MOUSE_DOWN, this.update);
    EditorModel.canvas.removeEventListener(EventType.MOUSE_WHEEL, this.handleZoom);
  }

  // =================================================================================================================
  // LOAD IMAGE
  // =================================================================================================================

  private loadImage = async (imageData: ImageData): Promise<any> => {
    if (imageData.loadStatus) {
      EditorActions.setActiveImage(ImageRepository.getById(imageData.id));
      this.updateModelAndRender();
    } else {
      if (!EditorModel.isLoading) {
        EditorActions.setLoadingStatus(true);
        const saveLoadedImagePartial = (image: HTMLImageElement) => this.saveLoadedImage(image, imageData);
        FileUtil.loadImage(imageData.fileData, saveLoadedImagePartial, this.handleLoadImageError);
      }
    }
  };

  private saveLoadedImage = (image: HTMLImageElement, imageData: ImageData) => {
    const newImageData = produce(imageData, draft => {
      draft.loadStatus = true;
    });
    this.props.updateImageDataById(imageData.id, newImageData);
    ImageRepository.store(newImageData.id, image);
    EditorActions.setActiveImage(image);
    EditorActions.setLoadingStatus(false);
    this.updateModelAndRender();
  };

  private handleLoadImageError = () => {
    console.log('handleLoadImageError');
  };

  // =================================================================================================================
  // HELPER METHODS
  // =================================================================================================================
  private updateModelAndRender = () => {
    ViewPortActions.updateViewPortSize();
    ViewPortActions.updateDefaultViewPortImageRect();
    ViewPortActions.resizeViewPortContent();

    // EditorActions.resizeCanvas(this.props.size);
    EditorActions.calculateAllCharacteristics();
    EditorActions.fullRender();
  };

  private update = (event: MouseEvent) => {
    const editorData: EditorData = EditorActions.getEditorData(event);
    EditorModel.mousePositionOnCanvas = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
    EditorModel.primaryRenderingEngine.update(editorData);
    // EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.update(editorData);
    if (this.props.imageDragMode) {
      EditorModel.viewPortHelper.update(editorData);
    } else {
      EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.update(editorData);
    }
    !this.props.activePopupType && EditorActions.updateMousePositionIndicator(event);
    EditorActions.fullRender();
  };

  private handleZoom = (event: MouseWheelEvent) => {
    if (event.ctrlKey || (PlatformModel.isMac && event.metaKey)) {
      const scrollSign: number = Math.sign(event.deltaY);
      if ((PlatformModel.isMac && scrollSign === -1) || (!PlatformModel.isMac && scrollSign === 1)) {
        ViewPortActions.zoomOut();
      }
      else if ((PlatformModel.isMac && scrollSign === 1) || (!PlatformModel.isMac && scrollSign === -1)) {
        ViewPortActions.zoomIn();
      }
    }
  };

  private onScrollbarsUpdate = (scrollbarContent) => {
    let newViewPortContentSize = {
      width: scrollbarContent.scrollWidth,
      height: scrollbarContent.scrollHeight
    };
    if (!isEqual(newViewPortContentSize, this.state.viewPortSize)) {
      this.setState({ viewPortSize: newViewPortContentSize })
    }
  };

  public render() {
    return (
      <div
        className="Editor"
        ref={ref => EditorModel.editor = ref}
        draggable={false}
      >
        <Scrollbars
          ref={ref => EditorModel.viewPortScrollbars = ref}
          renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}
          renderTrackVertical={props => <div {...props} className="track-vertical" />}
          onUpdate={this.onScrollbarsUpdate}
        >
          <div
            className="ViewPortContent"
          >
            <canvas
              className="ImageCanvas"
              ref={ref => (EditorModel.canvas = ref)}
              draggable={false}
              onContextMenu={(event: React.MouseEvent<HTMLCanvasElement>) => event.preventDefault()}
            />
            {/* {this.getOptionsPanels()} */}
          </div>
        </Scrollbars>
        <div
          className="MousePositionIndicator"
          ref={ref => (EditorModel.mousePositionIndicator = ref)}
          draggable={false}
        />
        <div
          className={EditorUtil.getCursorStyle(this.props.customCursorStyle)}
          ref={ref => (EditorModel.cursor = ref)}
          draggable={false}
        >
          <img draggable={false} alt={'indicator'} src={EditorUtil.getIndicator(this.props.customCursorStyle)} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateImageDataById,
  loadDataFromLocalStorge,
};

const mapStateToProps = (state: AppState) => ({
  activeLabelType:
    state.editor.imagesData[EditorSelector.getActiveImageIndex()].groupList[EditorSelector.getActiveGroupIndex()]
      .activeLabelType || LabelType.POINT,
  activePopupType: state.general.activePopupType,
  activeLabelId:
    state.editor.imagesData[EditorSelector.getActiveImageIndex()].groupList[EditorSelector.getActiveGroupIndex()]
      .activeLabelId,
  customCursorStyle: state.general.customCursorStyle,
  imageDragMode: state.general.imageDragMode,
  zoom: state.general.zoom
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
