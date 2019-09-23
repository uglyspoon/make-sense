import { IRect } from "../../interfaces/IRect";
import { ProjectType } from "../../data/enums/ProjectType";
import { Action } from "../Actions";
import { LabelType } from "../../data/enums/LabelType";
import { IPoint } from "../../interfaces/IPoint";

export type LabelRect = {
  id: string;
  labelIndex: number;
  checked: boolean;
  rect: IRect;
};

export type LabelPoint = {
  id: string;
  labelIndex: number;
  checked: boolean;
  point: IPoint;
};

export type LabelPolygon = {
  id: string;
  labelIndex: number;
  checked: boolean;
  vertices: IPoint[];
};

export type LabelData = {
  labelRects: LabelRect[];
  labelPoints: LabelPoint[];
  labelPolygons: LabelPolygon[];
};

export type ImageData = {
  id: string;
  loadStatus: boolean;
  fileData: File;
  activeGroupIndex: number;
  groupList: GroupType[];
};

export type EditorState = {
  projectType: ProjectType;
  projectName: string;
  imagesData: ImageData[];
  labelNames: string[];
  activeImageIndex: number;
};

export type GroupType = {
  activeLabelNameIndex: number;
  activeLabelType: LabelType;
  activeLabelId: string;
  highlightedLabelId: string;
  firstLabelCreatedFlag: boolean;
  labelRects: LabelRect[];
  labelPoints: LabelPoint[];
  labelPolygons: LabelPolygon[];
};

interface UpdateProjectType {
  type: typeof Action.UPDATE_PROJECT_TYPE;
  payload: {
    projectType: ProjectType;
  };
}

interface UpdateProjectName {
  type: typeof Action.UPDATE_PROJECT_NAME;
  payload: {
    projectName: string;
  };
}

interface UpdateActiveImageIndex {
  type: typeof Action.UPDATE_ACTIVE_IMAGE_INDEX;
  payload: {
    activeImageIndex: number;
  };
}

interface UpdateActiveLabelNameIndex {
  type: typeof Action.UPDATE_ACTIVE_LABEL_NAME_INDEX;
  payload: {
    activeLabelNameIndex: number;
  };
}

interface UpdateActiveLabelId {
  type: typeof Action.UPDATE_ACTIVE_LABEL_ID;
  payload: {
    activeLabelId: string;
  };
}

interface UpdateHighlightedLabelId {
  type: typeof Action.UPDATE_HIGHLIGHTED_LABEL_ID;
  payload: {
    highlightedLabelId: string;
  };
}

interface UpdateActiveLabelType {
  type: typeof Action.UPDATE_ACTIVE_LABEL_TYPE;
  payload: {
    activeLabelType: LabelType;
  };
}

interface UpdateImageDataById {
  type: typeof Action.UPDATE_IMAGE_DATA_BY_ID;
  payload: {
    id: string;
    newImageData: ImageData;
  };
}

interface UpdateGroupDataByIndex {
  type: typeof Action.UPDATE_GROUP_DATA_BY_INDEX;
  payload: {
    index: number;
    newGroupData: GroupType;
  };
}

interface AddImageData {
  type: typeof Action.ADD_IMAGES_DATA;
  payload: {
    imageData: ImageData[];
  };
}

interface UpdateImageData {
  type: typeof Action.UPDATE_IMAGES_DATA;
  payload: {
    imageData: ImageData[];
  };
}

interface UpdateLabelNamesList {
  type: typeof Action.UPDATE_LABEL_NAMES_LIST;
  payload: {
    labelNames: string[];
  };
}

interface UpdateFirstLabelCreatedFlag {
  type: typeof Action.UPDATE_FIRST_LABEL_CREATED_FLAG;
  payload: {
    firstLabelCreatedFlag: boolean;
  };
}

interface UpdateGroupList {
  type: typeof Action.UPDATE_GROUP_LIST;
  payload: {
    groupName: string;
  };
}

interface UpdateActiveGroupIndex {
  type: typeof Action.UPDATE_ACTIVE_GROUP_INDEX;
  payload: {
    groupIndex: number;
  };
}

interface findNextAvailableLabelIndex {
  type: typeof Action.FIND_NEXT_AVAILABLE_LABEL_INDEX;
}

interface deleteGroupList {
  type: typeof Action.DELETE_GROUP_LIST;
  payload: {
    groupIndex: number;
  };
}

export type EditorActionTypes =
  | UpdateProjectType
  | UpdateProjectName
  | UpdateActiveImageIndex
  | UpdateActiveLabelNameIndex
  | UpdateActiveLabelType
  | UpdateImageDataById
  | AddImageData
  | UpdateImageData
  | UpdateLabelNamesList
  | UpdateActiveLabelId
  | UpdateHighlightedLabelId
  | UpdateFirstLabelCreatedFlag
  | UpdateGroupList
  | UpdateActiveGroupIndex
  | UpdateGroupDataByIndex
  | findNextAvailableLabelIndex
  | deleteGroupList;
