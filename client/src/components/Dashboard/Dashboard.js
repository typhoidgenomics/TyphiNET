/* eslint-disable react-hooks/exhaustive-deps */
import { MainLayout } from '../Layout';
import { Map } from '../Elements/Map';
import { Footer } from '../Elements/Footer';
import { API_ENDPOINT } from '../../constants';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import {
  setActualGenomes,
  setActualGenotypes,
  setGenotypesForFilter,
  setListPMID,
  setPMID,
  setLoadingData,
  setTotalGenomes,
  setTotalGenotypes,
  setYears
} from '../../stores/slices/dashboardSlice.ts';
import { setMapData, setIfCustom } from '../../stores/slices/mapSlice.ts';
import { Graphs } from '../Elements/Graphs';
import {
  setCountriesForFilter,
  setDrugsYearData,
  setFrequenciesGraphSelectedGenotypes,
  setGenotypesDrugClassesData,
  setGenotypesDrugsData,
  setGenotypesDrugsData2,
  setGenotypesYearData,
  setCustomDropdownMapView,
  setActualGenomesGD,
  setActualGenomesDRT,
} from '../../stores/slices/graphSlice.ts';
import { filterData, filterDataBrush, getYearsData, getMapData, getGenotypesData, getYears} from './filters';
//getCountryDisplayName removed from statement above
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import { About } from '../About';
import countries from '../../util/countries';

export const DashboardPage = () => {
  const [data, setData] = useState([]);

  const dispatch = useAppDispatch();
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const yearsForFilter = useAppSelector((state) => state.dashboard.years);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const endtimeGD = useAppSelector((state) => state.graph.endtimeGD);
  const starttimeGD = useAppSelector((state) => state.graph.starttimeGD);
  const endtimeDRT = useAppSelector((state) => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector((state) => state.graph.starttimeDRT);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);

  // This function is only called once, after the csv is read. It gets all the static and dynamic data
  // that came from the csv file and sets all the data the organism needs to show
  function getInfoFromData(response) {
    const responseData = response.data;
    dispatch(setTotalGenomes(responseData.length));
    dispatch(setActualGenomes(responseData.length));

    const genotypes = [...new Set(responseData.map((x) => x.GENOTYPE))];
    genotypes.sort((a, b) => a.localeCompare(b));
    dispatch(setGenotypesForFilter(genotypes));

    const years = [...new Set(responseData.map((x) => x.DATE))];
    // const countries = [...new Set(responseData.map((x) => getCountryDisplayName(x.COUNTRY_ONLY)))];
    // const listPMID = [...new Set(responseData.map((x) => x.PMID))];
    const PMID = [...new Set(responseData.map((x) => x.PMID))];

    years.sort();
    countries.sort();

    dispatch(setTotalGenotypes(genotypes.length));
    dispatch(setActualGenotypes(genotypes.length));
    dispatch(setYears(years));
    // dispatch(setTimeInitial(years[0]));
    // dispatch(setActualTimeInitial(years[0]));
    // dispatch(setTimeFinal(years[years.length - 1]));
    // dispatch(setActualTimeFinal(years[years.length - 1]));
    dispatch(setCountriesForFilter(countries));
    // dispatch(setListPMID(listPMID));
    dispatch(setPMID(PMID));

    dispatch(setMapData(getMapData({ data: responseData, countries })));

    const genotypesData = getGenotypesData({ data: responseData, genotypes, actualCountry });
    const genotypeDataGreaterThanZero = genotypesData.genotypesDrugsData.filter(x => x.totalCount > 0);

    dispatch(setGenotypesDrugsData(genotypeDataGreaterThanZero));
    dispatch(setGenotypesDrugsData2(genotypesData.genotypesDrugsData));
    dispatch(setFrequenciesGraphSelectedGenotypes(genotypeDataGreaterThanZero.slice(0, 5).map((x) => x.name)));
    dispatch(setCustomDropdownMapView(genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name)));
    dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));

    const yearsData = getYearsData({
      data: responseData,
      years,
      actualCountry
    });

    dispatch(setGenotypesYearData(yearsData.genotypesData));
    dispatch(setDrugsYearData(yearsData.drugsData));

    return responseData;
  }

  // This function reads the csv file
  async function getData() {
    dispatch(setLoadingData(true));

    await axios
      .get(`${API_ENDPOINT}filters/getDataFromCSV`)
      .then((response) => {
        const newData = getInfoFromData(response);
        setData(newData);
      })
      .finally(() => {
        dispatch(setLoadingData(false));
      });
  }

  // This useEffect is called once when the website starts to get info for the dashboard
  useEffect(() => {
    getData();
    dispatch(setIfCustom(false));
  }, []);

  // This useEffect is called once dataset changes
   useEffect(() => {
    // Check if dataset and data are defined before proceeding
    if (dataset !== undefined && data !== undefined && data.length > 0) {
      const getYearsForLocalAndTravel = getYears({data, dataset});
      dispatch(setYears(getYearsForLocalAndTravel));
    }
  }, [dataset, data]);

  // This useEffect is called everytime the main filters are changed, it does not need to read the csv file again.
  // It filters accordingly to the filters give. Is also called when the reset button is pressed.
  useEffect(() => {
    if (data.length > 0 && canGetData) {
      const filters = filterData({ data, dataset, actualTimeInitial, actualTimeFinal, actualCountry });
      dispatch(setActualGenomes(filters.genomesCount));
      dispatch(setActualGenotypes(filters.genotypesCount));
      dispatch(setListPMID(filters.listPMID));

      dispatch(setMapData(getMapData({ data: filters.data, countries: countriesForFilter })));

      const genotypesData = getGenotypesData({
        data: filters.data,
        genotypes: genotypesForFilter,
        actualCountry
      });
      // dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
      const genotypeDataGreaterThanZero = genotypesData.genotypesDrugsData.filter(x => x.totalCount > 0);
      dispatch(setGenotypesDrugsData(genotypeDataGreaterThanZero));
      dispatch(setFrequenciesGraphSelectedGenotypes(genotypeDataGreaterThanZero.slice(0, 5).map((x) => x.name)));
      dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));
      // dispatch(setCustomDropdownMapView(genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name)));

      const yearsData = getYearsData({
        data: filters.data,
        years: yearsForFilter,
        actualCountry
      });
      dispatch(setGenotypesYearData(yearsData.genotypesData));
      dispatch(setDrugsYearData(yearsData.drugsData));
    }
  }, [canGetData, dataset, actualTimeInitial, actualTimeFinal, actualCountry, determinantsGraphDrugClass]);

  useEffect(() =>{
    if (data.length > 0 && canGetData) {
      const filters = filterDataBrush({ data, dataset, starttimeGD, endtimeGD, starttimeDRT, endtimeDRT });
      dispatch(setActualGenomesGD(filters.genomesCountGD));
      dispatch(setActualGenomesDRT(filters.genomesCountDRT));
    }
  },[dataset, starttimeGD, endtimeGD, starttimeDRT, endtimeDRT])
  return (
    <MainLayout>
      <Map />
      <Graphs />
      <About />
      <Footer />
      <ResetButton data={data} />
    </MainLayout>
  );
};
