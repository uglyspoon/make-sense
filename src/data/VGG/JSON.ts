export interface VGGShape {}

export interface VGGRect extends VGGShape {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VGGJSON extends VGGShape {
  name: string;
  all_points: string[];
}

export interface VGGRegion {
  // shape_attributes: VGGShape;
  // region_attributes: { [key: string]: string };
  label: string;
  is_checked: string;
  all_points: string[] | string | number[];
  type: string;
}

export type VGGRegionsData = { [key: string]: VGGRegion };

export type VGGFileData = {
  size: number;
  image_name: string;
  people: any;
};

export type VGGObject = { [key: string]: VGGFileData };
