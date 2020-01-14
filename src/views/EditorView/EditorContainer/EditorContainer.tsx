import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Direction } from '../../../data/enums/Direction';
import { ISize } from '../../../interfaces/ISize';
import { Settings } from '../../../settings/Settings';
import { AppState } from '../../../store';
import { ImageData } from '../../../store/editor/types';
import ImagesList from '../SideNavigationBar/ImagesList/ImagesList';
import LabelsToolkit from '../SideNavigationBar/LabelsToolkit/LabelsToolkit';
import { SideNavigationBar } from '../SideNavigationBar/SideNavigationBar';
import { VerticalEditorButton } from '../VerticalEditorButton/VerticalEditorButton';
import './EditorContainer.scss';
import Editor from '../Editor/Editor';
import BottomNavigationBar from '../BottomNavigationBar/BottomNavigationBar';
import { ContextManager } from '../../../logic/context/ContextManager';
import { ContextType } from '../../../data/enums/ContextType';
import {
  updateGroupList,
  updateActiveGroupIndex,
  updateActiveLabelNameIndex,
  updateLabelIndexByInfo,
  updateActiveImageIndex,
} from '../../../store/editor/actionCreators';
import { LabelType } from '../../../data/enums/LabelType';
import { EditorModel } from '../../../staticModels/EditorModel';
import { RenderEngineUtil } from '../../../utils/RenderEngineUtil';
import { EditorActions } from '../../../logic/actions/EditorActions';
import { EditorSelector } from '../../../store/selectors/EditorSelector';
import EditorTopNavigationBar from "../EditorTopNavigationBar/EditorTopNavigationBar";

interface IProps {
  windowSize: ISize;
  activeImageIndex: number;
  imagesData: ImageData[];
  activeContext: ContextType;
  editor: any;
  updateGroupList: (groupName: string) => any;
  updateActiveGroupIndex: (groupIndex: number) => any;
  updateActiveLabelNameIndex: (labelNameIndex: number) => any;
  updateLabelIndexByInfo: (
    imageIndex: number,
    groupIndex: number,
    labelPointIndex: number,
    labelIndex: number,
    checked: boolean
  ) => any;
  updateActiveImageIndex: (imageIndex: number) => any;
}

const EditorContainer: React.FC<IProps> = ({
  windowSize,
  activeImageIndex,
  imagesData,
  activeContext,
  editor,
  updateGroupList,
  updateActiveGroupIndex,
  updateLabelIndexByInfo,
}) => {
  const [leftTabStatus, setLeftTabStatus] = useState(true);
  const [rightTabStatus, setRightTabStatus] = useState(true);
  const calculateEditorSize = (): ISize => {
    if (windowSize) {
      const leftTabWidth = leftTabStatus
        ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX
        : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
      const rightTabWidth = rightTabStatus
        ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX
        : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
      return {
        width: windowSize.width - leftTabWidth - rightTabWidth,
        height: windowSize.height - Settings.TOP_NAVIGATION_BAR_HEIGHT_PX - Settings.BOTTOM_NAVIGATION_BAR_HEIGHT_PX - Settings.EDITOR_TOP_NAVIGATION_BAR_HEIGHT_PX,
      };
    } else return null;
  };

  const leftSideBarButtonOnClick = () => {
    if (!leftTabStatus) ContextManager.switchCtx(ContextType.LEFT_NAVBAR);
    else if (leftTabStatus && activeContext === ContextType.LEFT_NAVBAR) ContextManager.restoreCtx();

    setLeftTabStatus(!leftTabStatus);
  };

  const leftSideBarCompanionRender = () => {
    return (
      <>
        <VerticalEditorButton
          label="Images"
          image={'/ico/files.png'}
          imageAlt={'images'}
          onClick={leftSideBarButtonOnClick}
          isActive={leftTabStatus}
        />
      </>
    );
  };

  const leftSideBarRender = () => {
    return <ImagesList />;
  };

  const rightSideBarButtonOnClick = () => {
    if (!rightTabStatus) ContextManager.switchCtx(ContextType.RIGHT_NAVBAR);
    else if (rightTabStatus && activeContext === ContextType.RIGHT_NAVBAR) ContextManager.restoreCtx();

    setRightTabStatus(!rightTabStatus);
  };

  const rightSideBarCompanionRender = () => {
    return (
      <>
        <VerticalEditorButton
          label="Labels"
          image={'/ico/tags.png'}
          imageAlt={'labels'}
          onClick={rightSideBarButtonOnClick}
          isActive={rightTabStatus}
        />
      </>
    );
  };

  const rightSideBarRender = () => {
    return <LabelsToolkit />;
  };

  // useEffect(() => {
  // return;
  // setTimeout(() => {
  //   localStorage.setItem(
  //     'offsetHeight',
  //     (document.getElementsByClassName('TopNavigationBar')[0] as any).offsetHeight
  //   );
  //   localStorage.setItem(
  //     'offsetWidth',
  //     (document.getElementsByClassName('SideNavigationBar left')[0] as any).offsetWidth
  //   );
  //   const editorData = EditorActions.getEditorData();
  //   const offsetWidth = localStorage.getItem('offsetWidth');
  //   const offsetHeight = localStorage.getItem('offsetHeight');
  //   // const newIndexs: number[] = [];
  //   // [].slice
  //   //   .call(document.getElementsByClassName('ImagePreview'))
  //   //   .forEach(r => newIndexs.push(+r.getAttribute('data-index')));
  //   // const showImageIndexs: number[] = (window as any).showImageIndexs || [];
  //   // const showImagesData = imagesData.filter((itme, idx) => newIndexs.includes(idx));
  //   imagesData.forEach((imageData, imageIndex) => {
  //     console.log('activeImageIndex', imageIndex);
  //     const localData: ImageData = JSON.parse(localStorage.getItem(imageData.fileData.name));
  //     // updateActiveImageIndex(imageIndex);
  //     const evt_click = new MouseEvent('click', {
  //       bubbles: true,
  //       view: window,
  //     });
  //     document.querySelectorAll('.VirtualListContent .ImagePreview')[imageIndex].dispatchEvent(evt_click);
  //     if (localData) {
  //       localData.groupList.forEach((item, groupIndex) => {
  //         if (groupIndex !== 0) {
  //           updateGroupList(`person-${groupIndex}`);
  //           updateActiveGroupIndex(groupIndex);
  //         }
  //         item.labelPoints.forEach((labelPoint, labelPointIndex) => {
  //           const point = RenderEngineUtil.transferPointFromImageToCanvas(labelPoint.point, editorData);
  //           const evt_up = new MouseEvent('mouseup', {
  //             bubbles: true,
  //             view: window,
  //             clientX: point.x + +offsetWidth,
  //             clientY: point.y + +offsetHeight,
  //           });
  //           const evt_down = new MouseEvent('mousedown', {
  //             bubbles: true,
  //             view: window,
  //             clientX: point.x + +offsetWidth,
  //             clientY: point.y + +offsetHeight,
  //           });
  //           EditorModel.canvas.dispatchEvent(evt_up);
  //           EditorModel.canvas.dispatchEvent(evt_down);
  //           console.log(imageIndex, groupIndex, labelPointIndex, labelPoint.labelIndex);
  //           updateLabelIndexByInfo(
  //             imageIndex,
  //             groupIndex,
  //             labelPointIndex,
  //             labelPoint.labelIndex,
  //             labelPoint.checked
  //           );
  //         });
  //       });
  //     }
  //   });
  // }, 1000);
  // }, []);
  return (
    <div className="EditorContainer">
      <SideNavigationBar
        direction={Direction.LEFT}
        isOpen={leftTabStatus}
        isWithContext={activeContext === ContextType.LEFT_NAVBAR}
        renderCompanion={leftSideBarCompanionRender}
        renderContent={leftSideBarRender}
      />
      <div className="EditorWrapper" onMouseDown={() => ContextManager.switchCtx(ContextType.EDITOR)}>
        <EditorTopNavigationBar />
        <Editor size={calculateEditorSize()} imageData={imagesData[activeImageIndex]} />
        <BottomNavigationBar
          imageData={imagesData[activeImageIndex]}
          size={calculateEditorSize()}
          totalImageCount={imagesData.length}
        />
      </div>
      <SideNavigationBar
        direction={Direction.RIGHT}
        isOpen={rightTabStatus}
        isWithContext={activeContext === ContextType.RIGHT_NAVBAR}
        renderCompanion={rightSideBarCompanionRender}
        renderContent={rightSideBarRender}
      />
    </div>
  );
};

const mapDispatchToProps = {
  updateGroupList,
  updateActiveGroupIndex,
  updateActiveLabelNameIndex,
  updateLabelIndexByInfo,
  updateActiveImageIndex,
};

const mapStateToProps = (state: AppState) => ({
  windowSize: state.general.windowSize,
  activeImageIndex: state.editor.activeImageIndex,
  imagesData: state.editor.imagesData,
  activeContext: state.general.activeContext,
  editor: state.editor,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorContainer);
