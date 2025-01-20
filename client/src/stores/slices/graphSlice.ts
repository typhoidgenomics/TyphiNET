import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { defaultDrugsForDrugResistanceGraph } from '../../util/drugs';
interface GraphState {
  countriesForFilter: Array<string>;
  distributionGraphView: string;
  genotypesYearData: Array<any>;
  drugsYearData: Array<any>;
  drugResistanceGraphView: Array<string>,
  frequenciesGraphView: string;
  frequenciesGraphSelectedGenotypes: Array<string>;
  genotypesDrugsData: Array<any>;
  genotypesDrugsData2: Array<any>;
  genotypesDrugClassesData: Array<any>;
  determinantsGraphView: string;
  determinantsGraphDrugClass: string;
  customDropdownMapView: Array<string>;
  starttimeGD: number;
  endtimeGD: number;
  starttimeDRT: number;
  endtimeDRT: number;
  // starttimeF: number;
  // starttimeRD: number;
}

const initialState: GraphState = {
  countriesForFilter: [],
  genotypesYearData: [],
  drugsYearData: [],
  genotypesDrugsData: [],
  genotypesDrugsData2: [],
  genotypesDrugClassesData: [],
  distributionGraphView: 'number',
  drugResistanceGraphView: defaultDrugsForDrugResistanceGraph,
  frequenciesGraphView: 'percentage',
  frequenciesGraphSelectedGenotypes: [],
  determinantsGraphView: 'percentage',
  determinantsGraphDrugClass: 'Ciprofloxacin NS',
  customDropdownMapView: [],
  starttimeGD:0,
  endtimeGD:0,
  starttimeDRT:0,
  endtimeDRT:0,
  // starttimeF:5,
  // starttimeRD:10,
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setCountriesForFilter: (state, action: PayloadAction<Array<string>>) => {
      state.countriesForFilter = action.payload;
    },
    setGenotypesYearData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesYearData = action.payload;
    },
    setDrugsYearData: (state, action: PayloadAction<Array<any>>) => {
      state.drugsYearData = action.payload;
    },
    setDistributionGraphView: (state, action: PayloadAction<string>) => {
      state.distributionGraphView = action.payload;
    },
    setDrugResistanceGraphView: (state, action: PayloadAction<Array<string>>) => {
      state.drugResistanceGraphView = action.payload;
    },
    setFrequenciesGraphView: (state, action: PayloadAction<string>) => {
      state.frequenciesGraphView = action.payload;
    },
    setFrequenciesGraphSelectedGenotypes: (state, action: PayloadAction<Array<string>>) => {
      state.frequenciesGraphSelectedGenotypes = action.payload;
    },
    setGenotypesDrugsData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugsData = action.payload;
    },
    setGenotypesDrugsData2: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugsData2 = action.payload;
    },
    setDeterminantsGraphView: (state, action: PayloadAction<string>) => {
      state.determinantsGraphView = action.payload;
    },
    setDeterminantsGraphDrugClass: (state, action: PayloadAction<string>) => {
      state.determinantsGraphDrugClass = action.payload;
    },
    setGenotypesDrugClassesData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugClassesData = action.payload;
    },
    setCustomDropdownMapView: (state, action: PayloadAction<Array<string>>) => {
      state.customDropdownMapView = action.payload;
    },
    setStarttimeGD: (state, action: PayloadAction<number>) => {
      state.starttimeGD = action.payload;
    },
    setEndtimeGD: (state, action: PayloadAction<number>) => {
      state.endtimeGD = action.payload;
    },
    setStarttimeDRT: (state, action: PayloadAction<number>) => {
      state.starttimeDRT = action.payload;
    },
    setEndtimeDRT: (state, action: PayloadAction<number>) => {
      state.endtimeDRT = action.payload;
    },
    // setStarttimeF: (state, action: PayloadAction<number>) => {
    //   state.starttimeF = action.payload;
    // },
    // setStarttimeRD: (state, action: PayloadAction<number>) => {
    //   state.starttimeRD = action.payload;
    // },
  }
});

export const {
  setCountriesForFilter,
  setDistributionGraphView,
  setGenotypesYearData,
  setDrugsYearData,
  setDrugResistanceGraphView,
  setFrequenciesGraphView,
  setFrequenciesGraphSelectedGenotypes,
  setGenotypesDrugsData,
  setGenotypesDrugsData2,
  setDeterminantsGraphView,
  setDeterminantsGraphDrugClass,
  setGenotypesDrugClassesData,
  setCustomDropdownMapView,
  setStarttimeGD,
  setEndtimeGD,
  setStarttimeDRT,
  setEndtimeDRT,
  // setStarttimeF,
  // setStarttimeRD
} = graphSlice.actions;

export default graphSlice.reducer;
