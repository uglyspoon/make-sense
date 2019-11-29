import React, { useState, useEffect, useRef } from 'react';
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
import { makeRequest, postData, getData, postFile } from '../../../utils/HttpUtils';
// import ImagesDropZone from '../../MainView/ImagesDropZone/ImagesDropZone';
// import { useDropzone } from 'react-dropzone';
import useModal from "use-react-modal";
import { TextButton } from '../../Common/TextButton/TextButton';
import ReactLoading from 'react-loading';


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

  const { openModal, closeModal, isOpen, Modal } = useModal();

  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [dirList, setDirList] = useState([]);
  const [picListDir, setPiclistDir] = useState([]);
  const [picList, setPicList] = useState([])
  const [selectDirName, setSelectDirName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [dirInfo, setDirInfo] = useState({
    dir: '',
    userId: 0
  });
  const [isEditingId, setIsEditingId] = useState('')
  const [dirName, setDirName] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  let inputRef = useRef<HTMLInputElement>();

  const onChangeUsername = val => {
    setUsername(val.target.value);
  };

  const onChangePassword = val => {
    setPassword(val.target.value);
  };

  useEffect(() => {
    getInitDir()
  }, []);

  const getInitDir = () => {
    if (cookies.token) {
      getData('/mark/sign/getDir').then(data => {
        if (data.status === 200) {
          const lists = data.data.reduce((acc, cur) => cur.list ? [...acc, ...cur.list] : [...acc], [])
          setDirList(lists)
          setIsLogin(true);
        } else {
          removeCookie('token');
        }
      });
    }
  }
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

  const handleChange = (files: File[]) => {
    let formdata = new FormData()
    formdata.append('dir', dirInfo.dir);
    formdata.append('userId', dirInfo.userId + '');
    [].slice.call(files).forEach((file, index) => {
      formdata.append('files', file)
    })
    files.length && setIsUploading(true)
    postFile('/mark/sign/upload', formdata).then(data => {
      if (data.status === 200) {
        console.log('success', data)
        setIsUploading(false)
      }
    });
  }

  const onClickImport = (userId: number, dir: string) => {
    setDirInfo({
      userId,
      dir
    })
    inputRef.current.click();
  }

  const onOpenModal = (e, dirName) => {
    openModal(e);
    postData('/mark/sign/picList', {
      dir: dirName, // 文件夹名称
      pageNo: 1, // 分页参数
      pageSize: 999999, // 分页参数
    }).then(resJson => {
      if (resJson.status === 200) {
        setPicList(resJson.data.rows)
      }
    });
  }

  const onCreateDir = (e, userId) => {
    setIsEditingId(userId)
  }

  const onConfirmCreateDir = (e, userId) => {
    postData('/mark/sign/addDir', {
      "dir": dirName, // 文件夹名称
      "userId": userId      // 文件夹对应用户
    }).then(resJson => {
      if (resJson.status === 200) {
        console.log(resJson)
        onClickUpload()
        setIsEditingId('')
        setDirName('')
      }
    });
  }

  const onCancelCreateDir = (e, userId) => {
    setIsEditingId('')
    setDirName('')
  }

  const onChangeDirName = (e) => {
    setDirName(e.target.value)
  }
  const renderPicList = () => {
    return <div className="ExitProjectPopupContent">
      <div className="Message">
        <Scrollbars style={{ width: '100%', height: 300, fontSize: 18 }}>
          {picListDir.map((item, idx) => {
            // <div {...getRootProps({ className: 'DropZone' })}>{getDropZoneContent()}</div>
            return (
              <>
                <p
                  style={{ cursor: 'point' }}
                  // onClick={() => onSelectPicList(item.username)}
                  key={item.username}
                  className={selectDirName === item.username ? 'active Utitle' : 'Utitle'}
                >
                  用户：{item.username}
                  {
                    isEditingId === item.userId ? <div>
                      <TextInput key="editDir" isPassword={false} onChange={onChangeDirName} />
                      <span className="confirmLabel" onClick={(e) => onConfirmCreateDir(e, item.userId)} >确定</span>
                      <span className="confirmLabel delete" onClick={(e) => onCancelCreateDir(e, item.userId)} >取消</span>
                    </div> :
                      <span className="ShowLabel" onClick={(e) => onCreateDir(e, item.userId)} >新建文件夹</span>
                  }
                </p>
                <ul>
                  {item.list && item.list.map((ele, index) => {
                    return <li><img src={require('./dir.svg')} /><span className="DirName">{ele}</span>
                      <span className="ShowLabel" onClick={(e) => onOpenModal(e, ele)} >查看</span>
                      <span className="ShowLabel ImportLabel" onClick={() => onClickImport(item.userId, ele)}>导入</span></li>
                  })}
                </ul>
              </>
            );
          })}
        </Scrollbars>
        <input
          type="file"
          style={{ display: 'none' }}
          ref={inputRef}
          accept="image/*"
          onChange={(e: any) => handleChange(e.target.files)}
          multiple
          hidden
        />
      </div>
    </div>
  }

  const onSelectPicList = dirName => {
    setSelectDirName(dirName);

    postData('/mark/sign/picList', {
      dir: dirName, // 文件夹名称
      pageNo: 1, // 分页参数
      pageSize: 999999, // 分页参数
    }).then(resJson => {
      if (resJson.status === 200) {
        console.log('rows', resJson.data.rows)
      }
    });
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

  const onLogout = () => {
    removeCookie('token');
    window.location.reload();
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
    }).then(function (res) {
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
            const lists = data.data.reduce((acc, cur) => cur.list ? [...acc, ...cur.list] : [...acc], [])
            setDirList(lists)
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

  const onReject = () => { };
  const onStart = () => {
    PopupActions.close();
    updateProjectType(ProjectType.OBJECT_DETECTION);
  };
  const onClickUpload = () => {
    setIsUpload(true)
    getData('/mark/sign/getDir').then(data => {
      if (data.status === 200) {
        const lists = data.data
        setPiclistDir(lists)
      }
    });
  }
  const onClickBack = () => {
    getInitDir();
    setIsUpload(false)
  }
  return (
    <>
      <GenericYesNoPopup
        title={!isLogin ? '登录' : '选择文件夹'}
        renderContent={!isUpload ? renderContent : renderPicList}
        acceptLabel={!isLogin ? '登录' : '开始标记'}
        onAccept={!isLogin ? onAccept : onStart}
        skipRejectButton={!isLogin}
        rejectLabel={'退出登录'}
        onReject={onLogout}
        disableAcceptButton={(isLogin && !selectDirName) || (isLogin && !isLoaded)}
        onClickUpload={onClickUpload}
        onClickBack={onClickBack}
        isUpload={isUpload}
        isLogin={isLogin}
      />
      {isOpen && (
        <Modal className={"PicModal"}>
          <div className="PicModal__Header" >图片列表</div>
          <div className="PicModal__Content" >
            <Scrollbars style={{
              width: '100%', height: 300, fontSize: 18, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around'
            }}>
              {picList.map((item, idx) => {
                return (
                  <img
                    style={{ cursor: 'point' }}
                    key={item.id}
                    // className={selectDirName === item ? 'active' : ''}
                    src={item.url}
                  />
                );
              })}
            </Scrollbars>
          </div>
          <div className="PicModal__Footer" >
            <TextButton
              label={"返回"}
              onClick={closeModal}
              externalClassName={"back"}
            />
          </div>
        </Modal>
      )}
      {isUploading ?
        <div className="Blocker">
          <div>
            <ReactLoading type={'balls'} color={'#fff'} width={70} />
            <p>上传中...</p>
            <p>Tips: 上传大量图片需要等待更长时间.</p>
          </div>
        </div>
        : null}
    </>

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
