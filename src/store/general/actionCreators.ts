import { ISize } from "../../interfaces/ISize";
import { GeneralActionTypes } from "./types";
import { Action } from "../Actions";
import { PopupWindowType } from "../../data/enums/PopupWindowType";
import { CustomCursorStyle } from "../../data/enums/CustomCursorStyle";
import { ContextType } from "../../data/enums/ContextType";

export function updateWindowSize(windowSize: ISize): GeneralActionTypes {
    return {
        type: Action.UPDATE_WINDOW_SIZE,
        payload: {
            windowSize,
        },
    };
}

export function updateActivePopupType(activePopupType: PopupWindowType): GeneralActionTypes {
    return {
        type: Action.UPDATE_ACTIVE_POPUP_TYPE,
        payload: {
            activePopupType,
        }
    }
}

export function updateCustomCursorStyle(customCursorStyle: CustomCursorStyle): GeneralActionTypes {
    return {
        type: Action.UPDATE_CUSTOM_CURSOR_STYLE,
        payload: {
            customCursorStyle,
        }
    }
}

export function updateActiveContext(activeContext: ContextType): GeneralActionTypes {
    return {
        type: Action.UPDATE_CONTEXT,
        payload: {
            activeContext,
        },
    };
}
export function updateImageDragModeStatus(imageDragMode: boolean): GeneralActionTypes {
    return {
        type: Action.UPDATE_IMAGE_DRAG_MODE_STATUS,
        payload: {
            imageDragMode,
        },
    };
}

export function updateZoom(zoom: number): GeneralActionTypes {
    return {
        type: Action.UPDATE_ZOOM,
        payload: {
            zoom,
        },
    };
}