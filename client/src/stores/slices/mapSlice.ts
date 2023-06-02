import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface PositionModel {
  coordinates: Array<number>;
  zoom: number;
}

interface ItemModel {
  name: string;
  count: number;
  percentage: number;
}

interface ItemsModel {
  items: Array<ItemModel>;
  count: number;
  percentage?: number;
}

interface StatsModel {
  GENOTYPE: ItemsModel;
  H58: ItemsModel;
  MDR: ItemsModel;
  XDR: ItemsModel;
  AzithR: ItemsModel;
  Susceptible: ItemsModel;
  CipR: ItemsModel;
  CipI: ItemsModel;
  CipNS: ItemsModel;
}

interface MapDataModel {
  name: string;
  displayName: string;
  count: number;
  stats: StatsModel;
}

interface MapState {
  loadingMap: boolean;
  position: PositionModel;
  mapView: string;
  tooltipContent: Object | null;
  dataset: string;
  mapData: Array<MapDataModel>;
}

const initialState: MapState = {
  loadingMap: false,
  position: {
    coordinates: [0, 0],
    zoom: 1
  },
  mapView: 'CipNS',
  tooltipContent: null,
  dataset: 'All',
  mapData: []
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setLoadingMap: (state, action: PayloadAction<boolean>) => {
      state.loadingMap = action.payload;
    },
    setPosition: (state, action: PayloadAction<PositionModel>) => {
      state.position = action.payload;
    },
    setMapView: (state, action: PayloadAction<string>) => {
      state.mapView = action.payload;
    },
    setTooltipContent: (state, action: PayloadAction<Object | null>) => {
      state.tooltipContent = action.payload;
    },

    setDataset: (state, action: PayloadAction<string>) => {
      state.dataset = action.payload;
    },
    setMapData: (state, action: PayloadAction<Array<any>>) => {
      state.mapData = action.payload;
    }
  }
});

export const { setPosition, setMapView, setTooltipContent, setDataset, setLoadingMap, setMapData } = mapSlice.actions;

export default mapSlice.reducer;
