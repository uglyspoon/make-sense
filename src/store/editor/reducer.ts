import { EditorActionTypes, EditorState, ImageData } from "./types";
import { Action } from "../Actions";
import produce from "immer";
const initialState: EditorState = {
  activeImageIndex: 0,
  projectName: "my_project",
  imagesData: [],
  projectType: null,
  labelNames: ["头顶", "左手心", "右手心", "左脚跟", "左脚尖", "右脚跟", "右脚尖"],
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
        break;
      case Action.ADD_IMAGES_DATA:
        draft.imagesData = draft.imagesData.concat(action.payload.imageData);
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
          activeLabelNameIndex: null,
          activeLabelType: null,
          activeLabelId: null,
          highlightedLabelId: null,
          firstLabelCreatedFlag: false,
          labelRects: [],
          labelPoints: [],
          labelPolygons: [],
        });
        break;
      case Action.UPDATE_ACTIVE_GROUP_INDEX:
        draft.imagesData[activeImageIndex].activeGroupIndex = action.payload.groupIndex;
        break;
    }
  });
  return result;
}
