import { PopupWindowType } from "../data/enums/PopupWindowType";

export class Settings {
  public static readonly GITHUB_URL: string = "https://github.com/SkalskiP";
  public static readonly MEDIUM_URL: string = "https://medium.com/@piotr.skalski92";
  public static readonly PATREON_URL: string = "https://www.patreon.com/make_sense";

  public static readonly TOP_NAVIGATION_BAR_HEIGHT_PX: number = 35;
  public static readonly BOTTOM_NAVIGATION_BAR_HEIGHT_PX: number = 45 + 1;
  public static readonly EDITOR_TOP_NAVIGATION_BAR_HEIGHT_PX: number = 40 + 1;
  public static readonly SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX: number = 20 + 1;
  public static readonly SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX: number =
    Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX + 300 + 1;
  public static readonly TOOLKIT_TAB_HEIGHT_PX: number = 40;

  public static readonly EDITOR_MIN_WIDTH: number = 900;
  public static readonly EDITOR_MIN_HEIGHT: number = 500;

  public static readonly PRIMARY_COLOR: string = "#2af598";
  public static readonly SECONDARY_COLOR: string = "#009efd";

  public static readonly DARK_THEME_FIRST_COLOR: string = "#171717";
  public static readonly DARK_THEME_SECOND_COLOR: string = "#C9FF2F";
  public static readonly DARK_THEME_THIRD_COLOR: string = "#4c4c4c";
  public static readonly DARK_THEME_FORTH_COLOR: string = "#252f35";

  public static readonly CANVAS_PADDING_WIDTH_PX: number = 20;
  public static readonly CROSS_HAIR_THICKNESS_PX: number = 1;
  public static readonly CROSS_HAIR_COLOR: string = "#fff";

  public static readonly RESIZE_HANDLE_DIMENSION_PX: number = 6;
  public static readonly RESIZE_HANDLE_HOVER_DIMENSION_PX = 16;

  public static readonly CLOSEABLE_POPUPS: PopupWindowType[] = [
    PopupWindowType.LOAD_IMAGES,
    PopupWindowType.LOAD_IMAGES,
    PopupWindowType.LOAD_IMAGES,
  ];
}
