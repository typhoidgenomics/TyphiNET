import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface GlobalOverviewModel {
  italicLabel: string;
  label: string;
  fullLabel: string
}

interface DashboardState {
  canGetData: boolean;
  globalOverviewLabel: GlobalOverviewModel;
  loadingData: boolean;
  actualCountry: string;
  totalGenomes: number;
  totalGenotypes: number;
  actualGenomes: number;
  actualGenotypes: number;
  timeInitial: number;
  timeFinal: number;
  actualTimeInitial: number | string;
  actualTimeFinal: number | string;
  years: Array<number>;
  genotypesForFilter: Array<string>;
  listPMID: Array<string>
}

const initialState: DashboardState = {
  canGetData: true,
  globalOverviewLabel: { italicLabel: 'Salmonella', label: 'Typhi', fullLabel: 'Salmonella Typhi' },
  loadingData: false,
  actualCountry: 'All',
  totalGenotypes: 0,
  totalGenomes: 0,
  actualGenomes: 0,
  actualGenotypes: 0,
  timeInitial: 0,
  timeFinal: 0,
  actualTimeInitial: '',
  actualTimeFinal: '',
  years: [],
  genotypesForFilter: [],
  listPMID: []
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCanGetData: (state, action: PayloadAction<boolean>) => {
      state.canGetData = action.payload;
    },
    setGlobalOverviewLabel: (state, action: PayloadAction<GlobalOverviewModel>) => {
      state.globalOverviewLabel = action.payload;
    },
    setLoadingData: (state, action: PayloadAction<boolean>) => {
      state.loadingData = action.payload;
    },
    setActualCountry: (state, action: PayloadAction<string>) => {
      state.actualCountry = action.payload;
    },
    setTotalGenotypes: (state, action: PayloadAction<number>) => {
      state.totalGenotypes = action.payload;
    },
    setTotalGenomes: (state, action: PayloadAction<number>) => {
      state.totalGenomes = action.payload;
    },
    setActualGenomes: (state, action: PayloadAction<number>) => {
      state.actualGenomes = action.payload;
    },
    setActualGenotypes: (state, action: PayloadAction<number>) => {
      state.actualGenotypes = action.payload;
    },
    setTimeInitial: (state, action: PayloadAction<number>) => {
      state.timeInitial = action.payload;
    },
    setTimeFinal: (state, action: PayloadAction<number>) => {
      state.timeFinal = action.payload;
    },
    setActualTimeInitial: (state, action: PayloadAction<number>) => {
      state.actualTimeInitial = action.payload;
    },
    setActualTimeFinal: (state, action: PayloadAction<number>) => {
      state.actualTimeFinal = action.payload;
    },
    setYears: (state, action: PayloadAction<Array<number>>) => {
      const years = action.payload

      state.years = years;
      state.timeInitial = years[0];
      state.actualTimeInitial = years[0];
      state.timeFinal = years[years.length - 1];
      state.actualTimeFinal = years[years.length - 1];
    },
    setGenotypesForFilter: (state, action: PayloadAction<Array<string>>) => {
      state.genotypesForFilter = action.payload;
    },
    setListPMID: (state, action: PayloadAction<Array<string>>) => {
      state.listPMID = action.payload;
    },
  }
});

export const {
  setCanGetData,
  setGlobalOverviewLabel,
  setLoadingData,
  setActualCountry,
  setTotalGenotypes,
  setTotalGenomes,
  setActualGenomes,
  setActualGenotypes,
  setTimeInitial,
  setTimeFinal,
  setActualTimeInitial,
  setActualTimeFinal,
  setYears,
  setGenotypesForFilter,
  setListPMID
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
