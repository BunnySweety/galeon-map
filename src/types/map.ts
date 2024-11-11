export interface MapConfig {
    center: [number, number];
    zoom: number;
    maxZoom: number;
    minZoom: number;
    zoomControl: boolean;
  }
  
  export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
  }
  
  export interface ClusterConfig {
    maxClusterRadius: number;
    spiderfyOnMaxZoom: boolean;
    showCoverageOnHover: boolean;
    zoomToBoundsOnClick: boolean;
    disableClusteringAtZoom?: number;
    chunkedLoading?: boolean;
    chunkInterval?: number;
    chunkDelay?: number;
  }
  
  export interface TileLayerConfig {
    url: string;
    attribution: string;
    maxZoom: number;
  }
  
  export interface MapState {
    bounds: MapBounds | null;
    zoom: number;
    center: [number, number];
    isLoading: boolean;
    error: string | null;
  }