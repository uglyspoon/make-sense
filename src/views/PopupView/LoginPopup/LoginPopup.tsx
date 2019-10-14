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
const cookies = new Cookies();

interface IProps {
  updateActiveImageIndex: (activeImageIndex: number) => any;
  updateProjectType: (projectType: ProjectType) => any;
  updateActiveLabelNameIndex: (activeLabelIndex: number) => any;
  updateLabelNamesList: (labelNames: string[]) => any;
  updateImageData: (imageData: ImageData[]) => any;
  updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
  addImageData: (imageData: ImageData[]) => any;
}

function makeRequest(method: string, url: string) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

function postData(url: string, data: object): Promise<any> {
  // Default options are marked with *
  return fetch(url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    mode: 'cors',
    // credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      Authorization: cookies.get('token'),
      'content-type': 'application/json',
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
  }).then(response => response.json()); // parses response to JSON
}

function getData(url: string): Promise<any> {
  // Default options are marked with *
  return fetch(url, {
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    mode: 'cors',
    // credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'content-type': 'application/json',
      Authorization: cookies.get('token'),
    },
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
  }).then(response => response.json()); // parses response to JSON
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
  const [username, setUsername] = useState('chaihang');
  const [password, setPassword] = useState('dabai521');
  const [isLogin, setIsLogin] = useState(false);
  const [dirList, setDirList] = useState([]);
  const [selectDirName, setSelectDirName] = useState('');

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

    postData('http://47.99.138.248/mark/sign/picList', {
      dir: dirName, // 文件夹名称
      pageNo: 1, // 分页参数
      pageSize: 999999, // 分页参数
    }).then(resJson => {
      console.log(resJson);
      if (resJson.status === 200) {
        importImagesDataFromHttp(resJson.data.rows);
      }
    });
  };

  const importImagesDataFromHttp = (urlAry: any[]) => {
    let imagesData = [];

    urlAry.forEach(async (data, idx) => {
      let blob = await makeRequest('get', data.url);
      var file = new File([blob as any], data.id);
      console.log(file);
      // var blob = null;
      // var xhr = new XMLHttpRequest();
      // xhr.open('GET', data.url);
      // xhr.responseType = 'blob';
      // xhr.onload = function() {
      //   console.log(idx);
      //   blob = xhr.response;
      //   // LoadAndDisplayFile(blob);
      //   // var fileName = data.url.split('/').pop();
      //   var file = new File([blob], data.id);
      //   var tempImageData = {
      //     activeGroupIndex: 0,
      //     fileData: file,
      //     groupList: [
      //       {
      //         activeLabelNameIndex: 0,
      //         activeLabelType: LabelType.POINT,
      //         activeLabelId: null,
      //         highlightedLabelId: null,
      //         firstLabelCreatedFlag: false,
      //         labelRects: [],
      //         labelPoints: [],
      //         labelPolygons: [],
      //       },
      //     ],
      //     id: uuidv1(),
      //     loadStatus: false,
      //   };

      //   // console.log(file);
      //   imagesData.push(tempImageData);
      // };
      // xhr.send();
    });
  };
  const onAccept = () => {
    postData('http://47.99.138.248/mark/igt/login', {
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
        getData('http://47.99.138.248/mark/sign/getDir').then(data => {
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

  const onReject = () => {
    PopupActions.close();
  };

  return (
    <GenericYesNoPopup
      title={'登录'}
      renderContent={renderContent}
      acceptLabel={!isLogin ? '登录' : '开始标记'}
      onAccept={onAccept}
      skipRejectButton={true}
      rejectLabel={' '}
      onReject={() => {}}
      disableAcceptButton={isLogin && !selectDirName}
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
