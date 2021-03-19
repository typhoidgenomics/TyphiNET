<<<<<<< HEAD
import './index.css';
import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from "react-simple-maps";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import TooltipMaterialUI from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Zoom from '@material-ui/core/Zoom';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ReactTooltip from "react-tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, LineChart, Line, Legend } from 'recharts';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faCrosshairs, faCamera, faTable, faTimes, faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import download from 'downloadjs';
import { svgAsPngUri } from 'save-svg-as-png';
import typhinetLogoImg from '../../assets/img/logo-typhinet.png';
import geography from '../../assets/world-110m.json'
import { API_ENDPOINT } from '../../constants';
import { getColorForGenotype, getColorForAMR, getColorForDrug, getColorForIncType } from '../../util/colorHelper';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import ContactPage from '../contact';
import domtoimage from 'dom-to-image';

const useStyles = makeStyles((theme) => ({
  formControlSelect: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: 120,
    '& label.Mui-focused': {
      color: "rgb(31, 187, 211)",
    },
    '& :not(.Mui-error).MuiInput-underline:after': {
      borderBottomColor: "rgb(31, 187, 211)",
    },
  }
}));

const CustomSlider = withStyles({
  root: {
    color: "rgb(31, 187, 211)"
  },
  thumb: {
    "&.MuiSlider-thumb": {
      "&:not(.MuiSlider-active):focus": {
        boxShadow: "0px 0px 0px 8px rgba(31, 187, 211, 0.16)"
      },
      "&:not(.MuiSlider-active):hover": {
        boxShadow: "0px 0px 0px 8px rgba(31, 187, 211, 0.16)"
      },
      "&.MuiSlider-active": {
        boxShadow: "0px 0px 0px 14px rgba(31, 187, 211, 0.16)"
      },
    },
  },
  valueLabel: {
    fontFamily: "Montserrat",
    fontWeight: 500
  }
})(Slider);

const CustomCircularProgress = withStyles({
  root: {
    color: "rgb(31, 187, 211)",
  }
})(CircularProgress);

const CustomToggleButton = withStyles({
  root: {
    padding: "2px 8px",
    fontFamily: "Montserrat",
    fontWeight: 600
  },
  selected: {
    backgroundColor: 'rgb(31, 187, 211) !important',
    color: "white !important"
  }
})(ToggleButton);

const DashboardPage = () => {
  const classes = useStyles();

  const [controlMapPosition, setControlMapPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [samplesQty, setSamplesQty] = useState(0);

  const [worldMapSamplesData, setWorldMapSamplesData] = useState([]);
  const [worldMapComplementaryData, setWorldMapComplementaryData] = useState({});
  const [worldMapGenotypesData, setWorldMapGenotypesData] = useState([]);
  const [worldMapH58Data, setWorldMapH58Data] = useState([]);
  const [worldMapMDRData, setWorldMapMDRData] = useState([]);
  const [worldMapXDRData, setWorldMapXDRData] = useState([]);
  const [worldMapDCSData, setWorldMapDCSData] = useState([]);
  const [worldMapAZITHData, setWorldMapAZITHData] = useState([]);
  const [worldMapCIPIData, setWorldMapCIPIData] = useState([]);
  const [worldMapCIPRData, setWorldMapCIPRData] = useState([]);
  const [worldMapDrugsData, setWorldMapDrugsData] = useState([]);
  const [worldMapAmrProfilesData, setWorldMapAmrProfilesData] = useState([]);
  const [worldMapPlasmidIncompatibilityTypeData, setWorldMapPlasmidIncompatibilityTypeData] = useState([]);

  const [captureControlMapInProgress, setCaptureControlMapInProgress] = useState(false)
  const [captureControlChartRFWGInProgress, setCaptureControlChartRFWGInProgress] = useState(false)
  const [captureControlChartDRTInProgress, setCaptureControlChartDRTInProgress] = useState(false)
  const [captureControlChartGDInProgress, setCaptureControlChartGDInProgress] = useState(false)
  const [captureControlChartRFWAGInProgress, setCaptureControlChartRFWAGInProgress] = useState(false)

  const [tooltipContent, setTooltipContent] = useState(null);

  const [timePeriodRange, setTimePeriodRange] = React.useState([1905, 2019]);
  const [actualTimePeriodRange, setActualTimePeriodRange] = React.useState([1905, 2019]);
  const [countriesForFilter, setCountriesForFilter] = React.useState(['All']);
  const [actualCountry, setActualCountry] = useState("All");
  const [populationStructureFilter, setPopulationStructureFilter] = React.useState(1);
  const amrClassesForFilter = [/*"AMR Profiles", */"Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (DCS)", "Sulphonamides", "Tetracyclines", "Trimethoprim"]
  const [amrClassFilter, setAmrClassFilter] = React.useState(amrClassesForFilter[0])

  const [drugTrendsChartData, setDrugTrendsChartData] = useState([])
  const [drugsAndGenotypesChartData, setDrugsAndGenotypesChartData] = useState([])
  const [chartMaxHeight, setChartMaxHeight] = useState(0)
  const [chartMaxWidth, setChartMaxWidth] = useState(0)
  const [populationStructureChartData, setPopulationStructureChartData] = useState([])
  const [amrClassChartData, setAmrClassChartData] = useState([])

  const [mapView, setMapView] = React.useState('Dominant Genotype');
  const [dataset, setDataset] = React.useState('full');
  const [totalGenomes, setTotalGenomes] = useState([])
  const [actualGenomes, setActualGenomes] = useState([])
  const [totalGenotypes, setTotalGenotypes] = useState([])
  const [actualGenotypes, setActualGenotypes] = useState([])

  const [contactModalVisible, setContactModalVisible] = useState(false)

  const isDesktop = window.innerWidth > 767
  const isMobile = window.innerWidth < 500

  const genotypes = [
    '0.0.1', '0.0.2', '0.0.3', '0.1',
    '0.1.1', '0.1.2', '0.1.3', '1.1.1',
    '1.1.2', '1.1.3', '1.2', '1.2.1',
    '2', '2.0.1', '2.0.2', '2.1',
    '2.1.1', '2.1.3', '2.1.5', '2.1.6',
    '2.1.7', '2.1.8', '2.1.9', '2.2',
    '2.2.1', '2.2.2', '2.2.3', '2.2.4',
    '2.3.1', '2.3.2', '2.3.3', '2.3.4',
    '2.3.5', '2.4', '2.4.1', '2.5',
    '2.5.1', '3', '3.0.1', '3.0.2',
    '3.1', '3.1.1', '3.1.2', '3.2',
    '3.2.1', '3.2.2', '3.3', '3.3.1',
    '3.3.2', '3.3.2.Bd1', '3.3.2.Bd2', '3.4',
    '3.5', '3.5.1', '3.5.2', '3.5.3',
    '3.5.4', '4.1', '4.2', '4.2.1',
    '4.2.2', '4.2.3', '4.3.1', '4.3.1.1',
    '4.3.1.1.P1', '4.3.1.2', '4.3.1.3'].sort((a, b) => a.localeCompare(b));
  useEffect(() => {
    axios.get(`${API_ENDPOINT}filters/getYearLimits`)
      .then((res) => {
        let limits = res.data
        setTimePeriodRange([limits.min, limits.max])
        setActualTimePeriodRange([limits.min, limits.max])
      })
  }, [])

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      axios.get(`${API_ENDPOINT}filters/all/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
        .then((res) => {
          var response = res.data

          response['Dem. Rep. Congo'] = response['Democratic Republic of Congo']
          delete response['Democratic Republic of Congo']
          response['Central African Rep.'] = response['Central African Republic']
          delete response['Central African Republic']
          response["Côte d'Ivoire"] = response['Ivory Coast']
          delete response['Ivory Coast']
          response["Timor-Leste"] = response['East Timor']
          delete response['East Timor']

          setWorldMapComplementaryData(response)
        })
    }, 500)
    return () => clearTimeout(timeOutId);
  }, [actualTimePeriodRange, dataset])

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      let filter;

      if (populationStructureFilter === 1) {
        filter = 2
      } else {
        filter = 3 /* H58 and Non-H58 */
      }

      let genotypeChartResponse = await axios.get(`${API_ENDPOINT}filters/${filter}/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
      parseDataForGenotypeChart(genotypeChartResponse.data)

      if (actualCountry === "All") {
        parseDataForCountryMap(genotypeChartResponse.data)
      }
      else {
        let response = await axios.get(`${API_ENDPOINT}filters/${filter}/all/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
        parseDataForCountryMap(response.data)
      }

      let drugTrendsChartResponse = await axios.get(`${API_ENDPOINT}filters/drugTrendsChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
      parseDataForDrugTrendsChart(drugTrendsChartResponse.data)

      let classChartResponse = await axios.get(`${API_ENDPOINT}filters/amrClassChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${amrClassFilter}/${dataset}`)
      parseDataForAmrClassChart(classChartResponse.data)

    }, 500);
    return () => clearTimeout(timeOutId);
  }, [populationStructureFilter, actualTimePeriodRange, actualCountry, dataset, amrClassFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const parseDataForGenotypeChart = (data) => {
    var finalPopulationStructureChartData = [];

    var genomes = data;
    var genotypes = [];

    data.forEach((entry) => {
      if (!genotypes.some(g => g === entry.GENOTYPE)) {
        genotypes.push(entry.GENOTYPE)
      }

      /* POPULATION STRUCTURE CHART GENERATION */
      if (populationStructureFilter === 1) { /* Genotype */
        if (!finalPopulationStructureChartData.some(e => e.name === entry.YEAR)) {
          finalPopulationStructureChartData.push({
            name: entry.YEAR,
            [entry.GENOTYPE]: 1
          })
        } else {
          let year = finalPopulationStructureChartData.find(e => e.name === entry.YEAR);
          let yearIndex = finalPopulationStructureChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry.GENOTYPE] === undefined) {
            year[entry.GENOTYPE] = 1
          } else {
            year[entry.GENOTYPE] = year[entry.GENOTYPE] + 1
          }
          finalPopulationStructureChartData[yearIndex] = year;
        }
      } else { /* H58 / Non-H58 */
        if (entry['GENOTYPE_SIMPLE'] === 'H58' || entry['GENOTYPE_SIMPLE'] === 'Non-H58')
          if (!finalPopulationStructureChartData.some(e => e.name === entry['GENOTYPE_SIMPLE'])) {
            finalPopulationStructureChartData.push({
              name: entry['GENOTYPE_SIMPLE'],
              [entry.GENOTYPE]: 1
            })
          } else {
            let genotypeSimple = finalPopulationStructureChartData.find(e => e.name === entry['GENOTYPE_SIMPLE']);
            let genotypeSimpleIndex = finalPopulationStructureChartData.findIndex(e => e.name === entry['GENOTYPE_SIMPLE']);

            if (genotypeSimple[entry.GENOTYPE] === undefined) {
              genotypeSimple[entry.GENOTYPE] = 1
            } else {
              genotypeSimple[entry.GENOTYPE] = genotypeSimple[entry.GENOTYPE] + 1
            }
            finalPopulationStructureChartData[genotypeSimpleIndex] = genotypeSimple;
          }
      }
    })

    if (totalGenomes.length === 0)
      setTotalGenomes(genomes)

    if (totalGenotypes.length === 0){
      if (actualCountry === "All") {
        axios.get(`${API_ENDPOINT}filters/totalGenotypes`)
        .then((res) => {
          setTotalGenotypes(res.data.genotypes)
        })
      }else{
        setTotalGenotypes(genotypes)
      }
    }

    setActualGenomes(genomes)
    setActualGenotypes(genotypes)

    finalPopulationStructureChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "name")
          sum += entry[1];
      })
      data.total = sum;
    })

    if (!arraysEqual(finalPopulationStructureChartData, populationStructureChartData))
      setPopulationStructureChartData(finalPopulationStructureChartData)

    let populationStructureChartSums = []
    finalPopulationStructureChartData.forEach((year) => {
      let sum = 0
      let yearArray = Object.entries(year)
      yearArray.forEach((_year) => {
        if (_year[0] !== "name" && _year[0] !== "total")
          sum += _year[1]
      })
      populationStructureChartSums.push({
        year: year.name,
        sum
      })
    })

    if (populationStructureChartSums.length > 0) {
      let highestSum = populationStructureChartSums.sort((a, b) => b.sum - a.sum)[0].sum;

      if (populationStructureFilter === 1) {
        if (highestSum > chartMaxHeight)
          setChartMaxHeight(Math.ceil(highestSum / 100) * 100)
      } else {
        if (highestSum > chartMaxWidth)
          setChartMaxWidth(Math.ceil(highestSum / 100) * 100)
      }
    }
  }

  const parseDataForCountryMap = (data) => {
    let finalCountries = [];

    let samplesData = [], genotypesData = [], h58Data = [], mdrData = [], xdrData = [], drugsData = [], amrData = [], incTypesData = [], dcsData = [], azithData = [], cipIData = [], cipRData = [];

    const countData = (array, elementToCount, parentName, childName) => {
      let temp = []
      array.forEach(entry => {
        if (!temp.some(e => e.name === entry['COUNTRY_ONLY'])) {
          temp.push({
            name: entry['COUNTRY_ONLY'],
            displayName: entry['COUNTRY_ONLY'],
            total: 1,
            [parentName]: [{
              [childName]: entry[elementToCount],
              count: 1
            }]
          })
        } else {
          let country = temp.find(e => e.name === entry['COUNTRY_ONLY']);
          let countryIndex = temp.findIndex(e => e.name === entry['COUNTRY_ONLY']);

          if (!country[parentName].some(e => e[childName] === entry[elementToCount])) {
            country[parentName].push({
              [childName]: entry[elementToCount],
              count: 1
            })
          } else {
            let parent = country[parentName].find(e => e[childName] === entry[elementToCount]);
            let index = country[parentName].findIndex(e => e[childName] === entry[elementToCount]);
            parent.count = parent.count + 1
            country[parentName][index] = parent
          }
          country.total = country.total + 1

          temp[countryIndex] = country;
        }
      })

      let congoCountryIndex = temp.findIndex(e => e.name === 'Democratic Republic of Congo');
      if (congoCountryIndex !== -1)
        temp[congoCountryIndex].displayName = 'Dem. Rep. Congo'

      let centralAfricanRepublicCountryIndex = temp.findIndex(e => e.name === 'Central African Republic');
      if (centralAfricanRepublicCountryIndex !== -1)
        temp[centralAfricanRepublicCountryIndex].displayName = 'Central African Rep.'

      let ivoryCoastCountryIndex = temp.findIndex(e => e.name === "Ivory Coast");
      if (ivoryCoastCountryIndex !== -1)
        temp[ivoryCoastCountryIndex].displayName = "Côte d'Ivoire"

      let timorLesteCountryIndex = temp.findIndex(e => e.name === "East Timor");
      if (timorLesteCountryIndex !== -1)
        temp[timorLesteCountryIndex].displayName = "Timor-Leste"

      temp.forEach((country) => {
        country[parentName].sort((a, b) => b.count - a.count);
      })
      temp.sort((a, b) => a.name.localeCompare(b.name));

      return temp
    }

    data.forEach((entry) => {
      if (!finalCountries.some(e => e === entry['COUNTRY_ONLY']) && entry['COUNTRY_ONLY'] !== "-" && entry['COUNTRY_ONLY'] !== "")
        finalCountries.push(entry['COUNTRY_ONLY'])

      if (!samplesData.some(e => e.name === entry['COUNTRY_ONLY'])) {
        samplesData.push({
          name: entry['COUNTRY_ONLY'],
          displayName: entry['COUNTRY_ONLY'],
          count: 1
        })
      } else {
        let country = samplesData.find(e => e.name === entry['COUNTRY_ONLY']);
        let countryIndex = samplesData.findIndex(e => e.name === entry['COUNTRY_ONLY']);
        country.count = country.count + 1
        samplesData[countryIndex] = country;
      }
    })

    if (!arraysEqual(samplesData, worldMapSamplesData)) {
      let congoCountryIndex = samplesData.findIndex(e => e.name === 'Democratic Republic of Congo');
      if (congoCountryIndex !== -1)
        samplesData[congoCountryIndex].displayName = 'Dem. Rep. Congo'

      let centralAfricanRepublicCountryIndex = samplesData.findIndex(e => e.name === 'Central African Republic');
      if (centralAfricanRepublicCountryIndex !== -1)
        samplesData[centralAfricanRepublicCountryIndex].displayName = 'Central African Rep.'

      let ivoryCoastCountryIndex = samplesData.findIndex(e => e.name === "Ivory Coast");
      if (ivoryCoastCountryIndex !== -1)
        samplesData[ivoryCoastCountryIndex].displayName = "Côte d'Ivoire"

      let timorLesteCountryIndex = samplesData.findIndex(e => e.name === "East Timor");
      if (timorLesteCountryIndex !== -1)
        samplesData[timorLesteCountryIndex].displayName = "Timor-Leste"

      setWorldMapSamplesData(samplesData)
      setSamplesQty(
        Math.ceil((
          samplesData.length > 0 ? samplesData.sort((a, b) => b.count - a.count)[0].count : 0
        ) / 50) * 50
      )
    }

    finalCountries.sort((a, b) => a.localeCompare(b));
    finalCountries.unshift("All");
    setCountriesForFilter(finalCountries)

    if (!finalCountries.includes(actualCountry))
      setActualCountry("All")

    genotypesData = countData(data, "GENOTYPE", "genotypes", "lineage")
    if (!arraysEqual(genotypesData, worldMapGenotypesData))
      setWorldMapGenotypesData(genotypesData)

    h58Data = countData(data, "GENOTYPE_SIMPLE", "genotypes", "type")
    h58Data.forEach(country => {
      country.genotypes.forEach((g, index) => {
        let percentage = ((g.count / country.total) * 100)
        if (Math.round(percentage) !== percentage) {
          percentage = percentage.toFixed(2)
        }
        g.percentage = percentage
      })
    })
    if (!arraysEqual(h58Data, worldMapH58Data))
      setWorldMapH58Data(h58Data)

    mdrData = countData(data, "MDR", "MDRs", "type")
    mdrData.forEach(country => {
      country.MDRs.forEach((mdr, index) => {
        if (mdr.type === "MDR") {
          let percentage = ((mdr.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = mdr.count;
        }
      })
      if (country.percentage === undefined) {
        country.percentage = parseFloat(0)
      }
      if (country.count === undefined) {
        country.count = 0
      }
    })
    if (!arraysEqual(mdrData, worldMapMDRData))
      setWorldMapMDRData(mdrData)

    xdrData = countData(data, "XDR", "XDRs", "type")
    xdrData.forEach(country => {
      country.XDRs.forEach((xdr, index) => {
        if (xdr.type === "XDR") {
          let percentage = ((xdr.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = xdr.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(xdrData, worldMapXDRData))
      setWorldMapXDRData(xdrData)

    dcsData = countData(data, "DCS", "DCSs", "type")
    dcsData.forEach(country => {
      country.DCSs.forEach((dcs, index) => {
        if (dcs.type === "DCS") {
          let percentage = ((dcs.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = dcs.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(dcsData, worldMapDCSData))
      setWorldMapDCSData(dcsData)

    azithData = countData(data, "Azith", "AZs", "type")
    azithData.forEach(country => {
      country.AZs.forEach((az, index) => {
        if (az.type === "AzithR") {
          let percentage = ((az.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = az.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(azithData, worldMapAZITHData))
      setWorldMapAZITHData(azithData)

    cipIData = countData(data, "CipI", "CipIs", "type")
    cipIData.forEach(country => {
      country.CipIs.forEach((cipIs, index) => {
        if (cipIs.type === "CipI") {
          let percentage = ((cipIs.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = cipIs.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(cipIData, worldMapCIPIData))
      setWorldMapCIPIData(cipIData)

    cipRData = countData(data, "CipR", "CipRs", "type")
    cipRData.forEach(country => {
      country.CipRs.forEach((cipRs, index) => {
        if (cipRs.type === "CipR") {
          let percentage = ((cipRs.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = cipRs.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(cipRData, worldMapCIPRData))
      setWorldMapCIPRData(cipRData)

    let dataForCountingDrugs = []
    data.forEach(entry => {
      entry.DRUGS.forEach(drug => {
        dataForCountingDrugs.push({
          ...entry,
          DRUG: drug,
        })
      })
    })
    drugsData = countData(dataForCountingDrugs, "DRUG", "drugs", "name");
    if (!arraysEqual(drugsData, worldMapDrugsData))
      setWorldMapDrugsData(drugsData)

    amrData = countData(data, "AMR", "amrProfiles", "name")
    if (!arraysEqual(amrData, worldMapAmrProfilesData))
      setWorldMapAmrProfilesData(amrData)

    incTypesData = countData(data, "IncTypes", "incTypes", "type")
    incTypesData.forEach(country => {
      country.incTypes = country.incTypes.filter(g => g.type !== "")
    })
    if (!arraysEqual(incTypesData, worldMapPlasmidIncompatibilityTypeData))
      setWorldMapPlasmidIncompatibilityTypeData(incTypesData)
  }

  const parseDataForAmrClassChart = (data) => {
    let finalChartData = []
    let maxSum = 0
    let totalSum = {}
    data.forEach((entry) => {
      if (!finalChartData.some(e => e.genotype === entry.GENOTYPE)) {
        finalChartData.push({
          genotype: entry.GENOTYPE,
          [entry.GENE]: 1
        })
      } else {
        let genotype = finalChartData.find(e => e.genotype === entry.GENOTYPE);
        let genotypeIndex = finalChartData.findIndex(e => e.genotype === entry.GENOTYPE);

        if (genotype[entry.GENE] === undefined) {
          genotype[entry.GENE] = 1
        } else {
          genotype[entry.GENE] = genotype[entry.GENE] + 1
        }
        finalChartData[genotypeIndex] = genotype;
      }
      if (entry.GENOTYPE !== "") {
        if (!(entry.GENE in totalSum)) {
          totalSum[entry.GENE] = 1
        } else {
          totalSum[entry.GENE] = totalSum[entry.GENE] + 1
        }
      }
    })
    delete totalSum[""]

    finalChartData.sort((a, b) => a.genotype.localeCompare(b.genotype));
    finalChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "genotype") {
          let errorMargin = Math.ceil(entry[1] * 0.2) // 20%
          let lowerValue = errorMargin > entry[1] ? entry[1] : errorMargin;

          if (entry[1] === 1)
            lowerValue = 1

          if (entry[1] === 0)
            lowerValue = 0

          data[`error-${entry[0]}`] = [lowerValue, errorMargin]

          sum += entry[1];
          if (entry[1] > maxSum) {
            maxSum = entry[1]
          }
        }
      })
      data.total = sum;
    })
    finalChartData = finalChartData.filter(g => g.genotype !== undefined && g.genotype !== "0")
    let top10 = []
    finalChartData.forEach(element => {
      if (top10.length < 10) {
        top10.push(element)
      } else {
        top10.sort(function (a, b) {
          if (a.total === b.total && a.genotype > b.genotype)
            return -1
          return a.total > b.total ? -1 : 1
        })
        if (element.total === top10[9].total) {
          if (element.genotype > top10[9].genotype) {
            top10[9] = element
          }
        }
        if (element.total > top10[9].total) {
          top10[9] = element
        }
      }
    })
    top10.sort(function (a, b) {
      if (a.total === b.total && a.genotype > b.genotype)
        return -1
      return a.total > b.total ? -1 : 1
    })
    top10.push({ maxSum: Math.ceil(top10[0].total / 50) * 50, totalSum: totalSum })
    if (amrClassFilter !== "Co-trimoxazole") {
      if (!arraysEqual(amrClassChartData, top10))
        setAmrClassChartData(top10)
    } else {
      if (!arraysEqual(amrClassChartData, top10))
        setAmrClassChartData(top10)
    }
  }

  const parseDataForDrugTrendsChart = (data) => {
    let finalDrugTrendsChartData = []
    let finalDrugsAndGenotypesChartData = []
    let totalSum = {}
    let allDrugs = data[data.length - 1]
    data = data.slice(0, data.length - 1)

    data.forEach((entry) => {
      if (!finalDrugTrendsChartData.some(e => e.name === entry.YEAR)) {
        finalDrugTrendsChartData.push({
          name: entry.YEAR,
          [entry.DRUG]: 1
        })
      } else {
        let year = finalDrugTrendsChartData.find(e => e.name === entry.YEAR);
        let yearIndex = finalDrugTrendsChartData.findIndex(e => e.name === entry.YEAR);

        if (year[entry.DRUG] === undefined) {
          year[entry.DRUG] = 1
        } else {
          year[entry.DRUG] = year[entry.DRUG] + 1
        }
        finalDrugTrendsChartData[yearIndex] = year;
      }

      if (!finalDrugsAndGenotypesChartData.some(e => e.name === entry.GENOTYPE)) {
        finalDrugsAndGenotypesChartData.push({
          name: entry.GENOTYPE,
          [entry.DRUG]: 1
        })
      } else {
        let genotype = finalDrugsAndGenotypesChartData.find(e => e.name === entry.GENOTYPE);
        let genotypeIndex = finalDrugsAndGenotypesChartData.findIndex(e => e.name === entry.GENOTYPE);

        if (genotype[entry.DRUG] === undefined) {
          genotype[entry.DRUG] = 1
        } else {
          genotype[entry.DRUG] = genotype[entry.DRUG] + 1
        }
        finalDrugsAndGenotypesChartData[genotypeIndex] = genotype;
      }

      if (!(entry.DRUG in totalSum)) {
        totalSum[entry.DRUG] = 1
      } else {
        totalSum[entry.DRUG] = totalSum[entry.DRUG] + 1
      }
    })
    finalDrugTrendsChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "name")
          sum += entry[1];
      })
      data.total = sum;
    })

    finalDrugsAndGenotypesChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "name")
          sum += entry[1];
      })
      data.total = sum;
    })

    finalDrugTrendsChartData.sort((a, b) => a.name.localeCompare(b.name))
    finalDrugTrendsChartData.push({ totalSum: allDrugs })

    finalDrugsAndGenotypesChartData.sort((a, b) => b.total - a.total)
    finalDrugsAndGenotypesChartData = finalDrugsAndGenotypesChartData.slice(0, finalDrugsAndGenotypesChartData.length >= 5 ? 5 : finalDrugsAndGenotypesChartData.length)
    finalDrugsAndGenotypesChartData.push({ totalSum: totalSum })

    if (!arraysEqual(finalDrugTrendsChartData, drugTrendsChartData))
      setDrugTrendsChartData(finalDrugTrendsChartData)

    if (!arraysEqual(finalDrugsAndGenotypesChartData, drugsAndGenotypesChartData)) {
      setDrugsAndGenotypesChartData(finalDrugsAndGenotypesChartData)
    }
  }

  function arraysEqual(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  const mapSamplesColorScale = scaleLinear()
    .domain([1, samplesQty / 5, 2 * (samplesQty / 5), 3 * (samplesQty / 5), 4 * (samplesQty / 5), samplesQty])
    .range(["#4575b4", "#91bfdb", "#e0f3f8", "#fee090", "#fc8d59", "#d73027"]);

  const mapRedColorScale = scaleLinear()
    .domain([0, 50, 100])
    .range(["#ffebee", "#f44336", "#b71c1c"]);

  const tooltip = (positionY, width1, width2, sort, wrapperS, stroke, chart = -1) => {
    return (
      <Tooltip
        position={{ y: positionY, x: isMobile ? -20: 0 }}
        wrapperStyle={wrapperS}
        content={({ active, payload, label }) => {
          if (payload !== null) {
            if (sort) {
              payload.sort((a, b) => b.value - a.value)
              payload = payload.reverse()
            }
            if (active) {
              return (
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                  <div style={{ height: 14 }} />
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: width1, flexDirection: "" }}>
                    {payload.reverse().map((item, index) => {
                      let percentage = ((item.value / item.payload.total) * 100)
                      if (chart === 0) {
                        percentage = ((item.value / drugsAndGenotypesChartData[drugsAndGenotypesChartData.length - 1].totalSum[item.name]) * 100)
                      } else if (chart === 1) {
                        percentage = ((item.value / drugTrendsChartData[drugTrendsChartData.length - 1].totalSum[item.payload.name]) * 100)
                      }
                      if (Math.round(percentage) !== percentage)
                        percentage = percentage.toFixed(2)
                      return (
                        <div key={index + item} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: width2, marginBottom: 8 }}>
                          <div style={{ backgroundColor: stroke ? item.stroke : item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flex: "none" }} />
                          <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, width: "95%" }}>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14, wordWrap: 'break-word', width: isMobile ? '80%' : '100%' }}>{item.name}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 10 }}>{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }
          }
          return null;
        }}
      />
    )
  }

  const plotPopulationStructureChart = () => {

    if (populationStructureFilter === 1) { /* Genotype */
      let maxH = 0
      for (let index = 0; index < populationStructureChartData.length; index++) {
        if (populationStructureChartData[index].total > maxH) {
          maxH = populationStructureChartData[index].total
        }
      }
      maxH = Math.ceil(maxH / 50) * 50
      return (
        <ResponsiveContainer width="100%">
          <BarChart
            height={300}
            data={populationStructureChartData}
            margin={{
              top: 20, left: -20, bottom: 5, right: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval="preserveStartEnd" />
            <YAxis domain={[0, maxH]} />
            <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />

            {tooltip(300, window.innerWidth > 600?  550 : 250, window.innerWidth > 600 ? "20%" : "50%", false, { zIndex: 100, top: 20 }, false)}
            {genotypes.map((item) => <Bar dataKey={item} stackId="a" fill={getColorForGenotype(item)} />)}
          </BarChart>
        </ResponsiveContainer>
      )
    } else { /* H58 and Non-H58 */
      return (
        <ResponsiveContainer width="90%">
          <BarChart
            width={500}
            height={300}
            data={populationStructureChartData}
            margin={{
              top: 20, left: 20, bottom: 5, right: 0
            }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type={"number"} domain={[0, chartMaxWidth]} />
            <YAxis dataKey="name" type={"category"} domain={[0, 50]}/>
            {tooltip(300, window.innerWidth > 600?  700 : 250, window.innerWidth > 600 ? "14.28%" : "50%", false, { zIndex: 100 }, false)}
            {genotypes.map((item) => <Bar dataKey={item} stackId="a" barSize={50} fill={getColorForGenotype(item)} />)}
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }

  const armClassFilterComponent = (info) => {
    let maxSum = 0
    if (amrClassChartData[amrClassChartData.length - 1] !== undefined) {
      maxSum = amrClassChartData[amrClassChartData.length - 1].maxSum
    }

    const data = amrClassChartData.slice(0, amrClassChartData.length - 1)
    return (
      <ResponsiveContainer width="90%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20, left: -20, bottom: 5, right: 0
          }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="genotype" type={"category"} interval={isMobile ? 1 : 0} tick={{ fontSize: info.fontsize }} />
          <YAxis domain={[0, maxSum]} type={"number"} />
          <Brush dataKey="genotype" height={20} stroke={"rgb(31, 187, 211)"} />

          {amrClassChartTooltip()}
          {info.bars.map((item) => {
            return (
              <Bar dataKey={item[0]} fill={item[1]} stackId="a" barSize={30} />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const plotAmrClassChart = () => {
    switch (amrClassFilter) {
      case 'Azithromycin':
        return (armClassFilterComponent({
          left: -5, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['acrB_R717Q', "#addd8e", "error-acrB_R717Q"],
            ['ereA', "#9e9ac8", "error-ereA"]]
        }))
      case 'Fluoroquinolones (DCS)':
        return (armClassFilterComponent({
          left: 10, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
            ['3_QRDR', "rgb(198,127,251)", "error-3_QRDR"],
            ['2_QRDR', "rgb(70,191,195)", "error-2_QRDR"],
            ['1_QRDR + qnrS', "rgb(125,172,32)", "error-1_QRDR + qnrS"],
            ['1_QRDR', "rgb(244,119,112)", "error-1_QRDR"]]
        }))
      case 'Chloramphenicol':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['cmlA', "#addd8e", "error-cmlA"],
            ['catA1', "#9e9ac8", "error-catA1"]]
        }))
      case 'Ampicillin':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['blaTEM-1D', "#addd8e", "error-blaTEM-1D"]]
        }))
      case 'Sulphonamides':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['sul2', "#ffeda0", "error-sul2"],
            ['sul1', "#fd8d3c", "error-sul1"]]
        }))
      case 'Trimethoprim':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
            ['dfrA7', "#addd8e", "error-dfrA7"],
            ['dfrA5', "#9e9ac8", "error-dfrA5"],
            ['dfrA18', "#6baed6", "error-dfrA18"],
            ['dfrA17', "#7a0177", "error-dfrA17"],
            ['dfrA15', "#54278f", "error-dfrA15"],
            ['dfrA14', "#a50f15", "error-dfrA14"],
            ['dfrA1', "red", "error-dfrA1"]]
        }))
      case 'Co-trimoxazole':
        let cotrim = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"];
        let colors1 = ["#ffeda0", "#fd8d3c", "#addd8e", "#9e9ac8", "#6baed6", "#7a0177", "#54278f"]
        let colors2 = ["#a50f15", "#6a5acd", "#f1b6da", "#fb8072", "#4682b4", "#2e8b57", "#98fb98"]
        let bars = []

        for (const index in cotrim) {
          bars.push([cotrim[index] + "-sul1", colors1[index], "error-" + cotrim[index] + "-sul1"])
          bars.push([cotrim[index] + "-sul2", colors2[index], "error-" + cotrim[index] + "-sul2"])
        }

        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: bars
        }))
      case 'Tetracyclines':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['tetA(D)', "#addd8e", "error-tetA(D)"],
            ['tetA(C)', "#9e9ac8", "error-tetA(C)"],
            ['tetA(B)', "#6baed6", "error-tetA(B)"],
            ['tetA(A)', "#a50f15", "error-tetA(A)"]]
        }))
      case 'AMR Profiles':
        return (armClassFilterComponent({
          left: isDesktop ? 12 : -30, fontsize: isDesktop ? 14 : 5, strokeWidth: 0.5, width: 3, bars: [
            ['No AMR detected', getColorForAMR('No AMR detected'), "error-No AMR detected"],
            ['MDR_DCS', getColorForAMR('MDR_DCS'), "error-MDR_DCS"],
            ['MDR', getColorForAMR('MDR'), "error-MDR"],
            ['DCS', getColorForAMR('DCS'), "error-DCS"],
            ['AzithR_MDR', getColorForAMR('AzithR_MDR'), "error-AzithR_MDR"],
            ['AzithR_DCS', getColorForAMR('AzithR_DCS'), "error-AzithR_DCS"],
            ['AzithR_DCS_MDR', getColorForAMR('AzithR_DCS_MDR'), "error-AzithR_DCS_MDR"],
            ['XDR', getColorForAMR('XDR'), "error-XDR"],
            ['AMR', getColorForAMR('AMR'), "error-AMR"],
            ['AMR_DCS', getColorForAMR('AMR_DCS'), "error-AMR_DCS"]]
        }))
      case 'ESBL':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['blaSHV-12', "#addd8e", "error-blaSHV-12"],
            ['blaOXA-7', "#9e9ac8", "error-blaOXA-7"],
            ['blaCTX-M-15_23', "#6baed6", "error-blaCTX-M-15_23"]]
        }))
      default:
        return null;
    }
  }

  const amrClassChartTooltip = () => {
    return (
      <Tooltip
        position={{ x: 0 }}
        wrapperStyle={{ zIndex: 100, top: 50 }}
        allowEscapeViewBox={{ x: true, y: true }}
        content={({ active, payload, label }) => {
          if (payload !== null) {
            if (active) {
              return (
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                  <div style={{ height: 14 }} />
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 250 }}>
                    {payload.reverse().map((item, index) => {
                      let percentage = ((item.value / amrClassChartData[amrClassChartData.length - 1].totalSum[item.name]) * 100)
                      if (Math.round(percentage) !== percentage)
                        percentage = percentage.toFixed(2)
                      return (
                        <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "33.33%", marginBottom: 8 }}>
                          <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flex: "none" }} />
                          <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, wordWrap: "break-word", overflowX: "hidden" }}>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 10 }}>{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }
          }

          return null;
        }}
      />
    )
  }

  const plotDrugTrendsChart = () => {
    return (
      <ResponsiveContainer width="100%">
        <LineChart
          height={300}
          data={drugTrendsChartData.slice(0, drugTrendsChartData.length - 1)}
          margin={{
            top: 20, left: -20, bottom: 5, right: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={"preserveStartEnd"} />
          <YAxis />
          <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />

          <Legend
            content={(props) => {
              const { payload } = props;
              return (
                <div style={{display: "flex", flexDirection: "row", justifyContent: 'flex-end'}}>
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", width: isMobile ? "93%" : "85%", justifyContent: "space-between", marginTop: 10, paddingLeft: isDesktop ? 92 : 35, paddingRight: isDesktop ? 32 : 0 }}>
                    {payload.map((entry, index) => {
                      const { dataKey, color } = entry
                      return (
                        <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: isDesktop ? "30%" : "50%", marginBottom: 4 }}>
                          <div style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, paddingLeft: 4, width: '90%' }}>{dataKey}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }}
          />
          {tooltip(150, isMobile ? 250 : 325, "50%", true, { zIndex: 100, top: 175}, true, 1)}
          {amrClassesForFilter.slice(1).map((item) => (<Line dataKey={item} stroke={getColorForDrug(item)} connectNulls type="monotone" />))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const plotDrugsAndGenotypesChart = () => {
    return (
      <ResponsiveContainer width="90%">
        <BarChart
          height={300}
          data={drugsAndGenotypesChartData.slice(0, drugsAndGenotypesChartData.length - 1)}
          margin={{
            top: 20, left: -5, bottom: 5, right: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} tick={{ fontSize: isDesktop ? 16 : 8 }} />
          <YAxis />
          <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />
          <Legend
            content={(props) => {
              const { payload } = props;
              return (
                <div style={{display: "flex", flexDirection: "row", justifyContent: isMobile ? '' : 'flex-end'}}>
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", width: isMobile ? "100%" : "85%", justifyContent: "space-between", marginLeft: isDesktop ? 60 : 0, marginTop: 8, paddingLeft: isDesktop ? 32 : 0, paddingRight: isDesktop ? 32 : 0 }}>
                    {payload.map((entry, index) => {
                      const { dataKey, color } = entry
                      return (
                        <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: isDesktop ? "30%" : "50%", marginBottom: 4 }}>
                          <div style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, marginLeft: 4 }}>{dataKey}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }}
          />
          {tooltip(150, isMobile ? 250 : 325, "50%", false, { zIndex: 100, top: 160 }, false, 0)}
          {amrClassesForFilter.slice(1).map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const getPopulationStructureChartLabel = () => {
    if (populationStructureFilter === 1)
      return <span className="y-axis-label-vertical" style={{ marginRight: 8 }}>Number of genomes</span>
    else
      return <span className="y-axis-label-horizontal">Number of genomes</span>
  }

  function imgOnLoadPromise(obj) {
    return new Promise((resolve, reject) => {
      obj.onload = () => resolve(obj);
      obj.onerror = reject;
    });
  }

  const stopLoading = (index) => {
    switch (index) {
      case 0: setCaptureControlMapInProgress(false)
        break;
      case 1: setCaptureControlChartRFWGInProgress(false)
        break;
      case 2: setCaptureControlChartDRTInProgress(false)
        break;
      case 3: setCaptureControlChartGDInProgress(false)
        break;
      case 4: setCaptureControlChartRFWAGInProgress(false)
        break;
      default:
        break;
    }
  }

  const capturePicture = (id, index) => {
    switch (index) {
      case 0:
        setCaptureControlMapInProgress(true)
        setControlMapPosition({ coordinates: [0, 0], zoom: 1 })
        break;
      case 1: setCaptureControlChartRFWGInProgress(true)
        break;
      case 2: setCaptureControlChartDRTInProgress(true)
        break;
      case 3: setCaptureControlChartGDInProgress(true)
        break;
      case 4: setCaptureControlChartRFWAGInProgress(true)
        break;
      default:
        break;
    }

    if (index !== 0) {
      const names = ["Resistance Frequencies Within Genotypes (Chart) - TiphyNET.png", "Drug Resistance Trends (Chart) - TiphyNET.png", "Genotype Distribution (Chart) - TiphyNET.png", "Resistance determinants within all genotypes (Chart) - TiphyNET.png"]
      domtoimage.toPng(document.getElementById(id), { quality: 0.95, bgcolor: "white" })
        .then(function (dataUrl) {
          var link = document.createElement('a');
          link.download = names[index - 1];
          link.href = dataUrl;
          stopLoading(index)
          link.click();
        });
    } else {
      svgAsPngUri(document.getElementById(id), { scale: 4, backgroundColor: "white", width: 1200, left: -200 })
        .then(async (uri) => {

          let canvas = document.createElement("canvas")
          let ctx = canvas.getContext('2d');

          let mapImg = document.createElement("img");
          let mapImgPromise = imgOnLoadPromise(mapImg);
          mapImg.src = uri;
          await mapImgPromise;

          canvas.width = 3600;
          canvas.height = 1800;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

          let typhinetLogo = document.createElement("img");
          let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
          typhinetLogo.src = typhinetLogoImg;
          await typhinetLogoPromise;

          const typhinetLogoWidth = typhinetLogo.width * 0.5
          const typhinetLogoHeight = typhinetLogo.height * 0.5

          ctx.drawImage(typhinetLogo, 26, canvas.height - typhinetLogoHeight - 16, typhinetLogoWidth, typhinetLogoHeight);

          const base64 = canvas.toDataURL();
          stopLoading(index)
          download(base64, 'Genome Samples (World Map) - TyphiNET.png');
        });
    }
  }

  const dowloadBaseSpreadsheet = () => {
    axios.get(`${API_ENDPOINT}file/download`)
      .then((res) => {
        download(res.data, 'TyphiNET Database.csv');
      })
  }

  const generateMapLegendOptions = () => {
    let percentageSteps = ['1', '25', '50', '75', '100']

    switch (mapView) {
      case 'No. Samples':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0</span>
            </div>
            {[...Array(6).keys()].map((n) => {
              const samplesLegend = n !== 0 ? n * (samplesQty / 5) : 1
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapSamplesColorScale(samplesLegend) }} />
                  <span>{samplesLegend}</span>
                </div>
              )
            })}
          </>
        )
      case 'AMR Profiles':
        let amrProfiles = ['MDR_DCS', 'MDR', 'DCS', 'AzithR_MDR', 'AzithR_DCS', 'AzithR_DCS_MDR', 'XDR', 'AMR', 'AMR_DCS'].sort((a, b) => a.localeCompare(b));
        amrProfiles.push('No AMR detected')
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {amrProfiles.map((a, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForAMR(a) }} />
                  <span>{a}</span>
                </div>
              )
            })}
          </div>
        )
      case 'Dominant Genotype':
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {genotypes.map((g, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForGenotype(g) }} />
                  <span>{g}</span>
                </div>
              )
            })}
          </div>
        )
      case 'H58 / Non-H58':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((g, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(g) }} />
                  <span>{g}%</span>
                </div>
              )
            })}
          </>
        )
      case 'MDR':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'XDR':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'DCS':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'Azith':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'CipI':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'CipR':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'Resistance to Drug':
        let drugs = ["Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (DCS)", "Sulphonamides", "Tetracyclines", "Trimethoprim"]
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {drugs.map((d, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForDrug(d) }} />
                  <span>{d}</span>
                </div>
              )
            })}
          </div>
        )
      case 'Plasmid Incompatibility Type':
        let incTypes = ["IncX1", "IncFIA(HI1)", "IncFIB(pHCM2)", "IncA/C2", "IncP1", "IncFIA(HI1)/IncHI1A/IncHI1B(R27)", "Col(BS512)", "IncHI1A/IncHI1B(R27)", "IncN", "IncHI1B(R27)", "p0111", "IncHI1A", "IncI1", "IncY", "IncFIB(AP001918)", "IncFIB(K)", "IncHI2/IncHI2A", "Col440I", "Col440I", "Col156", "Col440II/Col440II", "IncFIA(HI1)/IncHI1A", "ColRNAI", "ColpVC", "IncX3"].sort((a, b) => a.localeCompare(b));
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {incTypes.map((d, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForIncType(d) }} />
                  <span>{d}</span>
                </div>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  const renderMapLegend = () => {
    return (
      <div className="map-legend">
        <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 12, marginTop: 2 }}>
          <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat", whiteSpace: "nowrap" }}>Select map view</InputLabel>
          <Select
            value={mapView}
            onChange={evt => setMapView(evt.target.value)}
            fullWidth
            style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }}
          >
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Dominant Genotype'}>
              Dominant Genotype
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'No. Samples'}>
              No. Samples
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'AMR Profiles'}>
              AMR Profiles
          </MenuItem> */}
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'H58 / Non-H58'}>
              H58
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Plasmid Incompatibility Type'}>
              Plasmid Incompatibility Type
          </MenuItem> */}
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'MDR'}>
              MDR
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'XDR'}>
              XDR
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'DCS'}>
              DCS
          </MenuItem> */}
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Azith'}>
              AzithR
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'CipI'}>
              CipI
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'CipR'}>
              CipR
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Resistance to Drug'}>
              Resistance to Drug
          </MenuItem> */}
          </Select>
        </FormControl>
        {generateMapLegendOptions()}
      </div>
    )
  }

  return (
    <div className="dashboard" style={{padding: '16px 0px'}}>
      <div className="info-wrapper">
        {isDesktop && (
          <>
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
              <img style={{ height: 90, marginBottom: -10 }} src={typhinetLogoImg} alt="TyphiNET" />
            </div>
            <div style={{ width: 16 }} />
          </>
        )}
        <div className="card">
          <span>Total Genomes</span>
          {totalGenomes.length === actualGenomes.length ? (
            <span className="value">{totalGenomes.length}</span>
          ) : (
            <span className="value">
              {actualGenomes.length}
              <span className="value-total">/{totalGenomes.length}</span>
            </span>
          )}
        </div>
        <div style={{ width: 16 }} />
        <div className="card">
          <span>
            Total Genotypes 
            <FontAwesomeIcon icon={faInfoCircle} className="icon-info" title="Total genotypes present in TyphiNET database / Total genotypes worldwide published"/>
          </span>
          {totalGenotypes.length === actualGenotypes.length ? (
            <span className="value">{totalGenotypes.length}</span>
          ) : (
            <span className="value">
              {actualGenotypes.length}
              <span className="value-total">/{totalGenotypes.length}</span>
            </span>
          )}
        </div>
      </div>
      <div className="map-filters-wrapper" style={{ flexDirection: 'column' }}>
        <h2 style={{ textAlign: "center" }}>Global Overview of Salmonella Typhi</h2>
        <div className="map-filters-wrapper-inside" style={{ flexDirection: isDesktop ? 'row' : 'column' }}>
          <div className="map-wrapper">
            <ComposableMap
              id="control-map"
              data-tip=""
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 210,
              }}
              style={{ height: "100%", width: "100%" }}
            >
              <ZoomableGroup
                zoom={controlMapPosition.zoom}
                center={controlMapPosition.coordinates}
                onMoveEnd={(position) => {
                  setControlMapPosition(position);
                }}
              >
                <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
                <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
                <Geographies
                  geography={geography}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const sample = worldMapSamplesData.find(s => s.displayName === geo.properties.NAME)
                      const d = worldMapComplementaryData[geo.properties.NAME]; /* .NAME || .NAME_LONG */
                      let country

                      let fill = "lightgrey"

                      switch (mapView) {
                        case 'No. Samples':
                          if (sample && sample.count !== 0){
                            fill = mapSamplesColorScale(sample.count);
                          }else if (sample && sample.count === 0){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'AMR Profiles':
                          country = worldMapAmrProfilesData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.amrProfiles.length > 0)
                            fill = getColorForAMR(country.amrProfiles[0].name);
                          break;
                        case 'Dominant Genotype':
                          country = worldMapGenotypesData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined) {
                            const temp = country.genotypes
                            temp.sort((a, b) => a.count <= b.count ? 1 : -1)
                            fill = getColorForGenotype(temp[0].lineage)
                          }
                          break;
                        case 'H58 / Non-H58':
                          country = worldMapH58Data.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.genotypes[0]) {
                            const temp = country.genotypes.find(g => g.type === 'H58')
                            switch (temp === undefined) {
                              case false:
                                fill = mapRedColorScale(temp.percentage)
                                break;
                              case 'Non-H58':
                                fill = '#F5F4F6'
                                break;
                              default:
                                fill = '#F5F4F6'
                                break;
                            }
                          }
                          break;
                        case 'MDR':
                          country = worldMapMDRData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage){
                            fill = mapRedColorScale(country.percentage);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'XDR':
                          country = worldMapXDRData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage){
                            fill = mapRedColorScale(country.percentage);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'DCS':
                          country = worldMapDCSData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage){
                            fill = mapRedColorScale(country.percentage);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'Azith':
                          country = worldMapAZITHData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage){
                            fill = mapRedColorScale(country.percentage);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'CipI':
                          country = worldMapCIPIData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage){
                            fill = mapRedColorScale(country.percentage);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'CipR':
                          country = worldMapCIPRData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage){
                            fill = mapRedColorScale(country.percentage);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'Resistance to Drug':
                          country = worldMapDrugsData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.drugs.length > 0){
                            fill = getColorForDrug(country.drugs[0].name);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        case 'Plasmid Incompatibility Type':
                          country = worldMapPlasmidIncompatibilityTypeData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.incTypes.length > 0){
                            fill = getColorForIncType(country.incTypes[0].type);
                          }else if (country !== undefined){
                            fill = '#F5F4F6'
                          }
                          break;
                        default:
                          break;
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          cursor="pointer"
                          fill={fill}
                          onClick={() => {
                            if (d !== undefined && sample !== undefined)
                              setActualCountry(sample.name)
                          }}
                          onMouseEnter={() => {
                            const { NAME } = geo.properties;
                            switch (mapView) {
                              case 'No. Samples':
                                if (sample !== undefined && d !== undefined) {
                                  setTooltipContent({
                                    name: NAME,
                                    additionalInfo: {
                                      samples: sample.count,
                                      genotypes: d.GENOTYPES.TOTAL,
                                      H58: Math.round(d.H58) !== d.H58 ? d.H58.toFixed(2) : d.H58,
                                      MDR: Math.round(d.MDR) !== d.MDR ? d.MDR.toFixed(2) : d.MDR,
                                      DCS: Math.round(d.DCS) !== d.DCS ? d.DCS.toFixed(2) : d.DCS,
                                      CipI: Math.round(d.CipI) !== d.CipI ? d.CipI.toFixed(2) : d.CipI,
                                      CipR: Math.round(d.CipR) !== d.CipR ? d.CipR.toFixed(2) : d.CipR,
                                      AzithR: Math.round(d.AzithR) !== d.AzithR ? d.AzithR.toFixed(2) : d.AzithR
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'AMR Profiles':
                                if (country !== undefined) {
                                  setTooltipContent({
                                    name: NAME,
                                    amrProfilesInfo: country.amrProfiles
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Dominant Genotype':
                                if (country !== undefined) {
                                  let temp = country.genotypes
                                  temp.sort((a, b) => a.count <= b.count ? 1 : -1)
                                  setTooltipContent({
                                    name: NAME,
                                    genotypeInfo: temp
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'H58 / Non-H58':
                                if (country !== undefined && country.genotypes.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    simpleGenotypeInfo: country.genotypes
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'MDR':
                                if (country !== undefined && country.MDRs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    mdrInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'XDR':
                                if (country !== undefined && country.XDRs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    xdrInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'DCS':
                                if (country !== undefined && country.DCSs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    dcsInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Azith':
                                if (country !== undefined && country.AZs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    azInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'CipI':
                                if (country !== undefined && country.CipIs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    cipIInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'CipR':
                                if (country !== undefined && country.CipRs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    cipRInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Resistance to Drug':
                                if (country !== undefined && country.drugs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    drugsInfo: country.drugs
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Plasmid Incompatibility Type':
                                if (country !== undefined && country.incTypes.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    incTypesInfo: country.incTypes
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              default:
                                break;
                            }
                          }}
                          onMouseLeave={() => {
                            setTooltipContent(null);
                          }}
                          style={{
                            default: {
                              outline: "none",
                            },
                            hover: {
                              fill: "#CFD8DC",
                              stroke: "#607D8B",
                              strokeWidth: 1,
                              outline: "none",
                            },
                            pressed: {
                              fill: "#FF5722",
                              stroke: "#607D8B",
                              strokeWidth: 1,
                              outline: "none",
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>

            </ComposableMap>
            {(samplesQty > 0 && isDesktop) && (
              <div className="map-upper-right-buttons">
                {renderMapLegend()}
              </div>
            )}
            {(samplesQty > 0) && (
              <div className="map-upper-left-buttons ">
                <div className="map-filters" style={{ width: isDesktop ? 200 : "-webkit-fill-available" }}>
                  <span style={{ fontWeight: 600, fontSize: 20, marginBottom: isDesktop ? 20 : 10 }}>Filters</span>
                  <div style={{ marginBottom: isDesktop ? 16 : 8 }}>
                    <Typography style={{ fontWeight: 500, fontFamily: "Montserrat", color: "rgb(117,117,117)", fontSize: 12 }}>
                      Select dataset
                    </Typography>
                    <ToggleButtonGroup
                      value={dataset}
                      exclusive
                      size="small"
                      style={{ marginTop: 5}}
                      onChange={(evt, newDataset) => {
                        if (newDataset !== null)
                          setDataset(newDataset)
                      }}
                    >
                      <CustomToggleButton value="full">
                        All
                      </CustomToggleButton>
                      <CustomToggleButton value="global">
                        Local
                      </CustomToggleButton>
                      <CustomToggleButton value="local">
                        Travel
                      </CustomToggleButton>
                    </ToggleButtonGroup>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Typography gutterBottom style={{ fontWeight: 500, fontFamily: "Montserrat", color: "rgb(117,117,117)", fontSize: 12 }}>
                      Select time period
                    </Typography>
                    <CustomSlider
                      style={{marginTop: isDesktop ? '' : -5, marginBottom: isDesktop ? '' : -5}}
                      value={actualTimePeriodRange}
                      min={timePeriodRange[0]}
                      max={timePeriodRange[1]}
                      marks
                      step={10}
                      onChange={(evt, value) => {
                        setActualTimePeriodRange(value)
                      }}
                      valueLabelDisplay="auto"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="map-lower-left-buttons">
              <Zoom in={controlMapPosition.zoom !== 1 || controlMapPosition.coordinates.some(c => c !== 0)}>
                <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Recenter Map</span>} placement="right">
                  <div
                    className="button"
                    onClick={() => setControlMapPosition({ coordinates: [0, 0], zoom: 1 })}
                  >
                    <FontAwesomeIcon icon={faCrosshairs} />
                  </div>
                </TooltipMaterialUI>
              </Zoom>
              <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Zoom In</span>} placement="right">
                <div
                  className="button"
                  onClick={() => {
                    if (controlMapPosition.zoom >= 4) return;
                    setControlMapPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </div>
              </TooltipMaterialUI>
              <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Zoom Out</span>} placement="right">
                <div
                  className="button"
                  onClick={() => {
                    if (controlMapPosition.zoom <= 1) return;
                    if (controlMapPosition.zoom / 2 === 1) {
                      setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
                    } else {
                      setControlMapPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </div>
              </TooltipMaterialUI>
            </div>
            <div className="map-lower-right-buttons">
              <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Map as PNG</span>} placement="left">
                <div
                  className={`button ${captureControlMapInProgress && "disabled"}`}
                  onClick={() => {
                    if (!captureControlMapInProgress)
                      capturePicture('control-map', 0)
                  }}
                >
                  <FontAwesomeIcon icon={faCamera} />
                </div>
              </TooltipMaterialUI>
              {captureControlMapInProgress && (
                <CustomCircularProgress
                  size={54}
                  thickness={4}
                  style={{ position: "absolute", top: 5, left: -7 }} />
              )}
            </div>
          </div>
          {(samplesQty > 0 && !isDesktop) && (
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              {renderMapLegend()}
            </div>
          )}
          <ReactTooltip>
            {tooltipContent && (
              <div className="tooltip-map">
                <span className="country">{tooltipContent.name}</span>
                {tooltipContent.additionalInfo && (
                  <div className="additional-info">
                    <span>Samples: {tooltipContent.additionalInfo.samples}</span>
                    <span>Genotypes: {tooltipContent.additionalInfo.genotypes}</span>
                    <span>H58: {tooltipContent.additionalInfo.H58}%</span>
                    <span>MDR: {tooltipContent.additionalInfo.MDR}%</span>
                    <span>DCS: {tooltipContent.additionalInfo.DCS}%</span>
                    <span>AzithR: {tooltipContent.additionalInfo.AzithR}%</span>
                    <span>CipI: {tooltipContent.additionalInfo.CipI}%</span>
                    <span>CipR: {tooltipContent.additionalInfo.CipR}%</span>
                  </div>
                )}
                {tooltipContent.genotypeInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.genotypeInfo.map((genotype, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForGenotype(genotype.lineage) }} />
                            <span>{genotype.lineage}: {genotype.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {tooltipContent.simpleGenotypeInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.simpleGenotypeInfo[0].type === "H58" ? (
                      <span>{tooltipContent.simpleGenotypeInfo[0].type}: {tooltipContent.simpleGenotypeInfo[0].count} ({tooltipContent.simpleGenotypeInfo[0].percentage}%)</span>
                    ) : tooltipContent.simpleGenotypeInfo.length > 1 && tooltipContent.simpleGenotypeInfo[1].type === "H58" ? (
                      <span>{tooltipContent.simpleGenotypeInfo[1].type}: {tooltipContent.simpleGenotypeInfo[1].count} ({tooltipContent.simpleGenotypeInfo[1].percentage}%)</span>
                    ) : (
                      <span>H58: 0 (0%)</span>
                    )}
                  </div>
                )}
                {tooltipContent.mdrInfo && (
                  <div className="additional-info">
                    <span>MDR: {tooltipContent.mdrInfo.count} ({tooltipContent.mdrInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.xdrInfo && (
                  <div className="additional-info">
                    <span>XDR: {tooltipContent.xdrInfo.count} ({tooltipContent.xdrInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.dcsInfo && (
                  <div className="additional-info">
                    <span>DCS: {tooltipContent.dcsInfo.count} ({tooltipContent.dcsInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.azInfo && (
                  <div className="additional-info">
                    <span>AzithR: {tooltipContent.azInfo.count} ({tooltipContent.azInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.cipIInfo && (
                  <div className="additional-info">
                    <span>CipI: {tooltipContent.cipIInfo.count} ({tooltipContent.cipIInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.cipRInfo && (
                  <div className="additional-info">
                    <span>CipR: {tooltipContent.cipRInfo.count} ({tooltipContent.cipRInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.drugsInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.drugsInfo.map((drug, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForDrug(drug.name) }} />
                            <span>{drug.name}: {drug.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {tooltipContent.amrProfilesInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.amrProfilesInfo.map((amr, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForAMR(amr.name) }} />
                            <span>{amr.name}: {amr.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {tooltipContent.incTypesInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.incTypesInfo.map((incType, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForIncType(incType.type) }} />
                            <span>{incType.type}: {incType.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {(!tooltipContent.incTypesInfo && !tooltipContent.amrProfilesInfo && !tooltipContent.drugsInfo && !tooltipContent.xdrInfo && !tooltipContent.mdrInfo && !tooltipContent.dcsInfo && !tooltipContent.azInfo && !tooltipContent.cipIInfo && !tooltipContent.cipRInfo && !tooltipContent.simpleGenotypeInfo && !tooltipContent.genotypeInfo && !tooltipContent.additionalInfo) && (
                  <div className="additional-info">
                    <span>No reported data</span>
                  </div>
                )}
              </div>
            )}
          </ReactTooltip>
        </div>
      </div>
      <div className="chart-wrapper" style={{ flexDirection: 'column' }}>
        <h2 style={{ textAlign: "center" }}>Now showing: {dataset === "full" ? "All" : dataset === "global" ? "Local" : "Travel"} data from {actualCountry === "All" ? "all countries" : actualCountry} from {actualTimePeriodRange.toString().substring(0, 4)} to {actualTimePeriodRange.toString().substring(5)}</h2>
        <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 16, alignItems: "center", textAlign: "center" }}>
          <label style={{ fontWeight: 500, fontFamily: "Montserrat", whiteSpace: "nowrap", fontSize: 18 }}>Select country (or click map)</label>
          <Select
            value={actualCountry}
            onChange={evt => setActualCountry(evt.target.value)}
            fullWidth
            style={{ fontWeight: 600, fontFamily: "Montserrat", width: 200, textAlign: "left" }}
          >
            {countriesForFilter.map((country, index) => {
              return (
                <MenuItem key={index} style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={country}>
                  {country}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", marginTop: 16, paddingBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 0.5, paddingRight: isMobile ? 0 : 10}}>
              <div id="RFWG" style={{ height: 458, width: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span style={{ paddingRight: 32, marginRight: -22 }} className="chart-title">Resistance frequencies within genotypes</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartRFWGInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartRFWGInProgress)
                            capturePicture('RFWG', 1)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartRFWGInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <span className="chart-title" style={{ marginRight: -22, marginBottom: -8, marginTop: isDesktop ? 0 : 10, fontSize: 10, fontWeight: 400 }}>Top Five Genotypes</span>
                <div style={{ height: 420, display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <span className="y-axis-label-vertical" style={{ paddingRight: 8, marginBottom: isDesktop ? 84 : 154 }}>Number of occurrences</span>
                  {plotDrugsAndGenotypesChart()}
                </div>
              </div>
              <div id="RFWAG" style={{ width: "100%", display: "flex", flexDirection: "column", paddingTop: 50 }}>
                <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Resistance determinants within all genotypes</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartRFWAGInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartRFWAGInProgress)
                            capturePicture('RFWAG', 4)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartRFWAGInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <span className="chart-title" style={{ fontSize: 10, fontWeight: 400, paddingBottom: 10, marginTop: isDesktop ? 0 : 10 }}>Top Ten Genotypes</span>
                <div style={{ width: isDesktop ? "60%" : "90%", alignSelf: "center", marginBottom: -4, marginRight: isDesktop ? "-10%" : 0 }}>
                  <FormControl fullWidth className={classes.formControlSelect} style={{ marginTop: 0 }}>
                    <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Select Drug Class</InputLabel>
                    <Select
                      value={amrClassFilter}
                      onChange={evt => setAmrClassFilter(evt.target.value)}
                      fullWidth
                      style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                    >
                      {amrClassesForFilter.map((amrClass, index) => {
                        return (
                          <MenuItem key={index} style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={amrClass}>
                            {amrClass}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </div>
                <div style={{ height: 350, display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <span className="y-axis-label-vertical" style={{ paddingRight: 8 }}>Number of occurrences</span>
                  {plotAmrClassChart()}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 0.5, paddingLeft: isMobile ? 0 : 10, marginRight: 0, marginTop: window.innerWidth < 500 ? 25 : 0 }}>
              <div id="DRT" style={{width: "100%", display: "flex", flexDirection: "column", marginTop: 5 }}>
                <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Drug resistance trends</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartDRTInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartDRTInProgress)
                            capturePicture('DRT', 2)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartDRTInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <div style={{ height: 422, display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
                  <span className="y-axis-label-vertical" style={{ paddingBottom: isDesktop ? 84 : 124 }}>Number of occurrences</span>
                  {plotDrugTrendsChart()}
                </div>
              </div>
              <div id="GD" style={{ width: "100%", display: "flex", flexDirection: "column", paddingTop: window.innerWidth < 500 ? 25 : 47 }}>
                <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Genotype distribution</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartGDInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartGDInProgress)
                            capturePicture('GD', 3)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartGDInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <div style={{ width: isDesktop ? "60%" : "90%", alignSelf: "center", paddingRight: isDesktop && populationStructureFilter !== 1 ? "-10%" : 0, paddingBottom: populationStructureFilter === 1 ? -8 : 16 }}>
                  <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 5, marginTop: 23 }}>
                    <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Population Structure</InputLabel>
                    <Select
                      value={populationStructureFilter}
                      onChange={evt => setPopulationStructureFilter(evt.target.value)}
                      fullWidth
                      style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                    >
                      <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                        Genotype
                      </MenuItem>
                      <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                        H58 / Non-H58
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div style={{ width: '100%', height: 350, display: "flex", flexDirection: populationStructureFilter === 1 ? "row" : "column-reverse", alignItems: "center", paddingLeft: populationStructureFilter === 2 ? -22 : 0 }}>
                  {getPopulationStructureChartLabel()}
                  {plotPopulationStructureChart()}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", padding: 12, alignItems: "center", width: "-webkit-fill-available", justifyContent: "center" }}>
            <div className="download-sheet-button" onClick={() => dowloadBaseSpreadsheet()}>
              <FontAwesomeIcon icon={faTable} style={{ marginRight: 8 }} />
              <span>Download TyphiNET Database</span>
            </div>
          </div>
        </div>
      </div>
      <div className="about-wrapper">
        <h2 style={{ marginBottom: 0 }}>About TyphiNET</h2>
        <p>
          TyphiNET is a multi-institutional global collaborative network. Our goal is to facilitate data sharing, and assist in removing barriers to the re-use of pathogen genomic data from both endemic surveillance projects, as well as those data routinely generated by public health reference laboratories, for global public health benefit.
        </p>
        <p>
          The TyphiNET online platform is designed to collate all available whole genome sequence (WGS) data from the bacterial pathogen Salmonella Typhi. As bacterial WGS data is uniquely enriched with many characteristics of the infecting pathogen, we aim to provide up to date global estimates of both antimicrobial resistance and circulating genotypes for S. Typhi. We aim to improve global typhoid fever surveillance in the short term, and to provide evidence to assist in the improvement of intervention strategies and treatment guidelines for this pathogen in the long term.
        </p>
        <p>
          TyphiNET is coordinated by Dr Zoe Dyson, Dr Louise Cerdeira and Prof Kat Holt. We are based at the Department of Infection Biology at the <a href="https://www.lshtm.ac.uk/" target="_blank" rel="noreferrer">London School of Hygiene and Tropical Medicine</a>, as well as the Department of Infectious Diseases at <a href="https://www.monash.edu/medicine/ccs/infectious-diseases/home" target="_blank" rel="noreferrer">Monash University</a>. For more information about Holt lab projects and members, please visit the <a href="https://holtlab.net/" target="_blank" rel="noreferrer">Holt Lab website</a>.
        </p>
        <p>
          TyphiNET has received funding from the European Union's Horizon 2020 research and innovation programme under the Marie Skłodowska-Curie grant agreement TyphiNET No 845681. We are also grateful to the Wellcome Trust for support from their Open Research Fund programme (219692/Z/19/Z). Follow us on <a href="https://twitter.com/typhinet" target="_blank" rel="noreferrer">Twitter</a>.
        </p>
        <h2 style={{ marginBottom: 0 }}>Genomic analysis framework:</h2>
        <p>
          TyphiNET utilises the <a href="https://github.com/katholt/genotyphi/" target="_blank" rel="noreferrer">GenoTyphi</a> genotyping scheme, publised by <a href="https://www.nature.com/articles/ncomms12827" target="_blank" rel="noreferrer">Wong <i>et al.</i> 2016</a>, and discussed in this <a href="https://holtlab.net/2016/10/12/global-picture-typhoid/" target="_blank" rel="noreferrer">blog post</a>.  Data are sourced monthly from the <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">Pathogenwatch</a> online data analysis platform described in this <a href="https://www.biorxiv.org/content/10.1101/2020.07.03.186692v1.abstract" target="_blank" rel="noreferrer">preprint</a> by Argimón <i>et al.</i> 2020.
      </p>
      </div>
      <div className="footer-buttons-wrapper">
        <div
          className="flex-button"
          onClick={() => {
            setContactModalVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Contact</span>
        </div>
        <div
          className="flex-button"
          onClick={() => {
            window.open('https://github.com/zadyson/TyphiNET', '_blank')
          }}
        >
          <FontAwesomeIcon icon={faGithub} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>GitHub</span>
        </div>
        <div
          className="flex-button"
          onClick={() => {
            window.open('https://twitter.com/typhinet', '_blank')
          }}
        >
          <FontAwesomeIcon icon={faTwitter} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Twitter</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <span>Data obtained from: <a href="https://pathogen.watch" rel="noreferrer" target="_blank">pathogen watch project</a> on 07/02/2021.</span>
        <span><a href="https://holtlab.net" rel="noreferrer" target="_blank">Holt Lab</a></span>
      </div>

      <div style={{ zIndex: 1000 }}>
        <Rodal
          visible={contactModalVisible}
          showCloseButton={false}
          customStyles={{ padding: 0, overflow: "hidden", width: isDesktop ? "75%" : "95%", height: isDesktop ? "75%" : "95%" }}
          onClose={() => {
            setContactModalVisible(false);
          }}
        >
          <div style={{ backgroundColor: "transparent", height: "100%", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
              <div
                className="modal-close-button"
                style={{ position: "absolute", right: 24, top: 24, height: 24, width: 24, zIndex: 500 }}
                onClick={() => {
                  setContactModalVisible(false);
                }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 8, color: "black", fontSize: 24 }} />
              </div>
              <div style={{
                padding: 32, height: "100%", width: "-webkit-fill-available", display: "flex", flexDirection: "column", overflowY: "scroll"
              }}>
                <span style={{ fontWeight: 600, fontSize: 20, marginBottom: 20 }}>Contact</span>
                <ContactPage />
              </div>
            </div>
          </div>
        </Rodal>
      </div>
    </div>
  );
};

=======
import './index.css';
import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from "react-simple-maps";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import TooltipMaterialUI from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Zoom from '@material-ui/core/Zoom';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ReactTooltip from "react-tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, LineChart, Line, Legend } from 'recharts';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faCrosshairs, faCamera, faTable, faTimes } from '@fortawesome/free-solid-svg-icons'
import download from 'downloadjs';
import { svgAsPngUri } from 'save-svg-as-png';
import typhinetLogoImg from '../../assets/img/logo-typhinet.png';
import geography from '../../assets/world-110m.json'
import { API_ENDPOINT } from '../../constants';
import { getColorForGenotype, getColorForAMR, getColorForDrug, getColorForIncType } from '../../util/colorHelper';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import ContactPage from '../contact';
import domtoimage from 'dom-to-image';

const useStyles = makeStyles((theme) => ({
  formControlSelect: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: 120,
    '& label.Mui-focused': {
      color: "rgb(31, 187, 211)",
    },
    '& :not(.Mui-error).MuiInput-underline:after': {
      borderBottomColor: "rgb(31, 187, 211)",
    },
  }
}));

const CustomSlider = withStyles({
  root: {
    color: "rgb(31, 187, 211)"
  },
  thumb: {
    "&.MuiSlider-thumb": {
      "&:not(.MuiSlider-active):focus": {
        boxShadow: "0px 0px 0px 8px rgba(31, 187, 211, 0.16)"
      },
      "&:not(.MuiSlider-active):hover": {
        boxShadow: "0px 0px 0px 8px rgba(31, 187, 211, 0.16)"
      },
      "&.MuiSlider-active": {
        boxShadow: "0px 0px 0px 14px rgba(31, 187, 211, 0.16)"
      },
    },
  },
  valueLabel: {
    fontFamily: "Montserrat",
    fontWeight: 500
  }
})(Slider);

const CustomCircularProgress = withStyles({
  root: {
    color: "rgb(31, 187, 211)",
  }
})(CircularProgress);

const CustomToggleButton = withStyles({
  root: {
    padding: "2px 8px",
    fontFamily: "Montserrat",
    fontWeight: 600
  },
  selected: {
    backgroundColor: 'rgb(31, 187, 211) !important',
    color: "white !important"
  }
})(ToggleButton);

const DashboardPage = () => {
  const classes = useStyles();

  const [controlMapPosition, setControlMapPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [samplesQty, setSamplesQty] = useState(0);

  const [worldMapSamplesData, setWorldMapSamplesData] = useState([]);
  const [worldMapComplementaryData, setWorldMapComplementaryData] = useState({});
  const [worldMapGenotypesData, setWorldMapGenotypesData] = useState([]);
  const [worldMapH58Data, setWorldMapH58Data] = useState([]);
  const [worldMapMDRData, setWorldMapMDRData] = useState([]);
  const [worldMapXDRData, setWorldMapXDRData] = useState([]);
  const [worldMapDCSData, setWorldMapDCSData] = useState([]);
  const [worldMapAZITHData, setWorldMapAZITHData] = useState([]);
  const [worldMapCIPIData, setWorldMapCIPIData] = useState([]);
  const [worldMapCIPRData, setWorldMapCIPRData] = useState([]);
  const [worldMapDrugsData, setWorldMapDrugsData] = useState([]);
  const [worldMapAmrProfilesData, setWorldMapAmrProfilesData] = useState([]);
  const [worldMapPlasmidIncompatibilityTypeData, setWorldMapPlasmidIncompatibilityTypeData] = useState([]);

  const [captureControlMapInProgress, setCaptureControlMapInProgress] = useState(false)
  const [captureControlChartRFWGInProgress, setCaptureControlChartRFWGInProgress] = useState(false)
  const [captureControlChartDRTInProgress, setCaptureControlChartDRTInProgress] = useState(false)
  const [captureControlChartGDInProgress, setCaptureControlChartGDInProgress] = useState(false)
  const [captureControlChartRFWAGInProgress, setCaptureControlChartRFWAGInProgress] = useState(false)

  const [tooltipContent, setTooltipContent] = useState(null);

  const [timePeriodRange, setTimePeriodRange] = React.useState([1905, 2019]);
  const [actualTimePeriodRange, setActualTimePeriodRange] = React.useState([1905, 2019]);
  const [countriesForFilter, setCountriesForFilter] = React.useState(['All']);
  const [actualCountry, setActualCountry] = useState("All");
  const [populationStructureFilter, setPopulationStructureFilter] = React.useState(1);
  const amrClassesForFilter = [/*"AMR Profiles", */"Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (DCS)", "Sulphonamides", "Tetracyclines", "Trimethoprim"]
  const [amrClassFilter, setAmrClassFilter] = React.useState(amrClassesForFilter[0])

  const [drugTrendsChartData, setDrugTrendsChartData] = useState([])
  const [drugsAndGenotypesChartData, setDrugsAndGenotypesChartData] = useState([])
  const [chartMaxHeight, setChartMaxHeight] = useState(0)
  const [chartMaxWidth, setChartMaxWidth] = useState(0)
  const [populationStructureChartData, setPopulationStructureChartData] = useState([])
  const [amrClassChartData, setAmrClassChartData] = useState([])

  const [mapView, setMapView] = React.useState('Dominant Genotype');
  const [dataset, setDataset] = React.useState('full');
  const [totalGenomes, setTotalGenomes] = useState([])
  const [actualGenomes, setActualGenomes] = useState([])
  const [totalGenotypes, setTotalGenotypes] = useState([])
  const [actualGenotypes, setActualGenotypes] = useState([])

  const [contactModalVisible, setContactModalVisible] = useState(false)

  const isDesktop = window.innerWidth > 767

  const genotypes = [
    '0.0.1', '0.0.2', '0.0.3', '0.1',
    '0.1.1', '0.1.2', '0.1.3', '1.1.1',
    '1.1.2', '1.1.3', '1.2', '1.2.1',
    '2', '2.0.1', '2.0.2', '2.1',
    '2.1.1', '2.1.3', '2.1.5', '2.1.6',
    '2.1.7', '2.1.8', '2.1.9', '2.2',
    '2.2.1', '2.2.2', '2.2.3', '2.2.4',
    '2.3.1', '2.3.2', '2.3.3', '2.3.4',
    '2.3.5', '2.4', '2.4.1', '2.5',
    '2.5.1', '3', '3.0.1', '3.0.2',
    '3.1', '3.1.1', '3.1.2', '3.2',
    '3.2.1', '3.2.2', '3.3', '3.3.1',
    '3.3.2', '3.3.2.Bd1', '3.3.2.Bd2', '3.4',
    '3.5', '3.5.1', '3.5.2', '3.5.3',
    '3.5.4', '4.1', '4.2', '4.2.1',
    '4.2.2', '4.2.3', '4.3.1', '4.3.1.1',
    '4.3.1.1.P1', '4.3.1.2', '4.3.1.3'].sort((a, b) => a.localeCompare(b));
  useEffect(() => {
    axios.get(`${API_ENDPOINT}filters/getYearLimits`)
      .then((res) => {
        let limits = res.data
        setTimePeriodRange([limits.min, limits.max])
        setActualTimePeriodRange([limits.min, limits.max])
      })
  }, [])

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      axios.get(`${API_ENDPOINT}filters/all/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
        .then((res) => {
          var response = res.data

          response['Dem. Rep. Congo'] = response['Democratic Republic of Congo']
          delete response['Democratic Republic of Congo']
          response['Central African Rep.'] = response['Central African Republic']
          delete response['Central African Republic']
          response["Côte d'Ivoire"] = response['Ivory Coast']
          delete response['Ivory Coast']
          response["Timor-Leste"] = response['East Timor']
          delete response['East Timor']

          setWorldMapComplementaryData(response)
        })
    }, 500)
    return () => clearTimeout(timeOutId);
  }, [actualTimePeriodRange, dataset])

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      let filter;

      if (populationStructureFilter === 1) {
        filter = 2
      } else {
        filter = 3 /* H58 and Non-H58 */
      }

      let genotypeChartResponse = await axios.get(`${API_ENDPOINT}filters/${filter}/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
      parseDataForGenotypeChart(genotypeChartResponse.data)

      if (actualCountry === "All") {
        parseDataForCountryMap(genotypeChartResponse.data)
      }
      else {
        let response = await axios.get(`${API_ENDPOINT}filters/${filter}/all/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
        parseDataForCountryMap(response.data)
      }

      let drugTrendsChartResponse = await axios.get(`${API_ENDPOINT}filters/drugTrendsChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}`)
      parseDataForDrugTrendsChart(drugTrendsChartResponse.data)

      let classChartResponse = await axios.get(`${API_ENDPOINT}filters/amrClassChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${amrClassFilter}/${dataset}`)
      parseDataForAmrClassChart(classChartResponse.data)

    }, 500);
    return () => clearTimeout(timeOutId);
  }, [populationStructureFilter, actualTimePeriodRange, actualCountry, dataset, amrClassFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const parseDataForGenotypeChart = (data) => {
    var finalPopulationStructureChartData = [];

    var genomes = data;
    var genotypes = [];

    data.forEach((entry) => {
      if (!genotypes.some(g => g === entry.GENOTYPE)) {
        genotypes.push(entry.GENOTYPE)
      }

      /* POPULATION STRUCTURE CHART GENERATION */
      if (populationStructureFilter === 1) { /* Genotype */
        if (!finalPopulationStructureChartData.some(e => e.name === entry.YEAR)) {
          finalPopulationStructureChartData.push({
            name: entry.YEAR,
            [entry.GENOTYPE]: 1
          })
        } else {
          let year = finalPopulationStructureChartData.find(e => e.name === entry.YEAR);
          let yearIndex = finalPopulationStructureChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry.GENOTYPE] === undefined) {
            year[entry.GENOTYPE] = 1
          } else {
            year[entry.GENOTYPE] = year[entry.GENOTYPE] + 1
          }
          finalPopulationStructureChartData[yearIndex] = year;
        }
      } else { /* H58 / Non-H58 */
        if (entry['GENOTYPE_SIMPLE'] === 'H58' || entry['GENOTYPE_SIMPLE'] === 'Non-H58')
          if (!finalPopulationStructureChartData.some(e => e.name === entry['GENOTYPE_SIMPLE'])) {
            finalPopulationStructureChartData.push({
              name: entry['GENOTYPE_SIMPLE'],
              [entry.GENOTYPE]: 1
            })
          } else {
            let genotypeSimple = finalPopulationStructureChartData.find(e => e.name === entry['GENOTYPE_SIMPLE']);
            let genotypeSimpleIndex = finalPopulationStructureChartData.findIndex(e => e.name === entry['GENOTYPE_SIMPLE']);

            if (genotypeSimple[entry.GENOTYPE] === undefined) {
              genotypeSimple[entry.GENOTYPE] = 1
            } else {
              genotypeSimple[entry.GENOTYPE] = genotypeSimple[entry.GENOTYPE] + 1
            }
            finalPopulationStructureChartData[genotypeSimpleIndex] = genotypeSimple;
          }
      }
    })

    if (totalGenomes.length === 0)
      setTotalGenomes(genomes)

    if (totalGenotypes.length === 0){
      if (actualCountry === "All") {
        axios.get(`${API_ENDPOINT}filters/totalGenotypes`)
        .then((res) => {
          setTotalGenotypes(res.data.genotypes)
        })
      }else{
        setTotalGenotypes(genotypes)
      }
    }

    setActualGenomes(genomes)
    setActualGenotypes(genotypes)

    finalPopulationStructureChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "name")
          sum += entry[1];
      })
      data.total = sum;
    })

    if (!arraysEqual(finalPopulationStructureChartData, populationStructureChartData))
      setPopulationStructureChartData(finalPopulationStructureChartData)

    let populationStructureChartSums = []
    finalPopulationStructureChartData.forEach((year) => {
      let sum = 0
      let yearArray = Object.entries(year)
      yearArray.forEach((_year) => {
        if (_year[0] !== "name" && _year[0] !== "total")
          sum += _year[1]
      })
      populationStructureChartSums.push({
        year: year.name,
        sum
      })
    })

    if (populationStructureChartSums.length > 0) {
      let highestSum = populationStructureChartSums.sort((a, b) => b.sum - a.sum)[0].sum;

      if (populationStructureFilter === 1) {
        if (highestSum > chartMaxHeight)
          setChartMaxHeight(Math.ceil(highestSum / 100) * 100)
      } else {
        if (highestSum > chartMaxWidth)
          setChartMaxWidth(Math.ceil(highestSum / 100) * 100)
      }
    }
  }

  const parseDataForCountryMap = (data) => {
    let finalCountries = [];

    let samplesData = [], genotypesData = [], h58Data = [], mdrData = [], xdrData = [], drugsData = [], amrData = [], incTypesData = [], dcsData = [], azithData = [], cipIData = [], cipRData = [];

    const countData = (array, elementToCount, parentName, childName) => {
      let temp = []
      array.forEach(entry => {
        if (!temp.some(e => e.name === entry['COUNTRY_ONLY'])) {
          temp.push({
            name: entry['COUNTRY_ONLY'],
            displayName: entry['COUNTRY_ONLY'],
            total: 1,
            [parentName]: [{
              [childName]: entry[elementToCount],
              count: 1
            }]
          })
        } else {
          let country = temp.find(e => e.name === entry['COUNTRY_ONLY']);
          let countryIndex = temp.findIndex(e => e.name === entry['COUNTRY_ONLY']);

          if (!country[parentName].some(e => e[childName] === entry[elementToCount])) {
            country[parentName].push({
              [childName]: entry[elementToCount],
              count: 1
            })
          } else {
            let parent = country[parentName].find(e => e[childName] === entry[elementToCount]);
            let index = country[parentName].findIndex(e => e[childName] === entry[elementToCount]);
            parent.count = parent.count + 1
            country[parentName][index] = parent
          }
          country.total = country.total + 1

          temp[countryIndex] = country;
        }
      })

      let congoCountryIndex = temp.findIndex(e => e.name === 'Democratic Republic of Congo');
      if (congoCountryIndex !== -1)
        temp[congoCountryIndex].displayName = 'Dem. Rep. Congo'

      let centralAfricanRepublicCountryIndex = temp.findIndex(e => e.name === 'Central African Republic');
      if (centralAfricanRepublicCountryIndex !== -1)
        temp[centralAfricanRepublicCountryIndex].displayName = 'Central African Rep.'

      let ivoryCoastCountryIndex = temp.findIndex(e => e.name === "Ivory Coast");
      if (ivoryCoastCountryIndex !== -1)
        temp[ivoryCoastCountryIndex].displayName = "Côte d'Ivoire"

      let timorLesteCountryIndex = temp.findIndex(e => e.name === "East Timor");
      if (timorLesteCountryIndex !== -1)
        temp[timorLesteCountryIndex].displayName = "Timor-Leste"

      temp.forEach((country) => {
        country[parentName].sort((a, b) => b.count - a.count);
      })
      temp.sort((a, b) => a.name.localeCompare(b.name));

      return temp
    }

    data.forEach((entry) => {
      if (!finalCountries.some(e => e === entry['COUNTRY_ONLY']) && entry['COUNTRY_ONLY'] !== "-" && entry['COUNTRY_ONLY'] !== "")
        finalCountries.push(entry['COUNTRY_ONLY'])

      if (!samplesData.some(e => e.name === entry['COUNTRY_ONLY'])) {
        samplesData.push({
          name: entry['COUNTRY_ONLY'],
          displayName: entry['COUNTRY_ONLY'],
          count: 1
        })
      } else {
        let country = samplesData.find(e => e.name === entry['COUNTRY_ONLY']);
        let countryIndex = samplesData.findIndex(e => e.name === entry['COUNTRY_ONLY']);
        country.count = country.count + 1
        samplesData[countryIndex] = country;
      }
    })

    if (!arraysEqual(samplesData, worldMapSamplesData)) {
      let congoCountryIndex = samplesData.findIndex(e => e.name === 'Democratic Republic of Congo');
      if (congoCountryIndex !== -1)
        samplesData[congoCountryIndex].displayName = 'Dem. Rep. Congo'

      let centralAfricanRepublicCountryIndex = samplesData.findIndex(e => e.name === 'Central African Republic');
      if (centralAfricanRepublicCountryIndex !== -1)
        samplesData[centralAfricanRepublicCountryIndex].displayName = 'Central African Rep.'

      let ivoryCoastCountryIndex = samplesData.findIndex(e => e.name === "Ivory Coast");
      if (ivoryCoastCountryIndex !== -1)
        samplesData[ivoryCoastCountryIndex].displayName = "Côte d'Ivoire"

      let timorLesteCountryIndex = samplesData.findIndex(e => e.name === "East Timor");
      if (timorLesteCountryIndex !== -1)
        samplesData[timorLesteCountryIndex].displayName = "Timor-Leste"

      setWorldMapSamplesData(samplesData)
      setSamplesQty(
        Math.ceil((
          samplesData.length > 0 ? samplesData.sort((a, b) => b.count - a.count)[0].count : 0
        ) / 50) * 50
      )
    }

    finalCountries.sort((a, b) => a.localeCompare(b));
    finalCountries.unshift("All");
    setCountriesForFilter(finalCountries)

    if (!finalCountries.includes(actualCountry))
      setActualCountry("All")

    genotypesData = countData(data, "GENOTYPE", "genotypes", "lineage")
    if (!arraysEqual(genotypesData, worldMapGenotypesData))
      setWorldMapGenotypesData(genotypesData)

    h58Data = countData(data, "GENOTYPE_SIMPLE", "genotypes", "type")
    h58Data.forEach(country => {
      country.genotypes.forEach((g, index) => {
        let percentage = ((g.count / country.total) * 100)
        if (Math.round(percentage) !== percentage) {
          percentage = percentage.toFixed(2)
        }
        g.percentage = percentage
      })
    })
    if (!arraysEqual(h58Data, worldMapH58Data))
      setWorldMapH58Data(h58Data)

    mdrData = countData(data, "MDR", "MDRs", "type")
    mdrData.forEach(country => {
      country.MDRs.forEach((mdr, index) => {
        if (mdr.type === "MDR") {
          let percentage = ((mdr.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = mdr.count;
        }
      })
      if (country.percentage === undefined) {
        country.percentage = parseFloat(0)
      }
      if (country.count === undefined) {
        country.count = 0
      }
    })
    if (!arraysEqual(mdrData, worldMapMDRData))
      setWorldMapMDRData(mdrData)

    xdrData = countData(data, "XDR", "XDRs", "type")
    xdrData.forEach(country => {
      country.XDRs.forEach((xdr, index) => {
        if (xdr.type === "XDR") {
          let percentage = ((xdr.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = xdr.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(xdrData, worldMapXDRData))
      setWorldMapXDRData(xdrData)

    dcsData = countData(data, "DCS", "DCSs", "type")
    dcsData.forEach(country => {
      country.DCSs.forEach((dcs, index) => {
        if (dcs.type === "DCS") {
          let percentage = ((dcs.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = dcs.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(dcsData, worldMapDCSData))
      setWorldMapDCSData(dcsData)

    azithData = countData(data, "Azith", "AZs", "type")
    azithData.forEach(country => {
      country.AZs.forEach((az, index) => {
        if (az.type === "AzithR") {
          let percentage = ((az.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = az.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(azithData, worldMapAZITHData))
      setWorldMapAZITHData(azithData)

    cipIData = countData(data, "CipI", "CipIs", "type")
    cipIData.forEach(country => {
      country.CipIs.forEach((cipIs, index) => {
        if (cipIs.type === "CipI") {
          let percentage = ((cipIs.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = cipIs.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(cipIData, worldMapCIPIData))
      setWorldMapCIPIData(cipIData)

    cipRData = countData(data, "CipR", "CipRs", "type")
    cipRData.forEach(country => {
      country.CipRs.forEach((cipRs, index) => {
        if (cipRs.type === "CipR") {
          let percentage = ((cipRs.count / country.total) * 100)
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2)
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = cipRs.count;
        }
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
    })
    if (!arraysEqual(cipRData, worldMapCIPRData))
      setWorldMapCIPRData(cipRData)

    let dataForCountingDrugs = []
    data.forEach(entry => {
      entry.DRUGS.forEach(drug => {
        dataForCountingDrugs.push({
          ...entry,
          DRUG: drug,
        })
      })
    })
    drugsData = countData(dataForCountingDrugs, "DRUG", "drugs", "name");
    if (!arraysEqual(drugsData, worldMapDrugsData))
      setWorldMapDrugsData(drugsData)

    amrData = countData(data, "AMR", "amrProfiles", "name")
    if (!arraysEqual(amrData, worldMapAmrProfilesData))
      setWorldMapAmrProfilesData(amrData)

    incTypesData = countData(data, "IncTypes", "incTypes", "type")
    incTypesData.forEach(country => {
      country.incTypes = country.incTypes.filter(g => g.type !== "")
    })
    if (!arraysEqual(incTypesData, worldMapPlasmidIncompatibilityTypeData))
      setWorldMapPlasmidIncompatibilityTypeData(incTypesData)
  }

  const parseDataForAmrClassChart = (data) => {
    let finalChartData = []
    let maxSum = 0
    let totalSum = {}
    data.forEach((entry) => {
      if (!finalChartData.some(e => e.genotype === entry.GENOTYPE)) {
        finalChartData.push({
          genotype: entry.GENOTYPE,
          [entry.GENE]: 1
        })
      } else {
        let genotype = finalChartData.find(e => e.genotype === entry.GENOTYPE);
        let genotypeIndex = finalChartData.findIndex(e => e.genotype === entry.GENOTYPE);

        if (genotype[entry.GENE] === undefined) {
          genotype[entry.GENE] = 1
        } else {
          genotype[entry.GENE] = genotype[entry.GENE] + 1
        }
        finalChartData[genotypeIndex] = genotype;
      }
      if (entry.GENOTYPE !== "") {
        if (!(entry.GENE in totalSum)) {
          totalSum[entry.GENE] = 1
        } else {
          totalSum[entry.GENE] = totalSum[entry.GENE] + 1
        }
      }
    })
    delete totalSum[""]

    finalChartData.sort((a, b) => a.genotype.localeCompare(b.genotype));
    finalChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "genotype") {
          let errorMargin = Math.ceil(entry[1] * 0.2) // 20%
          let lowerValue = errorMargin > entry[1] ? entry[1] : errorMargin;

          if (entry[1] === 1)
            lowerValue = 1

          if (entry[1] === 0)
            lowerValue = 0

          data[`error-${entry[0]}`] = [lowerValue, errorMargin]

          sum += entry[1];
          if (entry[1] > maxSum) {
            maxSum = entry[1]
          }
        }
      })
      data.total = sum;
    })
    finalChartData = finalChartData.filter(g => g.genotype !== undefined && g.genotype !== "0")
    let top10 = []
    finalChartData.forEach(element => {
      if (top10.length < 10) {
        top10.push(element)
      } else {
        top10.sort(function (a, b) {
          if (a.total === b.total && a.genotype > b.genotype)
            return -1
          return a.total > b.total ? -1 : 1
        })
        if (element.total === top10[9].total) {
          if (element.genotype > top10[9].genotype) {
            top10[9] = element
          }
        }
        if (element.total > top10[9].total) {
          top10[9] = element
        }
      }
    })
    top10.sort(function (a, b) {
      if (a.total === b.total && a.genotype > b.genotype)
        return -1
      return a.total > b.total ? -1 : 1
    })
    top10.push({ maxSum: Math.ceil(top10[0].total / 50) * 50, totalSum: totalSum })
    if (amrClassFilter !== "Co-trimoxazole") {
      if (!arraysEqual(amrClassChartData, top10))
        setAmrClassChartData(top10)
    } else {
      if (!arraysEqual(amrClassChartData, top10))
        setAmrClassChartData(top10)
    }
  }

  const parseDataForDrugTrendsChart = (data) => {
    let finalDrugTrendsChartData = []
    let finalDrugsAndGenotypesChartData = []
    let totalSum = {}
    let allDrugs = data[data.length - 1]
    data = data.slice(0, data.length - 1)

    data.forEach((entry) => {
      if (!finalDrugTrendsChartData.some(e => e.name === entry.YEAR)) {
        finalDrugTrendsChartData.push({
          name: entry.YEAR,
          [entry.DRUG]: 1
        })
      } else {
        let year = finalDrugTrendsChartData.find(e => e.name === entry.YEAR);
        let yearIndex = finalDrugTrendsChartData.findIndex(e => e.name === entry.YEAR);

        if (year[entry.DRUG] === undefined) {
          year[entry.DRUG] = 1
        } else {
          year[entry.DRUG] = year[entry.DRUG] + 1
        }
        finalDrugTrendsChartData[yearIndex] = year;
      }

      if (!finalDrugsAndGenotypesChartData.some(e => e.name === entry.GENOTYPE)) {
        finalDrugsAndGenotypesChartData.push({
          name: entry.GENOTYPE,
          [entry.DRUG]: 1
        })
      } else {
        let genotype = finalDrugsAndGenotypesChartData.find(e => e.name === entry.GENOTYPE);
        let genotypeIndex = finalDrugsAndGenotypesChartData.findIndex(e => e.name === entry.GENOTYPE);

        if (genotype[entry.DRUG] === undefined) {
          genotype[entry.DRUG] = 1
        } else {
          genotype[entry.DRUG] = genotype[entry.DRUG] + 1
        }
        finalDrugsAndGenotypesChartData[genotypeIndex] = genotype;
      }

      if (!(entry.DRUG in totalSum)) {
        totalSum[entry.DRUG] = 1
      } else {
        totalSum[entry.DRUG] = totalSum[entry.DRUG] + 1
      }
    })
    finalDrugTrendsChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "name")
          sum += entry[1];
      })
      data.total = sum;
    })

    finalDrugsAndGenotypesChartData.forEach((data) => {
      let sum = 0;
      Object.entries(data).forEach((entry) => {
        if (entry[0] !== "name")
          sum += entry[1];
      })
      data.total = sum;
    })

    finalDrugTrendsChartData.sort((a, b) => a.name.localeCompare(b.name))
    finalDrugTrendsChartData.push({ totalSum: allDrugs })

    finalDrugsAndGenotypesChartData.sort((a, b) => b.total - a.total)
    finalDrugsAndGenotypesChartData = finalDrugsAndGenotypesChartData.slice(0, finalDrugsAndGenotypesChartData.length >= 5 ? 5 : finalDrugsAndGenotypesChartData.length)
    finalDrugsAndGenotypesChartData.push({ totalSum: totalSum })

    if (!arraysEqual(finalDrugTrendsChartData, drugTrendsChartData))
      setDrugTrendsChartData(finalDrugTrendsChartData)

    if (!arraysEqual(finalDrugsAndGenotypesChartData, drugsAndGenotypesChartData)) {
      setDrugsAndGenotypesChartData(finalDrugsAndGenotypesChartData)
    }
  }

  function arraysEqual(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  const mapSamplesColorScale = scaleLinear()
    .domain([1, samplesQty / 5, 2 * (samplesQty / 5), 3 * (samplesQty / 5), 4 * (samplesQty / 5), samplesQty])
    .range(["#4575b4", "#91bfdb", "#e0f3f8", "#fee090", "#fc8d59", "#d73027"]);

  const mapRedColorScale = scaleLinear()
    .domain([1, 50, 100])
    .range(["#ffebee", "#f44336", "#b71c1c"]);

  const tooltip = (positionY, width1, width2, sort, wrapperS, stroke, chart = -1) => {
    return (
      <Tooltip
        position={{ y: positionY }}
        wrapperStyle={wrapperS}
        content={({ active, payload, label }) => {
          if (payload !== null) {
            if (sort) {
              payload.sort((a, b) => b.value - a.value)
              payload = payload.reverse()
            }
            if (active) {
              return (
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                  <div style={{ height: 14 }} />
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: width1, flexDirection: "" }}>
                    {payload.reverse().map((item, index) => {
                      let percentage = ((item.value / item.payload.total) * 100)
                      if (chart === 0) {
                        percentage = ((item.value / drugsAndGenotypesChartData[drugsAndGenotypesChartData.length - 1].totalSum[item.name]) * 100)
                      } else if (chart === 1) {
                        percentage = ((item.value / drugTrendsChartData[drugTrendsChartData.length - 1].totalSum[item.payload.name]) * 100)
                      }
                      if (Math.round(percentage) !== percentage)
                        percentage = percentage.toFixed(2)
                      return (
                        <div key={index + item} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: width2, marginBottom: 8 }}>
                          <div style={{ backgroundColor: stroke ? item.stroke : item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flex: "none" }} />
                          <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 10 }}>{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }
          }
          return null;
        }}
      />
    )
  }

  const plotPopulationStructureChart = () => {

    if (populationStructureFilter === 1) { /* Genotype */
      let maxH = 0
      for (let index = 0; index < populationStructureChartData.length; index++) {
        if (populationStructureChartData[index].total > maxH) {
          maxH = populationStructureChartData[index].total
        }
      }
      maxH = Math.ceil(maxH / 50) * 50
      return (
        <ResponsiveContainer width="90%">
          <BarChart
            width={500}
            height={300}
            data={populationStructureChartData}
            margin={{
              top: 20, left: -20, bottom: 5, right: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval="preserveStartEnd" />
            <YAxis domain={[0, maxH]} />
            <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />

            {tooltip(300, 550, "20%", false, { zIndex: 100 }, false)}
            {genotypes.map((item) => <Bar dataKey={item} stackId="a" fill={getColorForGenotype(item)} />)}
          </BarChart>
        </ResponsiveContainer>
      )
    } else { /* H58 and Non-H58 */
      return (
        <ResponsiveContainer width="90%">
          <BarChart
            width={500}
            height={300}
            data={populationStructureChartData}
            margin={{
              top: 20, left: 20, bottom: 5, right: 0
            }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type={"number"} domain={[0, chartMaxWidth]} />
            <YAxis dataKey="name" type={"category"} domain={[0, 50]}/>
            {tooltip(300, 700, "14.28%", false, { zIndex: 100 }, false)}
            {genotypes.map((item) => <Bar dataKey={item} stackId="a" barSize={50} fill={getColorForGenotype(item)} />)}
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }

  const armClassFilterComponent = (info) => {
    let maxSum = 0
    if (amrClassChartData[amrClassChartData.length - 1] !== undefined) {
      maxSum = amrClassChartData[amrClassChartData.length - 1].maxSum
    }

    const data = amrClassChartData.slice(0, amrClassChartData.length - 1)
    console.log(data)
    return (
      <ResponsiveContainer width="90%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20, left: -20, bottom: 5, right: 0
          }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="genotype" type={"category"} interval={0} tick={{ fontSize: info.fontsize }} />
          <YAxis domain={[0, maxSum]} type={"number"} />
          <Brush dataKey="genotype" height={20} stroke={"rgb(31, 187, 211)"} />

          {amrClassChartTooltip()}
          {info.bars.map((item) => {
            return (
              <Bar dataKey={item[0]} fill={item[1]} stackId="a" barSize={30} />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const plotAmrClassChart = () => {
    switch (amrClassFilter) {
      case 'Azithromycin':
        return (armClassFilterComponent({
          left: -5, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['acrB_R717Q', "#addd8e", "error-acrB_R717Q"],
            ['ereA', "#9e9ac8", "error-ereA"]]
        }))
      case 'Fluoroquinolones (DCS)':
        return (armClassFilterComponent({
          left: 10, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
            ['3_QRDR', "rgb(198,127,251)", "error-3_QRDR"],
            ['2_QRDR', "rgb(70,191,195)", "error-2_QRDR"],
            ['1_QRDR + qnrS', "rgb(125,172,32)", "error-1_QRDR + qnrS"],
            ['1_QRDR', "rgb(244,119,112)", "error-1_QRDR"]]
        }))
      case 'Chloramphenicol':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['cmlA', "#addd8e", "error-cmlA"],
            ['catA1', "#9e9ac8", "error-catA1"]]
        }))
      case 'Ampicillin':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['blaTEM-1D', "#addd8e", "error-blaTEM-1D"]]
        }))
      case 'Sulphonamides':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['sul2', "#ffeda0", "error-sul2"],
            ['sul1', "#fd8d3c", "error-sul1"]]
        }))
      case 'Trimethoprim':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
            ['dfrA7', "#addd8e", "error-dfrA7"],
            ['dfrA5', "#9e9ac8", "error-dfrA5"],
            ['dfrA18', "#6baed6", "error-dfrA18"],
            ['dfrA17', "#7a0177", "error-dfrA17"],
            ['dfrA15', "#54278f", "error-dfrA15"],
            ['dfrA14', "#a50f15", "error-dfrA14"],
            ['dfrA1', "red", "error-dfrA1"]]
        }))
      case 'Co-trimoxazole':
        let cotrim = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"];
        let colors1 = ["#ffeda0", "#fd8d3c", "#addd8e", "#9e9ac8", "#6baed6", "#7a0177", "#54278f"]
        let colors2 = ["#a50f15", "#6a5acd", "#f1b6da", "#fb8072", "#4682b4", "#2e8b57", "#98fb98"]
        let bars = []

        for (const index in cotrim) {
          bars.push([cotrim[index] + "-sul1", colors1[index], "error-" + cotrim[index] + "-sul1"])
          bars.push([cotrim[index] + "-sul2", colors2[index], "error-" + cotrim[index] + "-sul2"])
        }

        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: bars
        }))
      case 'Tetracyclines':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['tetA(D)', "#addd8e", "error-tetA(D)"],
            ['tetA(C)', "#9e9ac8", "error-tetA(C)"],
            ['tetA(B)', "#6baed6", "error-tetA(B)"],
            ['tetA(A)', "#a50f15", "error-tetA(A)"]]
        }))
      case 'AMR Profiles':
        return (armClassFilterComponent({
          left: isDesktop ? 12 : -30, fontsize: isDesktop ? 14 : 5, strokeWidth: 0.5, width: 3, bars: [
            ['No AMR detected', getColorForAMR('No AMR detected'), "error-No AMR detected"],
            ['MDR_DCS', getColorForAMR('MDR_DCS'), "error-MDR_DCS"],
            ['MDR', getColorForAMR('MDR'), "error-MDR"],
            ['DCS', getColorForAMR('DCS'), "error-DCS"],
            ['AzithR_MDR', getColorForAMR('AzithR_MDR'), "error-AzithR_MDR"],
            ['AzithR_DCS', getColorForAMR('AzithR_DCS'), "error-AzithR_DCS"],
            ['AzithR_DCS_MDR', getColorForAMR('AzithR_DCS_MDR'), "error-AzithR_DCS_MDR"],
            ['XDR', getColorForAMR('XDR'), "error-XDR"],
            ['AMR', getColorForAMR('AMR'), "error-AMR"],
            ['AMR_DCS', getColorForAMR('AMR_DCS'), "error-AMR_DCS"]]
        }))
      case 'ESBL':
        return (armClassFilterComponent({
          left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
            ['blaSHV-12', "#addd8e", "error-blaSHV-12"],
            ['blaOXA-7', "#9e9ac8", "error-blaOXA-7"],
            ['blaCTX-M-15_23', "#6baed6", "error-blaCTX-M-15_23"]]
        }))
      default:
        return null;
    }
  }

  const amrClassChartTooltip = () => {
    return (
      <Tooltip
        position={{ x: 0 }}
        wrapperStyle={{ zIndex: 100, top: 100 }}
        allowEscapeViewBox={{ x: true, y: true }}
        content={({ active, payload, label }) => {
          if (payload !== null) {
            if (active) {
              return (
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                  <div style={{ height: 14 }} />
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 325 }}>
                    {payload.reverse().map((item, index) => {
                      let percentage = ((item.value / amrClassChartData[amrClassChartData.length - 1].totalSum[item.name]) * 100)
                      if (Math.round(percentage) !== percentage)
                        percentage = percentage.toFixed(2)
                      return (
                        <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "33.33%", marginBottom: 8 }}>
                          <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flex: "none" }} />
                          <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, wordWrap: "break-word", overflowX: "hidden" }}>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 10 }}>{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }
          }

          return null;
        }}
      />
    )
  }

  const plotDrugTrendsChart = () => {
    return (
      <ResponsiveContainer width="90%">
        <LineChart
          width={500}
          height={300}
          data={drugTrendsChartData.slice(0, drugTrendsChartData.length - 1)}
          margin={{
            top: 20, left: -20, bottom: 5, right: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval="preserveStartEnd" />
          <YAxis />
          <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />

          <Legend
            content={(props) => {
              const { payload } = props;
              return (
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", width: "86%", justifyContent: "space-between", marginLeft: 60, marginTop: 10, paddingLeft: isDesktop ? 32 : 0, paddingRight: isDesktop ? 32 : 0 }}>
                  {payload.map((entry, index) => {
                    const { dataKey, color } = entry
                    return (
                      <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: isDesktop ? "30%" : "50%", marginBottom: 4 }}>
                        <div style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, marginLeft: 4 }}>{dataKey}</span>
                      </div>
                    )
                  })}
                </div>
              );
            }}
          />

          {tooltip(270, 350, "50%", true, { zIndex: 100 }, true, 1)}
          {amrClassesForFilter.slice(1).map((item) => (<Line dataKey={item} stroke={getColorForDrug(item)} connectNulls type="monotone" />))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const plotDrugsAndGenotypesChart = () => {
    return (
      <ResponsiveContainer width="90%">
        <BarChart
          width={500}
          height={300}
          data={drugsAndGenotypesChartData.slice(0, drugsAndGenotypesChartData.length - 1)}
          margin={{
            top: 20, left: -5, bottom: 5, right: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} tick={{ fontSize: isDesktop ? 16 : 8 }} />
          <YAxis />
          <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />
          <Legend
            content={(props) => {
              const { payload } = props;
              return (
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", width: "86%", justifyContent: "space-between", marginLeft: 60, marginTop: 8, paddingLeft: isDesktop ? 32 : 0, paddingRight: isDesktop ? 32 : 0 }}>
                  {payload.map((entry, index) => {
                    const { dataKey, color } = entry
                    return (
                      <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: isDesktop ? "30%" : "50%", marginBottom: 4 }}>
                        <div style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, marginLeft: 4 }}>{dataKey}</span>
                      </div>
                    )
                  })}
                </div>
              );
            }}
          />
          {tooltip(150, 325, "50%", false, { zIndex: 100, top: 100 }, false, 0)}
          {amrClassesForFilter.slice(1).map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const getPopulationStructureChartLabel = () => {
    if (populationStructureFilter === 1)
      return <span className="y-axis-label-vertical" style={{ marginRight: 8 }}>Number of genomes</span>
    else
      return <span className="y-axis-label-horizontal">Number of genomes</span>
  }

  function imgOnLoadPromise(obj) {
    return new Promise((resolve, reject) => {
      obj.onload = () => resolve(obj);
      obj.onerror = reject;
    });
  }

  const stopLoading = (index) => {
    switch (index) {
      case 0: setCaptureControlMapInProgress(false)
        break;
      case 1: setCaptureControlChartRFWGInProgress(false)
        break;
      case 2: setCaptureControlChartDRTInProgress(false)
        break;
      case 3: setCaptureControlChartGDInProgress(false)
        break;
      case 4: setCaptureControlChartRFWAGInProgress(false)
        break;
      default:
        break;
    }
  }

  const capturePicture = (id, index) => {
    switch (index) {
      case 0:
        setCaptureControlMapInProgress(true)
        setControlMapPosition({ coordinates: [0, 0], zoom: 1 })
        break;
      case 1: setCaptureControlChartRFWGInProgress(true)
        break;
      case 2: setCaptureControlChartDRTInProgress(true)
        break;
      case 3: setCaptureControlChartGDInProgress(true)
        break;
      case 4: setCaptureControlChartRFWAGInProgress(true)
        break;
      default:
        break;
    }

    if (index !== 0) {
      const names = ["Resistance Frequencies Within Genotypes (Chart) - TiphyNET.png", "Drug Resistance Trends (Chart) - TiphyNET.png", "Genotype Distribution (Chart) - TiphyNET.png", "Resistance determinants within all genotypes (Chart) - TiphyNET.png"]
      domtoimage.toPng(document.getElementById(id), { quality: 0.95, bgcolor: "white" })
        .then(function (dataUrl) {
          var link = document.createElement('a');
          link.download = names[index - 1];
          link.href = dataUrl;
          stopLoading(index)
          link.click();
        });
    } else {
      svgAsPngUri(document.getElementById(id), { scale: 4, backgroundColor: "white", width: 1200, left: -200 })
        .then(async (uri) => {

          let canvas = document.createElement("canvas")
          let ctx = canvas.getContext('2d');

          let mapImg = document.createElement("img");
          let mapImgPromise = imgOnLoadPromise(mapImg);
          mapImg.src = uri;
          await mapImgPromise;

          canvas.width = 3600;
          canvas.height = 1800;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

          let typhinetLogo = document.createElement("img");
          let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
          typhinetLogo.src = typhinetLogoImg;
          await typhinetLogoPromise;

          const typhinetLogoWidth = typhinetLogo.width * 0.5
          const typhinetLogoHeight = typhinetLogo.height * 0.5

          ctx.drawImage(typhinetLogo, 26, canvas.height - typhinetLogoHeight - 16, typhinetLogoWidth, typhinetLogoHeight);

          const base64 = canvas.toDataURL();
          stopLoading(index)
          download(base64, 'Genome Samples (World Map) - TyphiNET.png');
        });
    }
  }

  const dowloadBaseSpreadsheet = () => {
    axios.get(`${API_ENDPOINT}file/download`)
      .then((res) => {
        download(res.data, 'TyphiNET Database.csv');
      })
  }

  const generateMapLegendOptions = () => {
    let percentageSteps = ['1', '25', '50', '75', '100']

    switch (mapView) {
      case 'No. Samples':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0</span>
            </div>
            {[...Array(6).keys()].map((n) => {
              const samplesLegend = n !== 0 ? n * (samplesQty / 5) : 1
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapSamplesColorScale(samplesLegend) }} />
                  <span>{samplesLegend}</span>
                </div>
              )
            })}
          </>
        )
      case 'AMR Profiles':
        let amrProfiles = ['MDR_DCS', 'MDR', 'DCS', 'AzithR_MDR', 'AzithR_DCS', 'AzithR_DCS_MDR', 'XDR', 'AMR', 'AMR_DCS'].sort((a, b) => a.localeCompare(b));
        amrProfiles.push('No AMR detected')
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {amrProfiles.map((a, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForAMR(a) }} />
                  <span>{a}</span>
                </div>
              )
            })}
          </div>
        )
      case 'Dominant Genotype':
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {genotypes.map((g, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForGenotype(g) }} />
                  <span>{g}</span>
                </div>
              )
            })}
          </div>
        )
      case 'H58 / Non-H58':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "darkgrey" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((g, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(g) }} />
                  <span>{g}%</span>
                </div>
              )
            })}
          </>
        )
      case 'MDR':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'XDR':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'DCS':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'Azith':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'CipI':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'CipR':
        return (
          <>
            <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div>
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'Resistance to Drug':
        let drugs = ["Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (DCS)", "Sulphonamides", "Tetracyclines", "Trimethoprim"]
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {drugs.map((d, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForDrug(d) }} />
                  <span>{d}</span>
                </div>
              )
            })}
          </div>
        )
      case 'Plasmid Incompatibility Type':
        let incTypes = ["IncX1", "IncFIA(HI1)", "IncFIB(pHCM2)", "IncA/C2", "IncP1", "IncFIA(HI1)/IncHI1A/IncHI1B(R27)", "Col(BS512)", "IncHI1A/IncHI1B(R27)", "IncN", "IncHI1B(R27)", "p0111", "IncHI1A", "IncI1", "IncY", "IncFIB(AP001918)", "IncFIB(K)", "IncHI2/IncHI2A", "Col440I", "Col440I", "Col156", "Col440II/Col440II", "IncFIA(HI1)/IncHI1A", "ColRNAI", "ColpVC", "IncX3"].sort((a, b) => a.localeCompare(b));
        return (
          <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            {incTypes.map((d, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: getColorForIncType(d) }} />
                  <span>{d}</span>
                </div>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  const renderMapLegend = () => {
    return (
      <div className="map-legend">
        <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 12, marginTop: 2 }}>
          <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat", whiteSpace: "nowrap" }}>Select map view</InputLabel>
          <Select
            value={mapView}
            onChange={evt => setMapView(evt.target.value)}
            fullWidth
            style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }}
          >
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Dominant Genotype'}>
              Dominant Genotype
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'No. Samples'}>
              No. Samples
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'AMR Profiles'}>
              AMR Profiles
          </MenuItem> */}
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'H58 / Non-H58'}>
              H58
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Plasmid Incompatibility Type'}>
              Plasmid Incompatibility Type
          </MenuItem> */}
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'MDR'}>
              MDR
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'XDR'}>
              XDR
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'DCS'}>
              DCS
          </MenuItem> */}
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Azith'}>
              AzithR
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'CipI'}>
              CipI
          </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'CipR'}>
              CipR
          </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Resistance to Drug'}>
              Resistance to Drug
          </MenuItem> */}
          </Select>
        </FormControl>
        {generateMapLegendOptions()}
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* <dialog open id="favDialog">
        <form method="dialog">
          <section>
            <p><label for="favAnimal">Favorite animal:</label>
            <select id="favAnimal">
              <option></option>
              <option>Brine shrimp</option>
              <option>Red panda</option>
              <option>Spider monkey</option>
            </select></p>
          </section>
          <menu>
            <button id="cancel" type="reset">Cancel</button>
            <button type="submit">Confirm</button>
          </menu>
        </form>
      </dialog> */}
      <div className="info-wrapper">
        {isDesktop && (
          <>
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
              <img style={{ height: 90, marginBottom: -10 }} src={typhinetLogoImg} alt="TyphiNET" />
            </div>
            <div style={{ width: 16 }} />
          </>
        )}
        <div className="card">
          <span>Total Genomes</span>
          {totalGenomes.length === actualGenomes.length ? (
            <span className="value">{totalGenomes.length}</span>
          ) : (
            <span className="value">
              {actualGenomes.length}
              <span className="value-total">/{totalGenomes.length}</span>
            </span>
          )}
        </div>
        <div style={{ width: 16 }} />
        <div className="card">
          <span>
            Total Genotypes 
            <button id="updateDetails" className="info-button">
              Info
            </button>
          </span>
          {totalGenotypes.length === actualGenotypes.length ? (
            <span className="value">{totalGenotypes.length}</span>
          ) : (
            <span className="value">
              {actualGenotypes.length}
              <span className="value-total">/{totalGenotypes.length}</span>
            </span>
          )}
        </div>
      </div>
      <div className="map-filters-wrapper" style={{ flexDirection: 'column' }}>
        <h2 style={{ textAlign: "center" }}>Global Overview of Salmonella Typhi</h2>
        <div className="map-filters-wrapper-inside" style={{ flexDirection: isDesktop ? 'row' : 'column' }}>
          <div className="map-wrapper">
            <ComposableMap
              id="control-map"
              data-tip=""
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 210,
              }}
              style={{ height: "100%", width: "100%" }}
            >
              <ZoomableGroup
                zoom={controlMapPosition.zoom}
                center={controlMapPosition.coordinates}
                onMoveEnd={(position) => {
                  setControlMapPosition(position);
                }}
              >
                <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
                <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
                <Geographies
                  geography={geography}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const sample = worldMapSamplesData.find(s => s.displayName === geo.properties.NAME)
                      const d = worldMapComplementaryData[geo.properties.NAME]; /* .NAME || .NAME_LONG */
                      let country

                      let fill = "#F5F4F6"

                      switch (mapView) {
                        case 'No. Samples':
                          if (sample && sample.count !== 0)
                            fill = mapSamplesColorScale(sample.count);
                          break;
                        case 'AMR Profiles':
                          country = worldMapAmrProfilesData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.amrProfiles.length > 0)
                            fill = getColorForAMR(country.amrProfiles[0].name);
                          break;
                        case 'Dominant Genotype':
                          country = worldMapGenotypesData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined) {
                            const temp = country.genotypes
                            temp.sort((a, b) => a.count < b.count ? 1 : -1)
                            fill = getColorForGenotype(temp[0].lineage)
                          }
                          break;
                        case 'H58 / Non-H58':
                          country = worldMapH58Data.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.genotypes[0]) {
                            const temp = country.genotypes.find(g => g.type === 'H58')
                            switch (temp === undefined) {
                              case false:
                                fill = mapRedColorScale(temp.percentage)
                                break;
                              case 'Non-H58':
                                fill = "darkgrey"
                                break;
                              default:
                                break;
                            }
                          }
                          break;
                        case 'MDR':
                          country = worldMapMDRData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage)
                            fill = mapRedColorScale(country.percentage);
                          break;
                        case 'XDR':
                          country = worldMapXDRData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage)
                            fill = mapRedColorScale(country.percentage);
                          break;
                        case 'DCS':
                          country = worldMapDCSData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage)
                            fill = mapRedColorScale(country.percentage);
                          break;
                        case 'Azith':
                          country = worldMapAZITHData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage)
                            fill = mapRedColorScale(country.percentage);
                          break;
                        case 'CipI':
                          country = worldMapCIPIData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage)
                            fill = mapRedColorScale(country.percentage);
                          break;
                        case 'CipR':
                          country = worldMapCIPRData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.percentage)
                            fill = mapRedColorScale(country.percentage);
                          break;
                        case 'Resistance to Drug':
                          country = worldMapDrugsData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.drugs.length > 0)
                            fill = getColorForDrug(country.drugs[0].name);
                          break;
                        case 'Plasmid Incompatibility Type':
                          country = worldMapPlasmidIncompatibilityTypeData.find(s => s.displayName === geo.properties.NAME)
                          if (country !== undefined && country.incTypes.length > 0)
                            fill = getColorForIncType(country.incTypes[0].type);
                          break;
                        default:
                          break;
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          cursor="pointer"
                          fill={fill}
                          onClick={() => {
                            if (d !== undefined && sample !== undefined)
                              setActualCountry(sample.name)
                          }}
                          onMouseEnter={() => {
                            const { NAME } = geo.properties;
                            switch (mapView) {
                              case 'No. Samples':
                                if (sample !== undefined && d !== undefined) {
                                  setTooltipContent({
                                    name: NAME,
                                    additionalInfo: {
                                      samples: sample.count,
                                      genotypes: d.GENOTYPES.TOTAL,
                                      H58: Math.round(d.H58) !== d.H58 ? d.H58.toFixed(2) : d.H58,
                                      MDR: Math.round(d.MDR) !== d.MDR ? d.MDR.toFixed(2) : d.MDR,
                                      DCS: Math.round(d.DCS) !== d.DCS ? d.DCS.toFixed(2) : d.DCS,
                                      CipI: Math.round(d.CipI) !== d.CipI ? d.CipI.toFixed(2) : d.CipI,
                                      CipR: Math.round(d.CipR) !== d.CipR ? d.CipR.toFixed(2) : d.CipR,
                                      AzithR: Math.round(d.AzithR) !== d.AzithR ? d.AzithR.toFixed(2) : d.AzithR
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'AMR Profiles':
                                if (country !== undefined) {
                                  setTooltipContent({
                                    name: NAME,
                                    amrProfilesInfo: country.amrProfiles
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Dominant Genotype':
                                if (country !== undefined) {
                                  let temp = country.genotypes
                                  temp.sort((a, b) => a.count < b.count ? 1 : -1)
                                  setTooltipContent({
                                    name: NAME,
                                    genotypeInfo: temp
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'H58 / Non-H58':
                                if (country !== undefined && country.genotypes.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    simpleGenotypeInfo: country.genotypes
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'MDR':
                                if (country !== undefined && country.MDRs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    mdrInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'XDR':
                                if (country !== undefined && country.XDRs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    xdrInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'DCS':
                                if (country !== undefined && country.DCSs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    dcsInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Azith':
                                if (country !== undefined && country.AZs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    azInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'CipI':
                                if (country !== undefined && country.CipIs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    cipIInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'CipR':
                                if (country !== undefined && country.CipRs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    cipRInfo: {
                                      count: country.count,
                                      percentage: country.percentage,
                                    }
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Resistance to Drug':
                                if (country !== undefined && country.drugs.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    drugsInfo: country.drugs
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              case 'Plasmid Incompatibility Type':
                                if (country !== undefined && country.incTypes.length > 0) {
                                  setTooltipContent({
                                    name: NAME,
                                    incTypesInfo: country.incTypes
                                  });
                                } else {
                                  setTooltipContent({
                                    name: NAME
                                  })
                                }
                                break;
                              default:
                                break;
                            }
                          }}
                          onMouseLeave={() => {
                            setTooltipContent(null);
                          }}
                          style={{
                            default: {
                              outline: "none",
                            },
                            hover: {
                              fill: "#CFD8DC",
                              stroke: "#607D8B",
                              strokeWidth: 1,
                              outline: "none",
                            },
                            pressed: {
                              fill: "#FF5722",
                              stroke: "#607D8B",
                              strokeWidth: 1,
                              outline: "none",
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>

            </ComposableMap>
            {(samplesQty > 0 && isDesktop) && (
              <div className="map-upper-right-buttons">
                {renderMapLegend()}
              </div>
            )}
            {(samplesQty > 0 && isDesktop) && (
              <div className="map-upper-left-buttons ">
                <div className="map-filters" style={{ width: isDesktop ? 200 : "-webkit-fill-available" }}>
                  <span style={{ fontWeight: 600, fontSize: 20, marginBottom: 20 }}>Filters</span>
                  <div style={{ marginBottom: 16 }}>
                    <Typography style={{ fontWeight: 500, fontFamily: "Montserrat", color: "rgb(117,117,117)", fontSize: 12 }}>
                      Select dataset
                    </Typography>
                    <ToggleButtonGroup
                      value={dataset}
                      exclusive
                      size="small"
                      style={{ marginTop: 5 }}
                      onChange={(evt, newDataset) => {
                        if (newDataset !== null)
                          setDataset(newDataset)
                      }}
                    >
                      <CustomToggleButton value="full">
                        All
                      </CustomToggleButton>
                      <CustomToggleButton value="global">
                        Local
                      </CustomToggleButton>
                      <CustomToggleButton value="local">
                        Travel
                      </CustomToggleButton>
                    </ToggleButtonGroup>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Typography gutterBottom style={{ fontWeight: 500, fontFamily: "Montserrat", color: "rgb(117,117,117)", fontSize: 12 }}>
                      Select time period
                    </Typography>
                    <CustomSlider
                      value={actualTimePeriodRange}
                      min={timePeriodRange[0]}
                      max={timePeriodRange[1]}
                      marks
                      step={10}
                      onChange={(evt, value) => {
                        setActualTimePeriodRange(value)
                      }}
                      valueLabelDisplay="auto"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="map-lower-left-buttons">
              <Zoom in={controlMapPosition.zoom !== 1 || controlMapPosition.coordinates.some(c => c !== 0)}>
                <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Recenter Map</span>} placement="right">
                  <div
                    className="button"
                    onClick={() => setControlMapPosition({ coordinates: [0, 0], zoom: 1 })}
                  >
                    <FontAwesomeIcon icon={faCrosshairs} />
                  </div>
                </TooltipMaterialUI>
              </Zoom>
              <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Zoom In</span>} placement="right">
                <div
                  className="button"
                  onClick={() => {
                    if (controlMapPosition.zoom >= 4) return;
                    setControlMapPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </div>
              </TooltipMaterialUI>
              <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Zoom Out</span>} placement="right">
                <div
                  className="button"
                  onClick={() => {
                    if (controlMapPosition.zoom <= 1) return;
                    if (controlMapPosition.zoom / 2 === 1) {
                      setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
                    } else {
                      setControlMapPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </div>
              </TooltipMaterialUI>
            </div>
            <div className="map-lower-right-buttons">
              <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Map as PNG</span>} placement="left">
                <div
                  className={`button ${captureControlMapInProgress && "disabled"}`}
                  onClick={() => {
                    if (!captureControlMapInProgress)
                      capturePicture('control-map', 0)
                  }}
                >
                  <FontAwesomeIcon icon={faCamera} />
                </div>
              </TooltipMaterialUI>
              {captureControlMapInProgress && (
                <CustomCircularProgress
                  size={54}
                  thickness={4}
                  style={{ position: "absolute", top: 5, left: -7 }} />
              )}
            </div>
          </div>
          {(samplesQty > 0 && !isDesktop) && (
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              {renderMapLegend()}
            </div>
          )}
          <ReactTooltip>
            {tooltipContent && (
              <div className="tooltip-map">
                <span className="country">{tooltipContent.name}</span>
                {tooltipContent.additionalInfo && (
                  <div className="additional-info">
                    <span>Samples: {tooltipContent.additionalInfo.samples}</span>
                    <span>Genotypes: {tooltipContent.additionalInfo.genotypes}</span>
                    <span>H58: {tooltipContent.additionalInfo.H58}%</span>
                    <span>MDR: {tooltipContent.additionalInfo.MDR}%</span>
                    <span>DCS: {tooltipContent.additionalInfo.DCS}%</span>
                    <span>AzithR: {tooltipContent.additionalInfo.AzithR}%</span>
                    <span>CipI: {tooltipContent.additionalInfo.CipI}%</span>
                    <span>CipR: {tooltipContent.additionalInfo.CipR}%</span>
                  </div>
                )}
                {tooltipContent.genotypeInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.genotypeInfo.map((genotype, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForGenotype(genotype.lineage) }} />
                            <span>{genotype.lineage}: {genotype.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {tooltipContent.simpleGenotypeInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.simpleGenotypeInfo[0].type === "H58" ? (
                      <span>{tooltipContent.simpleGenotypeInfo[0].type}: {tooltipContent.simpleGenotypeInfo[0].count} ({tooltipContent.simpleGenotypeInfo[0].percentage}%)</span>
                    ) : tooltipContent.simpleGenotypeInfo.length > 1 && tooltipContent.simpleGenotypeInfo[1].type === "H58" ? (
                      <span>{tooltipContent.simpleGenotypeInfo[1].type}: {tooltipContent.simpleGenotypeInfo[1].count} ({tooltipContent.simpleGenotypeInfo[1].percentage}%)</span>
                    ) : (
                      <span>H58: 0 (0%)</span>
                    )}
                  </div>
                )}
                {tooltipContent.mdrInfo && (
                  <div className="additional-info">
                    <span>MDR: {tooltipContent.mdrInfo.count} ({tooltipContent.mdrInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.xdrInfo && (
                  <div className="additional-info">
                    <span>XDR: {tooltipContent.xdrInfo.count} ({tooltipContent.xdrInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.dcsInfo && (
                  <div className="additional-info">
                    <span>DCS: {tooltipContent.dcsInfo.count} ({tooltipContent.dcsInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.azInfo && (
                  <div className="additional-info">
                    <span>AzithR: {tooltipContent.azInfo.count} ({tooltipContent.azInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.cipIInfo && (
                  <div className="additional-info">
                    <span>CipI: {tooltipContent.cipIInfo.count} ({tooltipContent.cipIInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.cipRInfo && (
                  <div className="additional-info">
                    <span>CipR: {tooltipContent.cipRInfo.count} ({tooltipContent.cipRInfo.percentage}%)</span>
                  </div>
                )}
                {tooltipContent.drugsInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.drugsInfo.map((drug, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForDrug(drug.name) }} />
                            <span>{drug.name}: {drug.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {tooltipContent.amrProfilesInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.amrProfilesInfo.map((amr, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForAMR(amr.name) }} />
                            <span>{amr.name}: {amr.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {tooltipContent.incTypesInfo && (
                  <div className="additional-info" style={{ marginTop: 4 }}>
                    {tooltipContent.incTypesInfo.map((incType, index) => {
                      if (index < 5) {
                        return (
                          <div key={index} className="genotype">
                            <div className="color" style={{ backgroundColor: getColorForIncType(incType.type) }} />
                            <span>{incType.type}: {incType.count}</span>
                          </div>
                        )
                      } else
                        return null;
                    })}
                  </div>
                )}
                {(!tooltipContent.incTypesInfo && !tooltipContent.amrProfilesInfo && !tooltipContent.drugsInfo && !tooltipContent.xdrInfo && !tooltipContent.mdrInfo && !tooltipContent.dcsInfo && !tooltipContent.azInfo && !tooltipContent.cipIInfo && !tooltipContent.cipRInfo && !tooltipContent.simpleGenotypeInfo && !tooltipContent.genotypeInfo && !tooltipContent.additionalInfo) && (
                  <div className="additional-info">
                    <span>No reported data</span>
                  </div>
                )}
              </div>
            )}
          </ReactTooltip>
        </div>
      </div>
      <div className="chart-wrapper" style={{ flexDirection: 'column' }}>
        <h2 style={{ textAlign: "center" }}>Now showing: {dataset === "full" ? "All" : dataset === "global" ? "Local" : "Travel"} data from {actualCountry === "All" ? "all countries" : actualCountry} from {actualTimePeriodRange.toString().substring(0, 4)} to {actualTimePeriodRange.toString().substring(5)}</h2>
        <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 16, alignItems: "center", textAlign: "center" }}>
          <label style={{ fontWeight: 500, fontFamily: "Montserrat", whiteSpace: "nowrap", fontSize: 18 }}>Select country (or click map)</label>
          <Select
            value={actualCountry}
            onChange={evt => setActualCountry(evt.target.value)}
            fullWidth
            style={{ fontWeight: 600, fontFamily: "Montserrat", width: 200, textAlign: "left" }}
          >
            {countriesForFilter.map((country, index) => {
              return (
                <MenuItem key={index} style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={country}>
                  {country}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", marginTop: 16, paddingBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 0.5, marginRight: 30}}>
              <div id="RFWG" style={{ height: 458, minWidth: 200, width: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ width: "100%", flexDirection: "row", whiteSpace: "nowrap", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span style={{ paddingRight: 32, marginRight: -22 }} className="chart-title">Resistance frequencies within genotypes</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartRFWGInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartRFWGInProgress)
                            capturePicture('RFWG', 1)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartRFWGInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <span className="chart-title" style={{ marginRight: -22, marginBottom: -8, fontSize: 10, fontWeight: 400 }}>Top Five Genotypes</span>
                <div style={{ height: 420, display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <span className="y-axis-label-vertical" style={{ marginRight: 8, marginBottom: isDesktop ? 84 : 154 }}>Number of occurrences</span>
                  {plotDrugsAndGenotypesChart()}
                </div>
              </div>
              <div id="RFWAG" style={{ width: "100%", display: "flex", flexDirection: "column", paddingTop: 50 }}>
                <div style={{ width: "100%", flexDirection: "row", whiteSpace: "nowrap", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Resistance determinants within all genotypes</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartRFWAGInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartRFWAGInProgress)
                            capturePicture('RFWAG', 4)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartRFWAGInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <span className="chart-title" style={{ fontSize: 10, fontWeight: 400, paddingBottom: 10 }}>Top Ten Genotypes</span>
                <div style={{ width: isDesktop ? "60%" : "90%", alignSelf: "center", marginBottom: -4, marginRight: isDesktop ? "-10%" : 0 }}>
                  <FormControl fullWidth className={classes.formControlSelect} style={{ marginTop: 0 }}>
                    <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Select Drug Class</InputLabel>
                    <Select
                      value={amrClassFilter}
                      onChange={evt => setAmrClassFilter(evt.target.value)}
                      fullWidth
                      style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                    >
                      {amrClassesForFilter.map((amrClass, index) => {
                        return (
                          <MenuItem key={index} style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={amrClass}>
                            {amrClass}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </div>
                <div style={{ height: 350, display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <span className="y-axis-label-vertical" style={{ marginRight: 8 }}>Number of occurrences</span>
                  {plotAmrClassChart()}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 0.5, marginRight: -30 }}>
              <div id="DRT" style={{ minWidth: 200, width: "100%", display: "flex", flexDirection: "column", marginTop: 5 }}>
                <div style={{ width: "100%", flexDirection: "row", whiteSpace: "nowrap", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Drug resistance trends</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartDRTInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartDRTInProgress)
                            capturePicture('DRT', 2)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartDRTInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <div style={{ height: 422, display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <span className="y-axis-label-vertical" style={{ marginRight: 8, paddingBottom: isDesktop ? 84 : 124 }}>Number of occurrences</span>
                  {plotDrugTrendsChart()}
                </div>
              </div>
              <div id="GD" style={{ width: "100%", display: "flex", flexDirection: "column", paddingTop: 47 }}>
                <div style={{ width: "100%", flexDirection: "row", whiteSpace: "nowrap", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Genotype distribution</span>
                  <div style={{ display: "inline-block", position: "relative" }}>
                    <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                      <div
                        style={{ marginTop: "0", height: "33px", width: "33px" }}
                        className={`button ${captureControlChartGDInProgress && "disabled"}`}
                        onClick={() => {
                          if (!captureControlChartGDInProgress)
                            capturePicture('GD', 3)
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size="sm" />
                      </div>
                    </TooltipMaterialUI>
                    {captureControlChartGDInProgress && (
                      <CustomCircularProgress
                        size={44}
                        thickness={4}
                        style={{ position: "absolute", top: -5, left: -6 }} />
                    )}
                  </div>
                </div>
                <div style={{ width: isDesktop ? "60%" : "90%", alignSelf: "center", paddingRight: isDesktop && populationStructureFilter !== 1 ? "-10%" : 0, paddingBottom: populationStructureFilter === 1 ? -8 : 16 }}>
                  <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 5, marginTop: 23 }}>
                    <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Population Structure</InputLabel>
                    <Select
                      value={populationStructureFilter}
                      onChange={evt => setPopulationStructureFilter(evt.target.value)}
                      fullWidth
                      style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                    >
                      <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                        Genotype
                      </MenuItem>
                      <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                        H58 / Non-H58
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div style={{ height: 350, display: "flex", flexDirection: populationStructureFilter === 1 ? "row" : "column-reverse", alignItems: "center", marginLeft: populationStructureFilter === 2 ? -22 : 0 }}>
                  {getPopulationStructureChartLabel()}
                  {plotPopulationStructureChart()}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", padding: 12, alignItems: "center", width: "-webkit-fill-available", justifyContent: "center" }}>
            <div className="download-sheet-button" onClick={() => dowloadBaseSpreadsheet()}>
              <FontAwesomeIcon icon={faTable} style={{ marginRight: 8 }} />
              <span>Download TyphiNET Database</span>
            </div>
          </div>
        </div>
      </div>
      <div className="about-wrapper">
        <h2 style={{ marginBottom: 0 }}>About TyphiNET</h2>
        <p>
          TyphiNET is a multi-institutional global collaborative network. Our goal is to facilitate data sharing, and assist in removing barriers to the re-use of pathogen genomic data from both endemic surveillance projects, as well as those data routinely generated by public health reference laboratories, for global public health benefit.
        </p>
        <p>
          The TyphiNET online platform is designed to collate all available whole genome sequence (WGS) data from the bacterial pathogen Salmonella Typhi. As bacterial WGS data is uniquely enriched with many characteristics of the infecting pathogen, we aim to provide up to date global estimates of both antimicrobial resistance and circulating genotypes for S. Typhi. We aim to improve global typhoid fever surveillance in the short term, and to provide evidence to assist in the improvement of intervention strategies and treatment guidelines for this pathogen in the long term.
        </p>
        <p>
          TyphiNET is coordinated by Dr Zoe Dyson, Dr Louise Cerdeira and Prof Kat Holt. We are based at the Department of Infection Biology at the <a href="https://www.lshtm.ac.uk/" target="_blank" rel="noreferrer">London School of Hygiene and Tropical Medicine</a>, as well as the Department of Infectious Diseases at <a href="https://www.monash.edu/medicine/ccs/infectious-diseases/home" target="_blank" rel="noreferrer">Monash University</a>. For more information about Holt lab projects and members, please visit the <a href="https://holtlab.net/" target="_blank" rel="noreferrer">Holt Lab website</a>.
        </p>
        <p>
          TyphiNET has received funding from the European Union's Horizon 2020 research and innovation programme under the Marie Skłodowska-Curie grant agreement TyphiNET No 845681. We are also grateful to the Wellcome Trust for support from their Open Research Fund programme (219692/Z/19/Z). Follow us on <a href="https://twitter.com/typhinet" target="_blank" rel="noreferrer">Twitter</a>.
        </p>
        <h2 style={{ marginBottom: 0 }}>Genomic analysis framework:</h2>
        <p>
          TyphiNET utilises the <a href="https://github.com/katholt/genotyphi/" target="_blank" rel="noreferrer">GenoTyphi</a> genotyping scheme, publised by <a href="https://www.nature.com/articles/ncomms12827" target="_blank" rel="noreferrer">Wong <i>et al.</i> 2016</a>, and discussed in this <a href="https://holtlab.net/2016/10/12/global-picture-typhoid/" target="_blank" rel="noreferrer">blog post</a>.  Data are sourced monthly from the <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">Pathogenwatch</a> online data analysis platform described in this <a href="https://www.biorxiv.org/content/10.1101/2020.07.03.186692v1.abstract" target="_blank" rel="noreferrer">preprint</a> by Argimón <i>et al.</i> 2020.
      </p>
      </div>
      <div className="footer-buttons-wrapper">
        <div
          className="flex-button"
          onClick={() => {
            setContactModalVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Contact</span>
        </div>
        <div
          className="flex-button"
          onClick={() => {
            window.open('https://github.com/zadyson/TyphiNET', '_blank')
          }}
        >
          <FontAwesomeIcon icon={faGithub} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>GitHub</span>
        </div>
        <div
          className="flex-button"
          onClick={() => {
            window.open('https://twitter.com/typhinet', '_blank')
          }}
        >
          <FontAwesomeIcon icon={faTwitter} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Twitter</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <span>Data obtained from: <a href="https://pathogen.watch" rel="noreferrer" target="_blank">pathogen watch project</a> on 07/02/2021.</span>
        <span><a href="https://holtlab.net" rel="noreferrer" target="_blank">Holt Lab</a></span>
      </div>

      <div style={{ zIndex: 1000 }}>
        <Rodal
          visible={contactModalVisible}
          showCloseButton={false}
          customStyles={{ padding: 0, overflow: "hidden", width: isDesktop ? "75%" : "95%", height: isDesktop ? "75%" : "95%" }}
          onClose={() => {
            setContactModalVisible(false);
          }}
        >
          <div style={{ backgroundColor: "transparent", height: "100%", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
              <div
                className="modal-close-button"
                style={{ position: "absolute", right: 24, top: 24, height: 24, width: 24, zIndex: 500 }}
                onClick={() => {
                  setContactModalVisible(false);
                }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 8, color: "black", fontSize: 24 }} />
              </div>
              <div style={{
                padding: 32, height: "100%", width: "-webkit-fill-available", display: "flex", flexDirection: "column", overflowY: "scroll"
              }}>
                <span style={{ fontWeight: 600, fontSize: 20, marginBottom: 20 }}>Contact</span>
                <ContactPage />
              </div>
            </div>
          </div>
        </Rodal>
      </div>
    </div>
  );
};

>>>>>>> 38f7e72d69851b8727141004db43546b36809f22
export default DashboardPage;