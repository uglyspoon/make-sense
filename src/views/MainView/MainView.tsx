import React, { useState } from 'react';
import './MainView.scss';
import { TextButton } from '../Common/TextButton/TextButton';
import classNames from 'classnames';
import { ISize } from '../../interfaces/ISize';
import { ImageButton } from '../Common/ImageButton/ImageButton';
import { ISocialMedia, SocialMediaData } from '../../data/info/SocialMediaData';
import { EditorFeatureData, IEditorFeature } from '../../data/info/EditorFeatureData';
import { Tooltip } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import withStyles from '@material-ui/core/styles/withStyles';
import ImagesDropZone from './ImagesDropZone/ImagesDropZone';
import 'react-notifications-component/dist/theme.css';
import LoginPopup from '../PopupView/LoginPopup/LoginPopup';

const MainView: React.FC = () => {
  const [projectInProgress, setProjectInProgress] = useState(false);
  const [projectCanceled, setProjectCanceled] = useState(false);

  const startProject = () => {
    setProjectInProgress(true);
  };
  const jumpToRegular = () => {
    window.location.href = 'https://uglyspoon.github.io/regular/';
  };

  const endProject = () => {
    setProjectInProgress(false);
    setProjectCanceled(true);
  };

  const getClassName = () => {
    return classNames('MainView', {
      InProgress: projectInProgress,
      Canceled: !projectInProgress && projectCanceled,
    });
  };

  const DarkTooltip = withStyles(theme => ({
    tooltip: {
      backgroundColor: '#171717',
      color: '#ffffff',
      boxShadow: theme.shadows[1],
      fontSize: 11,
      maxWidth: 120,
    },
  }))(Tooltip);

  const getSocialMediaButtons = (size: ISize) => {
    return SocialMediaData.map((data: ISocialMedia, index: number) => {
      return (
        <DarkTooltip
          key={index}
          disableFocusListener
          title={data.tooltipMessage}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          placement="left"
        >
          <div>
            <ImageButton size={size} image={data.imageSrc} imageAlt={data.imageAlt} href={data.href} />
          </div>
        </DarkTooltip>
      );
    });
  };

  const getEditorFeatureTiles = () => {
    return EditorFeatureData.map((data: IEditorFeature) => {
      return (
        <div className="EditorFeaturesTiles" key={data.displayText}>
          <div className="EditorFeaturesTilesWrapper">
            <img draggable={false} alt={data.imageAlt} src={data.imageSrc} />
            <div className="EditorFeatureLabel">{data.displayText}</div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={getClassName()}>
      <div className="Slider" id="lower">
        <div className="TriangleVertical">
          <div className="TriangleVerticalContent" />
        </div>
      </div>

      <div className="Slider" id="upper">
        <div className="TriangleVertical">
          <div className="TriangleVerticalContent" />
        </div>
      </div>

      <div className="LeftColumn">
        <div className={'LogoWrapper'}>
          {/* <img draggable={false} alt={"main-logo"} src={"img/main-image-color.png"} /> */}
          {/* <div /> */}
        </div>
        <div className="EditorFeaturesWrapper">{getEditorFeatureTiles()}</div>
        <div className="TriangleVertical">
          <div className="TriangleVerticalContent" />
        </div>
        {projectInProgress && <TextButton label={'返回'} onClick={endProject} />}
      </div>
      <div className="RightColumn">
        <div />
        {/* <ImagesDropZone /> */}
        {projectInProgress && <LoginPopup />}
        {/* <div className="SocialMediaWrapper">{getSocialMediaButtons({ width: 30, height: 30 })}</div> */}
        <div className="SocialMediaWrapper"></div>
        <TextButton label={'常规标记'} onClick={jumpToRegular} />
        {!projectInProgress && <TextButton label={'关节标记'} onClick={startProject} />}
      </div>
    </div>
  );
};

export default MainView;
