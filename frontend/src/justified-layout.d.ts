declare module 'justified-layout' {
  interface LayoutBox {
    top: number;
    left: number;
    width: number;
    height: number;
  }
  
  interface Geometry {
    containerHeight: number;
    widowCount: number;
    boxes: LayoutBox[];
  }

  interface LayoutOptions {
    containerWidth?: number;
    targetRowHeight?: number;
    boxSpacing?: number | { horizontal: number; vertical: number };
    containerPadding?: number | { top: number; right: number; bottom: number; left: number };
    targetRowHeightTolerance?: number;
    maxNumRows?: number;
    forceAspectRatio?: boolean | number;
    showWidows?: boolean;
    fullWidthBreakoutRowCadence?: boolean | number;
  }

  function layout(input: Array<{ width: number; height: number } | number>, options?: LayoutOptions): Geometry;
  
  export default layout;
}
