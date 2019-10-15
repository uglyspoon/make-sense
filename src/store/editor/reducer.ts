import { EditorActionTypes, EditorState, ImageData } from './types';
import { Action } from '../Actions';
import produce from 'immer';
import { LabelType } from '../../data/enums/LabelType';
import { EditorActions } from '../../logic/actions/EditorActions';
import { EditorModel } from '../../staticModels/EditorModel';

const initialState: EditorState = {
  activeImageIndex: 0,
  projectName: 'my_project',
  imagesData: [],
  projectType: null,
  labelNames: ['左手心', '右手心', '左脚跟', '左脚尖', '右脚跟', '右脚尖'],
};

export function editorReducer(state = initialState, action: EditorActionTypes): EditorState {
  const activeImageIndex = state.activeImageIndex;
  const activeGroupIndex = state.imagesData[activeImageIndex]
    ? state.imagesData[activeImageIndex].activeGroupIndex
    : undefined;
  const result = produce(state, draft => {
    switch (action.type) {
      case Action.UPDATE_PROJECT_TYPE:
        draft.projectType = action.payload.projectType;
        break;
      case Action.UPDATE_PROJECT_NAME:
        draft.projectName = action.payload.projectName;
        break;
      case Action.UPDATE_ACTIVE_IMAGE_INDEX:
        draft.activeImageIndex = action.payload.activeImageIndex;
        break;
      case Action.UPDATE_ACTIVE_LABEL_NAME_INDEX:
        draft.imagesData[activeImageIndex].groupList[activeGroupIndex].activeLabelNameIndex =
          action.payload.activeLabelNameIndex;
        break;
      case Action.UPDATE_LABEL_INDEX_BY_INFO:
        const { imageIndex, groupIndex, labelPointIndex, labelIndex, labelCheckd } = action.payload;
        if (!draft.imagesData[imageIndex].groupList[groupIndex].labelPoints[labelPointIndex]) {
          break;
        }
        draft.imagesData[imageIndex].groupList[groupIndex].labelPoints[labelPointIndex].labelIndex = labelIndex;
        draft.imagesData[imageIndex].groupList[groupIndex].labelPoints[labelPointIndex].checked = labelCheckd;
        break;
      case Action.UPDATE_ACTIVE_LABEL_ID:
        draft.imagesData[activeImageIndex].groupList[activeGroupIndex].activeLabelId = action.payload.activeLabelId;
        break;
      case Action.UPDATE_HIGHLIGHTED_LABEL_ID:
        draft.imagesData[activeImageIndex].groupList[activeGroupIndex].highlightedLabelId =
          action.payload.highlightedLabelId;
        break;
      case Action.UPDATE_ACTIVE_LABEL_TYPE:
        draft.imagesData[activeImageIndex].groupList[activeGroupIndex].activeLabelType = action.payload.activeLabelType;
        break;
      case Action.UPDATE_IMAGE_DATA_BY_ID:
        //filter TODO
        draft.imagesData = state.imagesData.map((imageData: ImageData) =>
          imageData.id === action.payload.id ? action.payload.newImageData : imageData
        );
        // draft.imagesData.forEach((item, idx) => {
        //   if (item.groupList.some(ele => !!ele.activeLabelId)) {
        //     localStorage.setItem(item.fileData.name, JSON.stringify(item));
        //   }
        // });
        break;
      case Action.ADD_IMAGES_DATA:
        const addImagesData = action.payload.imageData;
        draft.imagesData = draft.imagesData.concat(addImagesData);

        break;
      case Action.LOAD_DATA_FROM_LOCALSTORGE:
        draft.imagesData.forEach((item, idx) => {
          if (localStorage.getItem(item.fileData.name)) {
            const newData = JSON.parse(localStorage.getItem(item.fileData.name));
            newData.fileData = draft.imagesData[idx].fileData;
            draft.imagesData[idx] = newData;
            // console.log(JSON.parse(localStorage.getItem(item.fileData.name)));
          }
        });
        break;
      case Action.UPDATE_IMAGES_DATA:
        draft.imagesData = action.payload.imageData;
        break;
      case Action.UPDATE_LABEL_NAMES_LIST:
        draft.labelNames = action.payload.labelNames;
        break;
      case Action.UPDATE_FIRST_LABEL_CREATED_FLAG:
        draft.imagesData[activeImageIndex].groupList[activeGroupIndex].firstLabelCreatedFlag =
          action.payload.firstLabelCreatedFlag;
        break;
      case Action.UPDATE_GROUP_LIST:
        draft.imagesData[activeImageIndex].groupList.push({
          activeLabelNameIndex: 0,
          activeLabelType: LabelType.POINT,
          activeLabelId: null,
          highlightedLabelId: null,
          firstLabelCreatedFlag: false,
          labelRects: [],
          labelPoints: [],
          labelPolygons: [],
        });
        break;
      case Action.DELETE_GROUP_LIST:
        const newGroupList = draft.imagesData[activeImageIndex].groupList.filter(
          (_, idx) => idx !== action.payload.groupIndex
        );
        const activeGroup = draft.imagesData[activeImageIndex].groupList[activeGroupIndex];

        const newActiveGroupIndex = newGroupList.findIndex(item => item === activeGroup);
        draft.imagesData[activeImageIndex].activeGroupIndex = newActiveGroupIndex;
        draft.imagesData[activeImageIndex].groupList = newGroupList;
        break;
      case Action.UPDATE_ACTIVE_GROUP_INDEX:
        draft.imagesData[activeImageIndex].activeGroupIndex = action.payload.groupIndex;
        break;
      case Action.FIND_NEXT_AVAILABLE_LABEL_INDEX:
        const allIndex = [...Array(draft.labelNames.length)].map((v, k) => k);
        const existedLabelIndexs = draft.imagesData[activeImageIndex].groupList[activeGroupIndex].labelPoints.map(
          ele => ele.labelIndex
        );

        const difference = existedLabelIndexs
          .concat(allIndex)
          .filter(v => !existedLabelIndexs.includes(v) || !allIndex.includes(v));
        draft.imagesData[activeImageIndex].groupList[activeGroupIndex].activeLabelNameIndex = difference.length
          ? difference[0]
          : 0;
        break;
    }
  });
  return result;
}
