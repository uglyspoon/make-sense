import { ProjectType } from '../../data/enums/ProjectType';
import { EditorActionTypes, ImageData } from './types';
import { Action } from '../Actions';
import { LabelType } from '../../data/enums/LabelType';

export function updateProjectType(projectType: ProjectType): EditorActionTypes {
  return {
    type: Action.UPDATE_PROJECT_TYPE,
    payload: {
      projectType,
    },
  };
}

export function updateProjectName(projectName: string): EditorActionTypes {
  return {
    type: Action.UPDATE_PROJECT_NAME,
    payload: {
      projectName,
    },
  };
}

export function updateActiveImageIndex(activeImageIndex: number): EditorActionTypes {
  return {
    type: Action.UPDATE_ACTIVE_IMAGE_INDEX,
    payload: {
      activeImageIndex,
    },
  };
}

export function updateActiveLabelNameIndex(activeLabelNameIndex: number): EditorActionTypes {
  return {
    type: Action.UPDATE_ACTIVE_LABEL_NAME_INDEX,
    payload: {
      activeLabelNameIndex,
    },
  };
}

export function updateLabelIndexByInfo(
  imageIndex: number,
  groupIndex: number,
  labelPointIndex: number,
  labelIndex: number,
  labelCheckd: boolean
): EditorActionTypes {
  return {
    type: Action.UPDATE_LABEL_INDEX_BY_INFO,
    payload: {
      imageIndex,
      groupIndex,
      labelPointIndex,
      labelIndex,
      labelCheckd,
    },
  };
}

export function updateActiveLabelId(activeLabelId: string): EditorActionTypes {
  return {
    type: Action.UPDATE_ACTIVE_LABEL_ID,
    payload: {
      activeLabelId,
    },
  };
}

export function updateHighlightedLabelId(highlightedLabelId: string): EditorActionTypes {
  return {
    type: Action.UPDATE_HIGHLIGHTED_LABEL_ID,
    payload: {
      highlightedLabelId,
    },
  };
}

export function updateActiveLabelType(activeLabelType: LabelType): EditorActionTypes {
  return {
    type: Action.UPDATE_ACTIVE_LABEL_TYPE,
    payload: {
      activeLabelType,
    },
  };
}

export function updateImageDataById(id: string, newImageData: ImageData): EditorActionTypes {
  return {
    type: Action.UPDATE_IMAGE_DATA_BY_ID,
    payload: {
      id,
      newImageData,
    },
  };
}

export function addImageData(imageData: ImageData[]): EditorActionTypes {
  return {
    type: Action.ADD_IMAGES_DATA,
    payload: {
      imageData,
    },
  };
}

export function updateImageData(imageData: ImageData[]): EditorActionTypes {
  return {
    type: Action.UPDATE_IMAGES_DATA,
    payload: {
      imageData,
    },
  };
}

export function updateLabelNamesList(labelNames: string[]) {
  return {
    type: Action.UPDATE_LABEL_NAMES_LIST,
    payload: {
      labelNames,
    },
  };
}

export function updateFirstLabelCreatedFlag(firstLabelCreatedFlag: boolean) {
  return {
    type: Action.UPDATE_FIRST_LABEL_CREATED_FLAG,
    payload: {
      firstLabelCreatedFlag,
    },
  };
}

export function updateGroupList(groupName: string) {
  return {
    type: Action.UPDATE_GROUP_LIST,
    payload: {
      groupName,
    },
  };
}
export function updateActiveGroupIndex(groupIndex: number) {
  return {
    type: Action.UPDATE_ACTIVE_GROUP_INDEX,
    payload: {
      groupIndex,
    },
  };
}
export function findNextAvailableLabelIndex() {
  return {
    type: Action.FIND_NEXT_AVAILABLE_LABEL_INDEX,
  };
}

export function deleteGroupList(groupIndex: number) {
  return {
    type: Action.DELETE_GROUP_LIST,
    payload: {
      groupIndex,
    },
  };
}

export function loadDataFromLocalStorge() {
  return {
    type: Action.LOAD_DATA_FROM_LOCALSTORGE,
  };
}
