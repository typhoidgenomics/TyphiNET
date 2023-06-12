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
  genotypesDrugClassesData: Array<any>;
  determinantsGraphView: string;
  determinantsGraphDrugClass: string;
}

const initialState: GraphState = {
  countriesForFilter: [],
  genotypesYearData: [],
  drugsYearData: [],
  genotypesDrugsData: [],
  genotypesDrugClassesData: [],
  distributionGraphView: 'number',
  drugResistanceGraphView: defaultDrugsForDrugResistanceGraph,
  frequenciesGraphView: 'percentage',
  frequenciesGraphSelectedGenotypes: [],
  determinantsGraphView: 'percentage',
  determinantsGraphDrugClass: 'Ciprofloxacin NS',
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
    setDeterminantsGraphView: (state, action: PayloadAction<string>) => {
      state.determinantsGraphView = action.payload;
    },
    setDeterminantsGraphDrugClass: (state, action: PayloadAction<string>) => {
      state.determinantsGraphDrugClass = action.payload;
    },
    setGenotypesDrugClassesData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugClassesData = action.payload;
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
  setDeterminantsGraphView,
  setDeterminantsGraphDrugClass,
  setGenotypesDrugClassesData,
} = graphSlice.actions;

export default graphSlice.reducer;
