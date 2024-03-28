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
  currentSliderValue: Number;
  genotypesForFilterSelected: Array<string>;
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
  currentSliderValue: 20,
  genotypesForFilterSelected: [],
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
      setCurrentSliderValue: (state, action: PayloadAction<Number>) => {
      state.currentSliderValue = action.payload;
    },
    setGenotypesForFilterSelected: (state, action: PayloadAction<Array<string>>) => {
      state.genotypesForFilterSelected = action.payload;
    },
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
  setCurrentSliderValue,
  setGenotypesForFilterSelected
} = graphSlice.actions;

export default graphSlice.reducer;
