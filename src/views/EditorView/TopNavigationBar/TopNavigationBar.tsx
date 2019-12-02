import React from 'react';
import './TopNavigationBar.scss';
import StateBar from '../StateBar/StateBar';
import { UnderlineTextButton } from '../../Common/UnderlineTextButton/UnderlineTextButton';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { updateActivePopupType } from '../../../store/general/actionCreators';
import TextInput from '../../Common/TextInput/TextInput';
import {
  updateProjectName,
  updateProjectType,
  updateImageData,
  updateActiveImageIndex,
} from '../../../store/editor/actionCreators';
import { ImageButton } from '../../Common/ImageButton/ImageButton';
import { Settings } from '../../../settings/Settings';
import { ProjectType } from '../../../data/enums/ProjectType';
import { ImageData } from '../../../store/editor/types';

interface IProps {
  updateActivePopupType: (activePopupType: PopupWindowType) => any;
  updateProjectName: (projectName: string) => any;
  updateImageData: (imageData: ImageData[]) => any;
  updateProjectType: (projectType: ProjectType) => any;
  updateActiveImageIndex: (activeImageIndex: number) => any;
  projectName: string;
}

const TopNavigationBar: React.FC<IProps> = ({
  updateActivePopupType,
  updateProjectName,
  projectName,
  updateImageData,
  updateActiveImageIndex,
  updateProjectType,
}) => {
  const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.setSelectionRange(0, event.target.value.length);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase().replace(' ', '-');
    updateProjectName(value);
  };

  const returnDir = () => {
    updateImageData([]);
    updateActiveImageIndex(0);
    updateProjectType(null);
  };
  return (
    <div className="TopNavigationBar">
      <StateBar />
      <div className="TopNavigationBarWrapper">
        <div>
          <div
            className="Header"
          // onClick={() => updateActivePopupType(PopupWindowType.EXIT_PROJECT)}
          >
            {/* <img draggable={false} alt={"make-sense"} src={"/make-sense-ico-transparent.png"} />
            Make Sense */}
          </div>
        </div>
        <div className="NavigationBarGroupWrapper">
          <div className="ProjectName">项目名称:</div>
          <TextInput key={'ProjectName'} isPassword={false} value={projectName} onChange={onChange} onFocus={onFocus} />
        </div>
        <div className="NavigationBarGroupWrapper">
          <UnderlineTextButton label={'返回文件夹'} under={true} onClick={() => returnDir()} />
          <UnderlineTextButton
            label={'导入更多图片'}
            under={true}
            onClick={() => updateActivePopupType(PopupWindowType.LOAD_IMAGES)}
          />
          <UnderlineTextButton
            label={'导出标注'}
            under={true}
            onClick={() => updateActivePopupType(PopupWindowType.EXPORT_LABELS)}
          />
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  updateActivePopupType,
  updateProjectName,
  updateImageData,
  updateActiveImageIndex,
  updateProjectType,
};

const mapStateToProps = (state: AppState) => ({
  projectName: state.editor.projectName,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNavigationBar);
