import { store } from "../..";
import { PopupWindowType } from "../../data/enums/PopupWindowType";
import { ContextType } from "../../data/enums/ContextType";
import { CustomCursorStyle } from "../../data/enums/CustomCursorStyle";

export class GeneralSelector {
    public static getActivePopupType(): PopupWindowType {
        return store.getState().general.activePopupType;
    }

    public static getActiveContext(): ContextType {
        return store.getState().general.activeContext;
    }

    public static getPreventCustomCursorStatus(): boolean {
        return store.getState().general.preventCustomCursor;
    }

    public static getImageDragModeStatus(): boolean {
        return store.getState().general.imageDragMode;
    }

    public static getCustomCursorStyle(): CustomCursorStyle {
        return store.getState().general.customCursorStyle;
    }

    public static getZoom(): number {
        return store.getState().general.zoom;
    }
}