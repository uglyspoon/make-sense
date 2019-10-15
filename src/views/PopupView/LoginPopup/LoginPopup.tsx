import React, { useState } from 'react';
import './LoginPopup.scss';
import { GenericYesNoPopup } from '../GenericYesNoPopup/GenericYesNoPopup';
import {
  updateActiveImageIndex,
  updateActiveLabelNameIndex,
  updateFirstLabelCreatedFlag,
  updateImageData,
  updateLabelNamesList,
  updateProjectType,
  addImageData,
} from '../../../store/editor/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { ProjectType } from '../../../data/enums/ProjectType';
import { ImageData } from '../../../store/editor/types';
import { PopupActions } from '../../../logic/actions/PopupActions';
import TextInput from '../../Common/TextInput/TextInput';
import { store } from 'react-notifications-component';
import { useCookies, Cookies } from 'react-cookie';
import uuidv1 from 'uuid/v1';

import { Scrollbars } from 'react-custom-scrollbars';
import { LabelType } from '../../../data/enums/LabelType';
import { makeRequest, postData, getData } from '../../../utils/HttpUtils';

interface IProps {
  updateActiveImageIndex: (activeImageIndex: number) => any;
  updateProjectType: (projectType: ProjectType) => any;
  updateActiveLabelNameIndex: (activeLabelIndex: number) => any;
  updateLabelNamesList: (labelNames: string[]) => any;
  updateImageData: (imageData: ImageData[]) => any;
  updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
  addImageData: (imageData: ImageData[]) => any;
}

const ExitProjectPopup: React.FC<IProps> = props => {
  const {
    updateActiveLabelNameIndex,
    updateLabelNamesList,
    updateProjectType,
    updateActiveImageIndex,
    updateImageData,
    updateFirstLabelCreatedFlag,
    addImageData,
  } = props;

  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [dirList, setDirList] = useState([]);
  const [selectDirName, setSelectDirName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const onChangeUsername = val => {
    setUsername(val.target.value);
  };

  const onChangePassword = val => {
    setPassword(val.target.value);
  };

  const renderContent = () => {
    return (
      <div className="ExitProjectPopupContent">
        <div className="Message">
          {!isLogin ? (
            <>
              用户名： <TextInput key="username" isPassword={false} onChange={onChangeUsername} />
              密码： <TextInput key="password" isPassword={true} onChange={onChangePassword} />
            </>
          ) : (
            <Scrollbars style={{ width: '100%', height: 300, fontSize: 18 }}>
              {dirList.map((item, idx) => {
                return (
                  <p
                    style={{ cursor: 'point' }}
                    onClick={() => onSelectDir(item)}
                    key={item}
                    className={selectDirName === item ? 'active' : ''}
                  >
                    {item}
                  </p>
                );
              })}
            </Scrollbars>
          )}
        </div>
      </div>
    );
  };
  const onSelectDir = dirName => {
    setSelectDirName(dirName);

    postData('/mark/sign/picList', {
      dir: dirName, // 文件夹名称
      pageNo: 1, // 分页参数
      pageSize: 999999, // 分页参数
    }).then(resJson => {
      if (resJson.status === 200) {
        importImagesDataFromHttp(resJson.data.rows);
      }
    });
  };

  const importImagesDataFromHttp = (urlAry: any[]) => {
    let imagesData = [];
    let number = 0;
    setIsLoaded(false);
    urlAry.forEach(async (data, idx) => {
      let blob = await makeRequest('get', data.url);
      var file = new File([blob as any], data.id);
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        var image = new Image();
        image.src = reader.result as any;
        image.onload = function(img) {
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
            imagesData.sort(function(a, b) {
              return +a.fileData.name - +b.fileData.name;
            });
            addImageData(imagesData);
            setIsLoaded(true);
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };
  const onAccept = () => {
    postData('/mark/igt/login', {
      username,
      password,
    }).then(function(res) {
      if (res.status !== 200) {
        store.addNotification({
          title: '登录出错',
          message: res.message,
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
      } else {
        setCookie('token', res.data);
        store.addNotification({
          message: '登录成功',
          type: 'success',
          insert: 'top',
          container: 'top-center',
          animationIn: ['animated', 'fadeIn'],
          animationOut: ['animated', 'fadeOut'],
          dismiss: {
            duration: 1000,
            // onScreen: true,
          },
        });
        getData('/mark/sign/getDir').then(data => {
          if (data.status === 200) {
            setDirList(data.data);
          }
        });
        setIsLogin(true);
      }
    });
    // getData('http://47.99.138.248/mark/sign/init').then(function(myJson) {
    //   console.log(myJson);
    // });
    PopupActions.close();
  };

  const onReject = () => {};
  const onStart = () => {
    PopupActions.close();
    updateProjectType(ProjectType.OBJECT_DETECTION);
  };
  return (
    <GenericYesNoPopup
      title={!isLogin ? '登录' : '选择文件夹'}
      renderContent={renderContent}
      acceptLabel={!isLogin ? '登录' : '开始标记'}
      onAccept={!isLogin ? onAccept : onStart}
      skipRejectButton={true}
      rejectLabel={' '}
      onReject={() => {}}
      disableAcceptButton={(isLogin && !selectDirName) || (isLogin && !isLoaded)}
    />
  );
};

const mapDispatchToProps = {
  updateActiveLabelNameIndex,
  updateLabelNamesList,
  updateProjectType,
  updateActiveImageIndex,
  updateImageData,
  updateFirstLabelCreatedFlag,
  addImageData,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExitProjectPopup);
