import { EditorActionTypes, EditorState, ImageData } from "./types";
import { Action } from "../Actions";

const initialState: EditorState = {
  activeImageIndex: null,
  activeLabelNameIndex: null,
  activeLabelType: null,
  activeLabelId: null,
  highlightedLabelId: null,
  projectType: null,
  projectName: "my-project-name",
  imagesData: [],
  labelNames: [],
  firstLabelCreatedFlag: false,
};

export function editorReducer(state = initialState, action: EditorActionTypes): EditorState {
  switch (action.type) {
    case Action.UPDATE_PROJECT_TYPE: {
      return {
        ...state,
        projectType: action.payload.projectType,
      };
    }
    case Action.UPDATE_PROJECT_NAME: {
      return {
        ...state,
        projectName: action.payload.projectName,
      };
    }
    case Action.UPDATE_ACTIVE_IMAGE_INDEX: {
      return {
        ...state,
        activeImageIndex: action.payload.activeImageIndex,
      };
    }
    case Action.UPDATE_ACTIVE_LABEL_NAME_INDEX: {
      return {
        ...state,
        activeLabelNameIndex: action.payload.activeLabelNameIndex,
      };
    }
    case Action.UPDATE_ACTIVE_LABEL_ID: {
      return {
        ...state,
        activeLabelId: action.payload.activeLabelId,
      };
    }
    case Action.UPDATE_HIGHLIGHTED_LABEL_ID: {
      return {
        ...state,
        highlightedLabelId: action.payload.highlightedLabelId,
      };
    }
    case Action.UPDATE_ACTIVE_LABEL_TYPE: {
      return {
        ...state,
        activeLabelType: action.payload.activeLabelType,
      };
    }
    case Action.UPDATE_IMAGE_DATA_BY_ID: {
      return {
        ...state,
        imagesData: state.imagesData.map((imageData: ImageData) =>
          imageData.id === action.payload.id ? action.payload.newImageData : imageData
        ),
      };
    }
    case Action.ADD_IMAGES_DATA: {
      return {
        ...state,
        imagesData: state.imagesData.concat(action.payload.imageData),
      };
    }
    case Action.UPDATE_IMAGES_DATA: {
      return {
        ...state,
        imagesData: action.payload.imageData,
      };
    }
    case Action.UPDATE_LABEL_NAMES_LIST: {
      return {
        ...state,
        labelNames: action.payload.labelNames,
      };
    }
    case Action.UPDATE_FIRST_LABEL_CREATED_FLAG: {
      return {
        ...state,
        firstLabelCreatedFlag: action.payload.firstLabelCreatedFlag,
      };
    }
    default:
      return state;
  }
}
