declare module 'jsvectormap' {
  interface MapOptions {
    selector: string;
    map: string;
    zoomButtons?: boolean;
    regionStyle?: {
      initial?: {
        fill?: string;
      };
      hover?: {
        fillOpacity?: number;
        fill?: string;
      };
    };
    regionLabelStyle?: {
      initial?: {
        fontFamily?: string;
        fontWeight?: string;
        fill?: string;
      };
      hover?: {
        cursor?: string;
      };
    };
    labels?: {
      regions?: {
        render?: (code: string) => string;
      };
    };
  }

  class JsVectorMap {
    constructor(options: MapOptions);
  }

  export default JsVectorMap;
}
