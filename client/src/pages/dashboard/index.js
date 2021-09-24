import './index.css';
import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import Loader from "react-loader-spinner";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from "react-simple-maps";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import TooltipMaterialUI from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ReactTooltip from "react-tooltip";
import { BarChart, Bar, XAxis, Label, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, LineChart, Line, Legend } from 'recharts';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faCrosshairs, faCamera, faTable, faFilePdf, faInfoCircle, faUndoAlt } from '@fortawesome/free-solid-svg-icons'
import download from 'downloadjs';
import { svgAsPngUri } from 'save-svg-as-png';
import typhinetLogoImg from '../../assets/img/logo-typhinet.png';
import typhinetLogoImg2 from '../../assets/img/logo-typhinet.png';
import geography from '../../assets/world-110m.json'
import { API_ENDPOINT } from '../../constants';
import { getColorForGenotype, getColorForAMR, getColorForDrug, getColorForIncType, getColorForTetracyclines } from '../../util/colorHelper';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { Select as DropDownSelect } from "react-dropdown-select"
import 'rodal/lib/rodal.css';
import domtoimage from 'dom-to-image';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { jsPDF } from "jspdf";
import { useStyles, CustomSlider, CustomCircularProgress, CustomToggleButton, Buttons, ButtonClearSelect } from './materialUI'

const DashboardPage = () => {
  const classes = useStyles();

  const [controlMapPosition, setControlMapPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  const [worldMapSamplesData, setWorldMapSamplesData] = useState([]);
  const [worldMapComplementaryData, setWorldMapComplementaryData] = useState({});
  const [worldMapGenotypesData, setWorldMapGenotypesData] = useState([]);
  const [worldMapH58Data, setWorldMapH58Data] = useState([]);
  const [worldMapMDRData, setWorldMapMDRData] = useState([]);
  const [worldMapSTADData, setWorldMapSTADData] = useState([]);
  const [worldMapXDRData, setWorldMapXDRData] = useState([]);
  const [worldMapDCSData, setWorldMapDCSData] = useState([]);
  const [worldMapAZITHData, setWorldMapAZITHData] = useState([]);
  const [worldMapCIPIData, setWorldMapCIPIData] = useState([]);
  const [worldMapCIPRData, setWorldMapCIPRData] = useState([]);
  const [worldMapDrugsData, setWorldMapDrugsData] = useState([]);
  const [worldMapAmrProfilesData, setWorldMapAmrProfilesData] = useState([]);
  const [worldMapPlasmidIncompatibilityTypeData, setWorldMapPlasmidIncompatibilityTypeData] = useState([]);

  const [plotAmrClassChart, setPlotAmrClassChart] = useState(function () { })
  const [plotDrugsAndGenotypesChart, setPlotDrugsAndGenotypesChart] = useState(function () { })
  const [plotPopulationStructureChart, setPlotPopulationStructureChart] = useState(function () { })
  const [plotDrugTrendsChart, setPlotDrugTrendsChart] = useState(function () { })

  const [captureControlMapInProgress, setCaptureControlMapInProgress] = useState(false)
  const [captureControlChartRFWGInProgress, setCaptureControlChartRFWGInProgress] = useState(false)
  const [captureControlChartDRTInProgress, setCaptureControlChartDRTInProgress] = useState(false)
  const [captureControlChartGDInProgress, setCaptureControlChartGDInProgress] = useState(false)
  const [captureControlChartRFWAGInProgress, setCaptureControlChartRFWAGInProgress] = useState(false)
  const [captureReportInProgress, setCaptureReportInProgress] = useState(false)
  const [tooltipContent, setTooltipContent] = useState(null);

  const [timePeriodRange, setTimePeriodRange] = React.useState([1905, 2020]);
  const [actualTimePeriodRange, setActualTimePeriodRange] = React.useState([1905, 2020]);
  const [countriesForFilter, setCountriesForFilter] = React.useState(['All']);
  const [regionsForFilter, setRegionsForFilter] = React.useState(['All']);
  const [actualCountry, setActualCountry] = useState("All");
  const [actualRegion, setActualRegion] = useState("All");
  const [years, setYears] = useState([1905, 2020])

  const [actualContinent, setActualContinent] = useState("All")
  const [continentOptions] = useState(['All', 'Africa', 'Asia', 'Central America', 'Europe', 'North America', 'Oceania', 'South America'])

  const [populationStructureFilter, setPopulationStructureFilter] = React.useState(1);
  const [populationStructureFilterOptions] = useState([{ value: 'Number of genomes', id: 1 }, { value: 'Percentage per year', id: 2 }])
  const [RFWGFilterOptions] = useState([{ value: 'Number of genomes', id: 1 }, { value: 'Percentage within genotype', id: 2 }])
  const [amrClassFilterOptions] = useState([{ value: 'Number of genomes', id: 1 }, { value: 'Percentage per genotype', id: 2 }])
  const [amrClassFilterforFilterOptions] = useState([{ value: "Ampicillin", id: 0 }, { value: "Azithromycin", id: 1 }, { value: "Chloramphenicol", id: 2 }, { value: "Co-trimoxazole", id: 3 }, { value: "ESBL", id: 4 }, { value: "Fluoroquinolones (CipI/R)", id: 5 }, { value: "Sulphonamides", id: 6 }, { value: "Tetracyclines", id: 7 }, { value: "Trimethoprim", id: 8 }])

  const [RFWGFilter, setRFWGFilter] = React.useState(2);
  const [amrClassesForFilter] = useState(["Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (CipI/R)", "Sulphonamides", "Tetracyclines", "Trimethoprim"])
  const [drtClassesForFilter] = useState(["Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (CipI/R)", "Susceptible", "Sulphonamides", "Tetracyclines", "Trimethoprim"])
  const [trendClassesForFilter] = useState(["Ampicillin", "Azithromycin", "Chloramphenicol", /*"Fluoroquinolone (CipI)",*/ "Fluoroquinolones (CipR)", "Co-trimoxazole", "ESBL", "Fluoroquinolones (CipI/R)", "Susceptible", "Sulphonamides", "Tetracyclines", "Trimethoprim"])
  const [trendDropdownOptions] = useState([{ value: "Ampicillin", id: 0 }, { value: "Azithromycin", id: 1 }, { value: "Chloramphenicol", id: 2 }, /*{value: "Fluoroquinolone (CipI)", id: 3},*/ { value: "Fluoroquinolones (CipR)", id: 3 }, { value: "Co-trimoxazole", id: 4 }, { value: "ESBL", id: 5 }, { value: "Fluoroquinolones (CipI/R)", id: 6 }, { value: "Susceptible", id: 7 }, { value: "Sulphonamides", id: 8 }, { value: "Tetracyclines", id: 9 }, { value: "Trimethoprim", id: 10 }])
  const [amrClassFilter, setAmrClassFilter] = React.useState(amrClassesForFilter[5])
  const [RDWAGDataviewFilter, setRDWAGDataviewFilter] = React.useState(2)

  const [drugTrendsChartData, setDrugTrendsChartData] = useState([])
  const [drugsAndGenotypesChartData, setDrugsAndGenotypesChartData] = useState([])
  const [chartMaxHeight, setChartMaxHeight] = useState(0)
  const [populationStructureChartData, setPopulationStructureChartData] = useState([])
  const [amrClassChartData, setAmrClassChartData] = useState([])

  const [mapView, setMapView] = React.useState('CipI');
  const [dataset, setDataset] = React.useState('All');
  const [totalGenomes, setTotalGenomes] = useState([])
  const [actualGenomes, setActualGenomes] = useState([])
  const [totalGenotypes, setTotalGenotypes] = useState([])
  const [actualGenotypes, setActualGenotypes] = useState([])
  const [appLoading, setAppLoading] = useState(0)

  const [allGenotypes, setAllGenotypes] = useState({})

  const [brushRFWG, setBrushRFWG] = useState([])
  const [brushDRT, setBrushDRT] = useState([])
  const [brushRDWAG, setBrushRDWAG] = useState([])
  const [brushGD, setBrushGD] = useState([])

  const [trendValues, setTrendValues] = React.useState(trendDropdownOptions)

  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleClickOpen3 = () => {
    setOpen3(true);
  };

  const handleClose3 = () => {
    setOpen3(false);
  };

  const handleClickOpen4 = () => {
    setOpen4(true);
  };

  const handleClose4 = () => {
    setOpen4(false);
  };

  const [desktop] = useState(767)
  const [mobile] = useState(500)
  const [middle] = useState(1300)

  const [hoverColor] = useState("#D2F1F6")

  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  function debounce(fn, ms) {
    let timer
    return _ => {
      clearTimeout(timer)
      timer = setTimeout(_ => {
        timer = null
        fn.apply(this, arguments)
      }, ms)
    };
  }

  useEffect(() => {
    if (appLoading === 0) {
      document.getElementsByClassName('App')[0].style.overflow = 'hidden'
    } else if (appLoading === 2) {
      document.getElementsByClassName('App')[0].style.overflow = 'visible'
      document.getElementsByClassName('loading')[0].remove()
    }
  }, [appLoading])

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      })
    }, 1000)

    window.addEventListener('resize', debouncedHandleResize)

    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })

  const [genotypes] = useState([
    '0', '0.0.1', '0.0.2', '0.0.3', '0.1',
    '0.1.1', '0.1.2', '0.1.3', '1.1', '1.1.1',
    '1.1.2', '1.1.3', '1.1.4', '1.2', '1.2.1',
    '2', '2.0.1', '2.0.2', '2.1',
    '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5', '2.1.6',
    '2.1.7', '2.1.8', '2.1.9', '2.1.7.1', '2.1.7.2', '2.2',
    '2.2.1', '2.2.2', '2.2.3', '2.2.4',
    '2.3', '2.3.1', '2.3.2', '2.3.3', '2.3.4',
    '2.3.5', '2.4', '2.4.1', '2.5',
    '2.5.1', '2.5.2', '3', '3.0.1', '3.0.2',
    '3.1', '3.1.1', '3.1.2', '3.2',
    '3.2.1', '3.2.2', '3.3', '3.3.1',
    '3.3.2', '3.3.2.Bd1', '3.3.2.Bd2', '3.4',
    '3.5', '3.5.1', '3.5.2', '3.5.3',
    '3.5.4', '4', '4.1', '4.1.1', '4.2', '4.2.1',
    '4.2.2', '4.2.3', /*'4.3', '4.3.0', */'4.3.1', '4.3.1.1',
    '4.3.1.1.P1', '4.3.1.1.EA1', '4.3.1.2', '4.3.1.2.EA2',
    '4.3.1.2.EA3', '4.3.1.3', '4.3.1.3.Bdq'].sort((a, b) => a.localeCompare(b)));

  useEffect(() => {
    axios.get(`${API_ENDPOINT}filters/getYearLimits`)
      .then((res) => {
        let limits = res.data
        setTimePeriodRange([limits.min, limits.max])
        setActualTimePeriodRange([limits.min, limits.max])
        // setAllCountries(limits.countries)
        setAllGenotypes(limits.allGenotypes)
        setTotalGenotypes(limits.totalGenotypes)
        setAppLoading((value) => value + 1)
        setYears(limits.years)
      })
  }, [])

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      axios.get(`${API_ENDPOINT}filters/all/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}/all`)
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
    const parseDataForGenotypeChart = (data) => {
      let finalRegions = [];
      var finalPopulationStructureChartData = [];

      var genomes = data;
      var genotypes = [];

      data.forEach((entry) => {
        if (!finalRegions.some(e => e === entry['REGION_IN_COUNTRY']) && entry['REGION_IN_COUNTRY'] !== "-" && entry['REGION_IN_COUNTRY'] !== "")
          finalRegions.push(entry['REGION_IN_COUNTRY'])

        if (!genotypes.some(g => g === entry.GENOTYPE)) {
          genotypes.push(entry.GENOTYPE)
        }

        /* POPULATION STRUCTURE CHART GENERATION */
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
      })

      finalRegions.sort((a, b) => a.localeCompare(b));
      finalRegions.unshift("All");
      setRegionsForFilter(finalRegions)

      if (totalGenomes.length === 0)
        setTotalGenomes(genomes)

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

      if (!arraysEqual(finalPopulationStructureChartData, populationStructureChartData)) {
        setPopulationStructureChartData(finalPopulationStructureChartData)
        if (finalPopulationStructureChartData.length > 0) {
          setBrushGD([finalPopulationStructureChartData[0].name, finalPopulationStructureChartData[finalPopulationStructureChartData.length - 1].name])
        } else {
          setBrushGD(['Undefined', 'Undefined'])
        }
      }

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

        if (highestSum > chartMaxHeight)
          setChartMaxHeight(Math.ceil(highestSum / 100) * 100)
      }
    }

    const parseDataForCountryMap = (data) => {
      let finalCountries = [];

      let samplesData = [], genotypesData = [], h58Data = [], mdrData = [], stadData = [], xdrData = [], drugsData = [], amrData = [], incTypesData = [], dcsData = [], azithData = [], cipIData = [], cipRData = [];

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

      stadData = countData(data, "STAD", "STADs", "type")
      stadData.forEach(country => {
        country.STADs.forEach((stad, index) => {
          if (stad.type === "No AMR detected") {
            let percentage = ((stad.count / country.total) * 100)
            if (Math.round(percentage) !== percentage)
              percentage = percentage.toFixed(2)
            percentage = parseFloat(percentage);
            country.percentage = percentage;
            country.count = stad.count;
          }
        })
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
      })
      if (!arraysEqual(stadData, worldMapSTADData))
        setWorldMapSTADData(stadData)

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
      
      cipIData = countData(data, "CipI", "CipIs", "type")
      cipIData.forEach(country => {
        let aux = country.CipIs.filter(x => x.type === 'CipI')
        let aux2 = country.CipIs.filter(x => x.type === 'CipR')
        if (aux.length) {
          aux[0].percentage = (aux[0].count / country.total) * 100
          aux = aux[0].count
        } else {
          aux = 0
        }
        if (aux2.length) {
          aux2[0].percentage = (aux2[0].count / country.total) * 100
          aux2 = aux2[0].count
        } else {
          aux2 = 0
        }

        let percentage = ((aux + aux2) / country.total) * 100
        if (Math.round(percentage) !== percentage)
          percentage = percentage.toFixed(2)
        percentage = parseFloat(percentage);
        country.percentage = percentage;
        country.count = aux + aux2;
        if (country.percentage === undefined) {
          country.percentage = parseFloat(0)
        }
        if (country.count === undefined) {
          country.count = 0
        }
        // country.CipIs.forEach((cipIs, index) => {
        //   if (cipIs.type === "CipI") {
        //     let percentage = ((cipIs.count / country.total) * 100)
        //     if (Math.round(percentage) !== percentage)
        //       percentage = percentage.toFixed(2)
        //     percentage = parseFloat(percentage);
        //     country.percentage = percentage;
        //     country.count = cipIs.count;
        //   }
        //   if (country.percentage === undefined) {
        //     country.percentage = parseFloat(0)
        //   }
        //   if (country.count === undefined) {
        //     country.count = 0
        //   }
        // })
      })
      if (!arraysEqual(cipIData, worldMapCIPIData))
        setWorldMapCIPIData(cipIData)

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

      let genotypes = []
      finalChartData.forEach(element => {
        let keys = Object.keys(element).slice(1)
        let filteredData = keys.filter((key) => { return !(key.includes('No')) && !(key.includes('0_')) })
        filteredData.push('None')
        filteredData.push('None (CipS)')
        if (filteredData.length === 0) {
          genotypes.push(element.genotype)
        }
      });

      for (const genotype in genotypes) {
        finalChartData = finalChartData.filter((obj) => {
          return obj.genotype !== genotypes[genotype]
        })
      }

      finalChartData.forEach((data) => {
        let sum = 0;
        Object.entries(data).forEach((entry) => {
          if (entry[0] !== "genotype" && entry[0] !== "undefined") {
            let errorMargin = Math.ceil(entry[1] * 0.2) // 20%
            let lowerValue = errorMargin > entry[1] ? entry[1] : errorMargin;

            if (entry[1] === 1)
              lowerValue = 1

            if (entry[1] === 0)
              lowerValue = 0

            data[`error-${entry[0]}`] = [lowerValue, errorMargin]

            if (!(entry[0].includes('No')) && !(entry[0].includes('0_'))) {
              sum += entry[1];
              if (entry[1] > maxSum) {
                maxSum = entry[1]
              }
            }

          }
        })
        data.total = sum;
      })

      finalChartData.forEach((data) => {
        Object.entries(data).forEach((entry) => {
          if (entry[0] === "genotype") {
            // if (actualCountry === "All") {
            //   data.total2 = allGenotypes[entry[1].toString()];
            // } else {
            let noneCount = 0
            if (amrClassFilter === "Fluoroquinolones (CipI/R)") {
              noneCount = 'None (CipS)' in data ? data['None (CipS)'] : 0
            } else {
              noneCount = 'None' in data ? data['None'] : 0
            }
            data.total2 = data.total + noneCount
            // }
          }
        })
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

      top10.push({ maxSum: top10.length === 0 ? 0 : Math.ceil(top10[0].total2 / 50) * 50, totalSum: totalSum })

      if (!arraysEqual(amrClassChartData, top10)) {
        setAmrClassChartData(top10)
        if (top10.length > 1) {
          setBrushRDWAG([top10[0].genotype, top10[top10.length - 2].genotype])
        } else {
          setBrushRDWAG(['Undefined', 'Undefined'])
        }
      }
    }

    const parseDataForDrugTrendsChart = (data) => {
      let finalDrugTrendsChartData = []
      let finalDrugsAndGenotypesChartData = []
      let totalSum = {}
      let totalCountryCount = data[data.length - 1][0]
      let allDrugs = data[data.length - 2][0]
      data = data.slice(0, data.length - 2)

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

        if (!(entry.GENOTYPE in totalSum)) {
          totalSum[entry.GENOTYPE] = 1
        } else {
          totalSum[entry.GENOTYPE] = totalSum[entry.GENOTYPE] + 1
        }
      })
      finalDrugTrendsChartData.forEach((data) => {
        data.total = allDrugs[data["name"]];
        let maxValue = 0;
        const drugsPercentage = {}
        for (const key in data) {
          if (key !== 'name' && key !== 'total') {
            if (data[key] > maxValue) {
              maxValue = data[key]
            }
            const aux = (data[key] * 100) / data.total
            drugsPercentage[key] = data[key]
            data[key] = aux
          }
        }
        data.higherPercentage = Math.round((maxValue * 100) / data.total)
        data.drugsPercentage = drugsPercentage
      })

      finalDrugsAndGenotypesChartData.forEach((data) => {
        Object.entries(data).forEach((entry) => {
          if (entry[0] === "name") {
            data.total = totalCountryCount[entry[1]].total
            data.totalS = totalCountryCount[entry[1]].totalS
          }
        })
      })

      finalDrugTrendsChartData = finalDrugTrendsChartData.filter(item => item.total === 10 || item.total > 10)

      finalDrugTrendsChartData.sort((a, b) => a.name.localeCompare(b.name))
      finalDrugTrendsChartData.push({ totalSum: allDrugs })

      finalDrugsAndGenotypesChartData.sort((a, b) => b.total - a.total)
      finalDrugsAndGenotypesChartData = finalDrugsAndGenotypesChartData.slice(0, finalDrugsAndGenotypesChartData.length >= 5 ? 5 : finalDrugsAndGenotypesChartData.length)
      finalDrugsAndGenotypesChartData.push({ totalSum: totalSum })

      if (!arraysEqual(finalDrugTrendsChartData, drugTrendsChartData)) {
        setDrugTrendsChartData(finalDrugTrendsChartData)
        // setDrugTrendsChartDataBackup(finalDrugTrendsChartData)
        if (finalDrugTrendsChartData.length > 1) {
          setBrushDRT([finalDrugTrendsChartData[0].name, finalDrugTrendsChartData[finalDrugTrendsChartData.length - 2].name])
        } else {
          setBrushDRT(['Undefined', 'Undefined'])
        }

      }
      if (!arraysEqual(finalDrugsAndGenotypesChartData, drugsAndGenotypesChartData)) {
        setDrugsAndGenotypesChartData(finalDrugsAndGenotypesChartData)
        if (finalDrugsAndGenotypesChartData.length > 1) {
          setBrushRFWG([finalDrugsAndGenotypesChartData[0].name, finalDrugsAndGenotypesChartData[finalDrugsAndGenotypesChartData.length - 2].name])
        } else {
          setBrushRFWG(['Undefined', 'Undefined'])
        }
      }
    }

    const timeOutId = setTimeout(async () => {
      let filter;

      filter = 2

      let genotypeChartResponse = await axios.get(`${API_ENDPOINT}filters/${filter}/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}/${actualRegion === "All" ? "all" : actualRegion}`)
      parseDataForGenotypeChart(genotypeChartResponse.data)

      if (actualCountry === "All") {
        parseDataForCountryMap(genotypeChartResponse.data)
      } else {
        let response = await axios.get(`${API_ENDPOINT}filters/${filter}/all/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}/all`)
        parseDataForCountryMap(response.data)
      }

      let drugTrendsChartResponse = await axios.get(`${API_ENDPOINT}filters/drugTrendsChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${dataset}/${actualRegion === "All" ? "all" : actualRegion}`)
      parseDataForDrugTrendsChart(drugTrendsChartResponse.data)

      let classChartResponse
      if (amrClassFilter === "Fluoroquinolones (CipI/R)") {
        classChartResponse = await axios.get(`${API_ENDPOINT}filters/amrClassChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${"Fluoroquinolones (CipI-R)"}/${dataset}/${actualRegion === "All" ? "all" : actualRegion}`)
      } else {
        classChartResponse = await axios.get(`${API_ENDPOINT}filters/amrClassChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${amrClassFilter}/${dataset}/${actualRegion === "All" ? "all" : actualRegion}`)
      }
      parseDataForAmrClassChart(classChartResponse.data)

      setAppLoading((value) => { if (value < 2) return value + 1 })

    }, 500);
    return () => clearTimeout(timeOutId);
  }, [populationStructureFilter, actualTimePeriodRange, actualCountry, dataset, amrClassFilter, allGenotypes]) // eslint-disable-line react-hooks/exhaustive-deps

  function arraysEqual(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  const mapSamplesColorScale = (domain) => {
    if (domain >= 1 && domain <= 9) {
      return '#4575b4'
    } else if (domain >= 10 && domain <= 19) {
      return '#91bfdb'
    } else if (domain >= 20 && domain <= 99) {
      return '#addd8e'
    } else if (domain >= 100 && domain <= 299) {
      return '#fee090'
    } else if (domain >= 300) {
      return '#fc8d59'
    }
  }

  const [mapRedColorScale] = useState(() => scaleLinear()
    .domain([0, 50, 100])
    .range(["#ffebee", "#f44336", "#b71c1c"]));

  const tooltip = React.useCallback((positionY, width1, width2, sort, wrapperS, stroke, chart = -1) => {
    return (
      <Tooltip
        position={{ y: dimensions.width < mobile ? positionY[0] : dimensions.width < desktop ? positionY[1] : positionY[2], x: dimensions.width < mobile ? -10 : 0 }}
        wrapperStyle={wrapperS}
        cursor={{ fill: hoverColor }}
        content={({ active, payload, label }) => {
          if (payload !== null) {
            if (payload[0]?.payload.name === "") {
              return null;
            }

            if (sort) {
              payload.sort((a, b) => b.value - a.value)
              payload = payload.reverse()
            }
            if (active) {
              return (
                <div className="my-tooltip">
                  <div className="my-tooltip-title">
                    <span className="my-tooltip-title-label">{label}</span>
                    {chart === 0 && (<span className="my-tooltip-title-total">{"N = " + (payload[0].payload.totalS)}</span>)}
                    {chart === 4 && (<span className="my-tooltip-title-total">{"N = " + (payload[0].payload.quantities.totalS)}</span>)}
                    {chart === 1 && (<span className="my-tooltip-title-total">{"N = " + payload[0].payload.total}</span>)}
                  </div>
                  <div className="my-tooltip-content" style={{ width: width1 }}>
                    {payload.reverse().map((item, index) => {
                      let percentage = ((item.value / item.payload.total) * 100)
                      if (chart === 1) {
                        percentage = ((item.payload.drugsPercentage[item.dataKey] / item.payload.total) * 100)
                      }
                      if (chart === 0) {
                        percentage = ((item.value / item.payload.totalS) * 100)
                      }
                      percentage = Math.round(percentage * 100) / 100
                      if ((populationStructureFilter === 2 && chart === 3) || (RFWGFilter === 2 && chart === 4)) {
                        percentage = Math.round(item.value * 100) / 100
                      }
                      if (chart === 1 && item.payload.drugsPercentage[item.dataKey] === 0) {
                        return null
                      }
                      return (
                        <div key={index + item} className="my-tooltip-content-individual" style={{ width: width2 }}>
                          <div className="my-tooltip-content-square" style={{ backgroundColor: stroke ? item.stroke : item.fill }} />
                          <div className="my-tooltip-content-info">
                            <span className="my-tooltip-content-name" style={{ width: dimensions.width < mobile ? '80%' : '100%' }}>{item.name}</span>
                            <span className="my-tooltip-content-count">N = {(populationStructureFilter === 2 && chart === 3) || (RFWGFilter === 2 && chart === 4) ? item.payload.quantities[item.name] : chart === 1 ? item.payload.drugsPercentage[item.dataKey] : item.value}</span>
                            <span className="my-tooltip-content-percent">{percentage}%</span>
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
  }, [desktop, dimensions, mobile, populationStructureFilter, RFWGFilter, hoverColor])

  useEffect(() => {
    const plotPopulationStructureChart = () => {

      if (populationStructureFilter === 1) { /* QUANTITY */
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
              height={350}
              data={populationStructureChartData}
              margin={{
                top: 20, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={[0, maxH]} allowDataOverflow={true} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' className="PSC-label" offset={6}>
                  Number of genomes
                </Label>
              </YAxis>
              {populationStructureChartData.length > 0 && (<Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} onChange={
                (value) => {
                  setBrushGD([
                    populationStructureChartData[value.startIndex].name,
                    populationStructureChartData[value.endIndex].name
                  ])
                }
              } />)}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="PSC-legend">
                      <div className="PSC-legend-div">
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} className="PSC-legend-info">
                              <div className="PSC-legend-info-circle" style={{ backgroundColor: color }} />
                              <span className="PSC-legend-info-name">{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {tooltip([290, 290, 260], dimensions.width < 620 ? 250 : 530, dimensions.width > 620 ? "20%" : "50%", false, { zIndex: 100, top: 20, right: -20 }, false)}
              {genotypes.map((item) => <Bar dataKey={item} stackId={0} fill={getColorForGenotype(item)} />)}
            </BarChart>
          </ResponsiveContainer>
        )
      } else { /* PERCENTAGE */
        let maxH = 100

        let teste = JSON.parse(JSON.stringify(populationStructureChartData))
        teste.forEach(element => {
          element["quantities"] = {}
          const keys = Object.keys(element);
          for (const key in keys) {
            if (keys[key] !== 'name' && keys[key] !== 'total' && keys[key] !== 'quantities') {
              let aux = keys[key]
              element.quantities[aux] = element[aux]
              element[aux] = (element[aux] * 100) / element.total
            }
          }
        });

        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={350}
              data={teste}
              margin={{
                top: 20, bottom: 5, right: 0
              }}
              barCategoryGap={'10%'}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={[0, maxH]} allowDataOverflow={true} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' className="PSC-label" offset={6}>
                  % Genomes per year
                </Label>
              </YAxis>
              {teste.length > 0 && (<Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} onChange={
                (value) => {
                  setBrushGD([
                    teste[value.startIndex].name,
                    teste[value.endIndex].name
                  ])
                }
              } />)}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="PSC-legend">
                      <div className="PSC-legend-div">
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} className="PSC-legend-info">
                              <div className="PSC-legend-info-circle" style={{ backgroundColor: color }} />
                              <span className="PSC-legend-info-name" >{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {tooltip([290, 290, 260], dimensions.width < 620 ? 250 : 530, dimensions.width > 620 ? "20%" : "50%", false, { zIndex: 100, top: 20, right: -20 }, false, 3)}
              {genotypes.map((item) => <Bar dataKey={item} stackId="a" fill={getColorForGenotype(item)} />)}
            </BarChart>
          </ResponsiveContainer>
        )
      }
    }
    setPlotPopulationStructureChart(plotPopulationStructureChart)
  }, [dimensions, genotypes, populationStructureChartData, populationStructureFilter, tooltip])

  useEffect(() => {
    const amrClassChartTooltip = () => {
      return (
        <Tooltip
          position={{ x: 0, y: 230 }}
          wrapperStyle={{ zIndex: 100, top: 50 }}
          allowEscapeViewBox={{ x: true, y: true }}
          cursor={{ fill: hoverColor }}
          content={({ active, payload, label }) => {
            if (payload !== null) {
              if (active) {
                return (
                  <div className="my-tooltip">
                    <span className="my-tooltip-title-label">{label}</span>
                    <div className="my-tooltip-content amr-tooltip-content">
                      {payload.reverse().map((item, index) => {
                        let percentage
                        if (RDWAGDataviewFilter === 1) {
                          percentage = ((item.value / item.payload.total2) * 100)
                        } else {
                          percentage = item.value
                        }
                        percentage = Math.round(percentage * 100) / 100
                        return (
                          <div key={index} className="amr-tooltip-content-individual">
                            <div className="my-tooltip-content-square" style={{ backgroundColor: item.fill }} />
                            <div className="amr-tooltip-content-info">
                              <span className="amr-tooltip-content-name">{item.name}</span>
                              <span className="my-tooltip-content-count">N = {RDWAGDataviewFilter === 2 ? item.payload.percentage[item.name] : item.value}</span>
                              <span className="my-tooltip-content-percent">{percentage}%</span>
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

    const armClassFilterComponent = (info) => {
      let maxSum = 0
      if (amrClassChartData[amrClassChartData.length - 1] !== undefined) {
        maxSum = amrClassChartData[amrClassChartData.length - 1].maxSum
      }

      const dataAMR = amrClassChartData.slice(0, amrClassChartData.length - 1)

      if (RDWAGDataviewFilter === 1) {
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={300}
              data={dataAMR}
              margin={{
                top: 20, left: 0, bottom: 5, right: 0
              }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="genotype" type={"category"} interval={dimensions.width < 1700 ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis domain={[0, maxSum]} type={"number"} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' className="RDWAG-label" offset={6}>
                  Number of occurrences
                </Label>
              </YAxis>
              {dataAMR.length > 0 && (<Brush dataKey="genotype" height={20} stroke={"rgb(31, 187, 211)"} onChange={
                (value) => {
                  setBrushRDWAG([
                    dataAMR[value.startIndex].genotype,
                    dataAMR[value.endIndex].genotype
                  ])
                }
              } />)}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RDWAG-legend">
                      <div className="RDWAG-legend-div" style={{ justifyContent: amrClassFilter === "Ampicillin" || amrClassFilter === "Fluoroquinolones (CipI/R)" ? "" : "space-between" }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} className="RDWAG-legend-info">
                              <div className="RDWAG-legend-info-circle" style={{ backgroundColor: color }} />
                              <span className="RDWAG-legend-info-name">{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {amrClassChartTooltip()}
              {info.bars.map((item) => {
                return (
                  <Bar dataKey={item[0]} fill={item[1]} stackId="a" barSize={30} />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        )
      } else if (RDWAGDataviewFilter === 2) {
        let temp = JSON.parse(JSON.stringify(dataAMR))

        temp.forEach(element => {
          element.percentage = {}
          for (const key in element) {
            if (!["genotype", "total", "total2", "percentage"].includes(key) && !key.includes("error")) {
              const aux = (element[key] * 100) / element.total2
              element.percentage[key] = element[key]
              element[key] = aux
            }
          }
        })

        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={300}
              data={temp}
              margin={{
                top: 20, left: 0, bottom: 5, right: 0
              }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="genotype" type={"category"} interval={dimensions.width < 1700 ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis domain={[0, 100]} type={"number"} allowDecimals={false} width={70} allowDataOverflow={true}>
                <Label angle={-90} position='insideLeft' className="RDWAG-label" offset={6}>
                  % Genomes
                </Label>
              </YAxis>
              {temp.length > 0 && (<Brush dataKey="genotype" height={20} stroke={"rgb(31, 187, 211)"} onChange={
                (value) => {
                  setBrushRDWAG([
                    temp[value.startIndex].genotype,
                    temp[value.endIndex].genotype
                  ])
                }
              } />)}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RDWAG-legend">
                      <div className="RDWAG-legend-div" style={{ justifyContent: amrClassFilter === "Ampicillin" || amrClassFilter === "Fluoroquinolones (CipI/R)" ? "" : "space-between" }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} className="RDWAG-legend-info">
                              <div className="RDWAG-legend-info-circle" style={{ backgroundColor: color }} />
                              <span className="RDWAG-legend-info-name">{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />

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
    }

    const plotAmrClassChart = () => {
      switch (amrClassFilter) {
        case 'Azithromycin':
          return (armClassFilterComponent({
            left: -5, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['ereA', "#9e9ac8", "error-ereA"],
              ['acrB_R717Q', "#addd8e", "error-acrB_R717Q"],
              ['acrB_R717L', "#FBCFE5", "error-acrB_R717L"],
              ['ereA + acrB_R717Q', "#FFEC78", "error-ereA-acrB_R717Q"],
              ['ereA + acrB_R717L', "#66c2a4", "error-ereA-acrB_R717L"],
              ['acrB_R717Q + acrB_R717L', "#fd8d3c", "error-acrB_R717Q-acrB_R717L"],
              ['ereA + acrB_R717Q + acrB_R717L', "#6baed6", "error-ereA-acrB_R717Q-acrB_R717L"],
              ['None', "#B9B9B9", "error-None"]
            ]
          }))
        case 'Fluoroquinolones (CipI/R)':
          return (armClassFilterComponent({
            left: 10, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
              ['3_QRDR + qnrS (CipR)', "black", "error-3_QRDR + qnrS"],
              ['3_QRDR + qnrB (CipR)', "#660000", "error-3_QRDR + qnrB"],
              ['3_QRDR (CipR)', "#cc0000", "error-3_QRDR"],
              ['2_QRDR + qnrS (CipR)', "#ff6666", "error-2_QRDR + qnrS"],
              ['2_QRDR + qnrB (CipR)', "#ffcccc", "error-2_QRDR + qnrB"],
              ['2_QRDR (CipI)', "#ff6600", "error-2_QRDR"],
              ['1_QRDR + qnrS (CipR)', "#660066", "error-1_QRDR + qnrS"],
              ['1_QRDR + qnrB (CipR)', "#993399", "error-1_QRDR + qnrB"],
              ['1_QRDR (CipI)', "#ffcc00", "error-1_QRDR"],
              ['0_QRDR + qnrS (CipI)', "#009999", "error-0_QRDR + qnrS"],
              ['0_QRDR + qnrB (CipI)', "#0066cc", "error-0_QRDR + qnrB"],
              ['None (CipS)', "#B9B9B9", "error-None"]]
          }))
        case 'Chloramphenicol':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['cmlA', "#addd8e", "error-cmlA"],
              ['catA1', "#9e9ac8", "error-catA1"],
              ["catA1 + cmlA", "#FFEC78", "error-catA1-cmlA"],
              ['None', "#B9B9B9", "error-None"]
            ]
          }))
        case 'Ampicillin':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['blaTEM-1D', "#addd8e", "error-blaTEM-1D"],
              ['None', "#B9B9B9", "error-None"]]
          }))
        case 'Sulphonamides':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['sul2', "#ffeda0", "error-sul2"],
              ['sul1', "#fd8d3c", "error-sul1"],
              ['sul1 + sul2', "#B4DD70", "error-sul1-sul2"],
              ['None', "#B9B9B9", "error-None"]]
          }))
        case 'Trimethoprim':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
              ['dfrA1', "#B4DD70", "error-dfrA1"],
              ['dfrA5', "#D7AEF7", "error-dfrA5"],
              ['dfrA7', "#FFEC78", "error-dfrA7"],
              ['dfrA14', "#6baed6", "error-dfrA14"],
              ['dfrA7 + dfrA14', "#fd8d3c", "error-dfrA7-dfrA14"],
              ['dfrA15', "#FBCFE5", "error-dfrA15"],
              ['dfrA17', "#FCB469", "error-dfrA17"],
              ['dfrA18', "#66c2a4", "error-dfrA18"],
              ['None', "#B9B9B9", "error-None"]]
          }))
        case 'Co-trimoxazole':
          let cotrim = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"];
          let colors1 = ["#ffeda0", "#fd8d3c", "#addd8e", "#9e9ac8", "#6baed6", "#7a0177", "#54278f"]
          let colors2 = ["#a50f15", "#6a5acd", "#f1b6da", "#fb8072", "#4682b4", "#2e8b57", "#98fb98"]
          let colors3 = ["#fcc5c0", "#bcbddc", "#fdd0a2", "#c994c7", "#9ecae1", "#a8ddb5", "#fc9272"]
          let bars = [['None', "#B9B9B9", "error-None"]]

          for (const index in cotrim) {
            bars.push([cotrim[index] + " + sul1", colors1[index], "error-" + cotrim[index] + "-sul1"])
            bars.push([cotrim[index] + " + sul2", colors2[index], "error-" + cotrim[index] + "-sul2"])
            bars.push([cotrim[index] + " + sul1 + sul2", colors3[index], "error-" + cotrim[index] + "-sul1-sul2"])
          }
          bars.push(["dfrA7 + dfrA14 + sul1 + sul2", "#F54CEB", "error-dfrA7-dfrA14-sul1-sul2"])

          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: bars
          }))
        case 'Tetracyclines':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['tetA(D)', getColorForTetracyclines('tetA(D)'), "error-tetA(D)"],
              ['tetA(C)', getColorForTetracyclines('tetA(C)'), "error-tetA(C)"],
              ['tetA(B)', getColorForTetracyclines('tetA(B)'), "error-tetA(B)"],
              ['tetA(A)', getColorForTetracyclines('tetA(A)'), "error-tetA(A)"],
              ['None', "#B9B9B9", "error-None"]
            ]
            // ['tetA(AB)', getColorForTetracyclines('tetA(AB)'), "error-tetA(AB)"],
            // ['tetA(ABC)', getColorForTetracyclines('tetA(ABC)'), "error-tetA(ABC)"],
            // ['tetA(ABCD)', getColorForTetracyclines('tetA(ABCD)'), "error-tetA(ABCD)"],
            // ['tetA(ABD)', getColorForTetracyclines('tetA(ABD)'), "error-tetA(ABD)"],
            // ['tetA(AC)', getColorForTetracyclines('tetA(AC)'), "error-tetA(AC)"],
            // ['tetA(AD)', getColorForTetracyclines('tetA(AD)'), "error-tetA(AD)"],
            // ['tetA(ACD)', getColorForTetracyclines('tetA(ACD)'), "error-tetA(ACD)"],
            // ['tetA(BC)', getColorForTetracyclines('tetA(BC)'), "error-tetA(BC)"],
            // ['tetA(BD)', getColorForTetracyclines('tetA(BD)'), "error-tetA(BD)"],
            // ['tetA(BCD)', getColorForTetracyclines('tetA(BCD)'), "error-tetA(BCD)"],
            // ['tetA(CD)', getColorForTetracyclines('tetA(CD)'), "error-tetA(CD)"]]
          }))
        case 'ESBL':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['blaSHV-12', "#addd8e", "error-blaSHV-12"],
              ['blaOXA-7', "#9e9ac8", "error-blaOXA-7"],
              ['blaCTX-M-15', "#6baed6", "error-blaCTX-M-15"],
              ['blaCTX-M-55', "#FBCFE5", "error-blaCTX-M-55"],
              ['None', "#B9B9B9", "error-None"]]
          }))
        default:
          return null;
      }
    }
    setPlotAmrClassChart(plotAmrClassChart)
  }, [hoverColor, RDWAGDataviewFilter, amrClassFilter, dimensions, amrClassChartData, desktop, middle])

  useEffect(() => {
    const plotDrugTrendsChart = () => {
      let dataDRT = drugTrendsChartData.slice(0, drugTrendsChartData.length - 1)
      for (const index in dataDRT) {
        for (const i in trendClassesForFilter) {
          if (!((trendClassesForFilter[i].toString()) in dataDRT[index])) {
            dataDRT[index][trendClassesForFilter[i]] = 0
            dataDRT[index].drugsPercentage[trendClassesForFilter[i]] = 0
          }
        }
      }

      return (
        <ResponsiveContainer width="90%">
          <LineChart
            data={dataDRT}
            margin={{
              top: 20, bottom: 5, right: 0, left: -5
            }}
            height={582}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis tickCount={20} allowDecimals={false} type="number" padding={{ left: 20, right: 20 }} dataKey="name" domain={['dataMin', 'dataMax']} interval={"preserveStartEnd"} tick={{ fontSize: 14 }} />
            <YAxis tickCount={6} padding={{ top: 20, bottom: 20 }} allowDecimals={false} width={70}>
              <Label angle={-90} position='insideLeft' className="DRT-label" offset={12}>
                Resistant (%)
              </Label>
            </YAxis>
            {drugTrendsChartData.slice(0, drugTrendsChartData.length - 1).length > 0 && (
              <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} onChange={(value) => {
                setBrushDRT([
                  drugTrendsChartData[value.startIndex].name,
                  drugTrendsChartData[value.endIndex].name
                ])
              }} />
            )}

            <Legend
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="DRT-legend">
                    <div className="DRT-legend-div" style={{ justifyContent: dimensions.width < 1585 ? "space-between" : "" }}>
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry
                        return (
                          <div key={index} className="DRT-legend-info">
                            <div className="DRT-legend-info-circle" style={{ backgroundColor: color }} />
                            <span className="DRT-legend-info-name">{dataKey}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              }}
            />
            {tooltip([160, 275, 255], dimensions.width < mobile ? 250 : 325, "50%", true, { zIndex: 100, top: 175, right: 0 }, true, 1)}
            {/* {trendClassesForFilter.slice(1).map((item) => (<Line dataKey={item} strokeWidth={2} stroke={getColorForDrug(item)} connectNulls type="monotone" />))} */}
            {trendClassesForFilter.map((item) => (<Line dataKey={item} strokeWidth={2} stroke={getColorForDrug(item)} connectNulls type="monotone" activeDot={timePeriodRange[0] === timePeriodRange[1] ? true : false} />))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    setPlotDrugTrendsChart(plotDrugTrendsChart)
  }, [trendClassesForFilter, dimensions, drugTrendsChartData, tooltip, mobile, timePeriodRange])

  useEffect(() => {
    const plotDrugsAndGenotypesChart = () => {
      if (RFWGFilter === 1) {
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              data={drugsAndGenotypesChartData.slice(0, drugsAndGenotypesChartData.length - 1)}
              margin={{
                top: 20, left: -5, bottom: 5, right: 0
              }}
              height={582}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval={dimensions.width < mobile ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis allowDecimals={false} width={71}>
                <Label angle={-90} position='insideLeft' className="RFWG-label" offset={12}>
                  Number of genomes
                </Label>
              </YAxis>
              {drugsAndGenotypesChartData.slice(0, drugsAndGenotypesChartData.length - 1).length > 0 && (
                <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} onChange={
                  (value) => {
                    setBrushRFWG([
                      drugsAndGenotypesChartData[value.startIndex].name,
                      drugsAndGenotypesChartData[value.endIndex].name
                    ])
                  }
                } />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RFWG-legend">
                      <div className="RFWG-legend-div" style={{ justifyContent: dimensions.width < 1585 ? "space-between" : "" }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} className="RFWG-legend-info">
                              <div className="RFWG-legend-info-circle" style={{ backgroundColor: color }} />
                              <span className="RFWG-legend-info-name">{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {tooltip([155, 270, 270], dimensions.width < mobile ? 250 : 325, "50%", false, { zIndex: 100, top: 160 }, false, 0)}
              {/* {drtClassesForFilter.slice(1).map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))} */}
              {drtClassesForFilter.map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))}
            </BarChart>
          </ResponsiveContainer>
        )
      } else {
        let teste = JSON.parse(JSON.stringify(drugsAndGenotypesChartData.slice(0, drugsAndGenotypesChartData.length - 1)))
        teste.forEach(element => {
          element["quantities"] = {}
          const keys = Object.keys(element);
          for (const key in keys) {
            if (keys[key] !== 'name' && keys[key] !== 'total' && keys[key] !== 'quantities') {
              let aux = keys[key]
              element.quantities[aux] = element[aux]
              element[aux] = (element[aux] * 100) / element.totalS
            }
          }
        });

        return (
          <ResponsiveContainer width="90%" height="100%">
            <BarChart
              data={teste}
              margin={{
                top: 20, left: -5, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval={dimensions.width < mobile ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis domain={[0, 100]} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' className="RFWG-label" offset={12}>
                  Percentage within genotype (%)
                </Label>
              </YAxis>
              {teste.length > 0 && (<Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} onChange={
                (value) => {
                  setBrushRFWG([
                    teste[value.startIndex].name,
                    teste[value.endIndex].name
                  ])
                }
              } />)}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RFWG-legend">
                      <div className="RFWG-legend-div" style={{ justifyContent: dimensions.width < 1585 ? "space-between" : "" }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} className="RFWG-legend-info">
                              <div className="RFWG-legend-info-circle" style={{ backgroundColor: color }} />
                              <span className="RFWG-legend-info-name">{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {tooltip([155, 270, 270], dimensions.width < mobile ? 250 : 325, "50%", false, { zIndex: 100, top: 160 }, false, 4)}
              {/* {drtClassesForFilter.slice(1).map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))} */}
              {drtClassesForFilter.map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))}
            </BarChart>
          </ResponsiveContainer>
        )
      }
    }
    setPlotDrugsAndGenotypesChart(plotDrugsAndGenotypesChart)
  }, [actualCountry, drtClassesForFilter, dimensions, drugsAndGenotypesChartData, tooltip, mobile, RFWGFilter])

  function imgOnLoadPromise(obj) {
    return new Promise((resolve, reject) => {
      obj.onload = () => resolve(obj);
      obj.onerror = reject;
    });
  }

  const [stopLoading] = useState(() => (index) => {
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
  })

  const [capturePicture] = useState(() => async (id, index, info = {}) => {
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

    const names = ["Resistance frequencies within genotypes", "Drug resistance trends", "Genotype distribution", "Resistance determinants within genotypes"]
    const brokenNames = [["Resistance frequencies", "within genotypes"], ["Resistance determinants", "within all genotypes"]]

    if (index === 5) {
      let ids = ["RFWG", "RFWAG", "DRT", "GD"]

      var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'l' });

      let typhinetLogo = new Image();
      typhinetLogo.src = typhinetLogoImg2;
      doc.addImage(typhinetLogo, 'PNG', 115, 10, 80, 34)
      doc.setFontSize(16);
      const paragraph1 = "Nunc ultrices blandit urna mollis porttitor. Vivamus viverra imperdiet justo, vitae fermentum elit accumsan placerat. Maecenas malesuada tincidunt rhoncus. Sed quam mauris, lacinia ac nisi consectetur, tincidunt pulvinar mauris. Proin ultricies quam sit amet dolor faucibus, at aliquam leo porttitor. Morbi at molestie nulla. Mauris porta lacus at augue facilisis volutpat. Suspendisse justo odio, congue nec diam ut, pretium blandit arcu. Duis vel leo euismod, pretium ante sit amet, viverra nibh."
      const paragraph2 = "Quisque in tortor dignissim, mollis augue ac, sollicitudin ex. Quisque quis accumsan erat. Suspendisse sed nulla id ante fringilla sodales. Etiam sed pulvinar ex. Integer rutrum dolor a lobortis semper. Praesent fermentum feugiat justo ultrices facilisis. Etiam non sem ac ante rhoncus pretium eget eget dui. Duis non mollis nisl. Nullam id elementum augue, eget feugiat felis. Integer posuere nec sapien quis scelerisque. Etiam ut tortor dignissim, bibendum metus a, varius lectus. Nunc sollicitudin fringilla enim nec auctor. In vel rhoncus arcu. Morbi sed blandit libero."
      doc.text(paragraph1, 10, 60, { align: 'justify', maxWidth: 130 })
      doc.text(paragraph2, 155, 60, { align: 'justify', maxWidth: 130 })

      doc.addPage('a4', 'l')
      doc.setFontSize(25);
      doc.text("Global Overview of Salmonella Typhi", 80, 15);

      await svgAsPngUri(document.getElementById('control-map'), { scale: 4, backgroundColor: "white", width: 1200, left: -200 })
        .then(async (uri) => {
          let canvas = document.createElement("canvas")
          let ctx = canvas.getContext('2d');

          let mapImg = document.createElement("img");
          let mapImgPromise = imgOnLoadPromise(mapImg);
          mapImg.src = uri;
          await mapImgPromise;

          canvas.width = 1400;
          canvas.height = 700;
          ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
          var img = canvas.toDataURL("image/png")
          doc.addImage(img, "PNG", 0, 18, 298, 155);
        })

      let actualMapView = info.mapView
      switch (actualMapView) {
        case "MDR":
          actualMapView = "Multidrug resistant (MDR)"
          break;
        case "XDR":
          actualMapView = "Extensively drug resistant (XDR)"
          break;
        case "Azith":
          actualMapView = "Azithromycin resistant"
          break;
        case "CipI":
          actualMapView = "Ciprofloxacin insusceptible and resistant (CipI/R)"
          break;
        case "CipR":
          actualMapView = "Ciprofloxacin resistant (CipR)"
          break;
        case "H58 / Non-H58":
          actualMapView = "H58 genotype"
          break;
        default:
          break;
      }

      doc.setFontSize(14);
      // doc.text("Map view: " + actualMapView, 10, 180);
      doc.text(actualMapView, 10, 180);
      doc.text("Dataset: " + info.dataset + " test ", 10, 187);
      doc.text("Time period: " + info.actualTimePeriodRange[0] + " to " + info.actualTimePeriodRange[1], 10, 194);
      doc.text("Country: " + info.country, 10, 201);

      if (info.mapView === 'Dominant Genotype') {
        var img = new Image()
        img.src = "legends/MV_DG.png"
        doc.addImage(img, 'PNG', 90, 168.5, 150, 38)
      } else if (info.mapView === 'No. Samples') {
        var img2 = new Image()
        img2.src = "legends/MV_NS.png"
        doc.addImage(img2, 'PNG', 250, 165, 40, 40)
      } else {
        var img3 = new Image()
        img3.src = "legends/MV_outros.png"
        doc.addImage(img3, 'PNG', 250, 165, 40, 40)
      }

      doc.addPage('a4', 'l')
      const names2 = ["Resistance frequencies within genotypes", "Resistance determinants within genotypes", "Drug resistance trends", "Genotype distribution"]
      for (let index = 0; index < ids.length; index++) {
        let legend
        const graph = document.getElementById(ids[index])
        if (index === 1 || index === 3) {
          legend = graph.getElementsByClassName('recharts-legend-wrapper')[0];
          legend.style.display = 'none'
        }

        let url
        await domtoimage.toPng(document.getElementById(ids[index]), { quality: 1, bgcolor: "white" })
          .then(function (dataUrl) {
            url = dataUrl
          });

        if (index === 1 || index === 3) {
          legend.style.display = 'block'
        }

        let subtitleH = 0
        if (index === 0 || index === 1 || index === 2) {
          subtitleH = 3
        }
        subtitleH += 3

        doc.addImage(url, "PNG", 5, 15 + subtitleH);

        let imgWidth = jsPDF.API.getImageProperties(url).width
        imgWidth = Math.floor(imgWidth * 0.264583)
        doc.setFontSize(11)
        const texts = [
          " ",
          " ",
          " ",
          " "
        ]
        let spaceBetween = -4
        if (dimensions.width < 1750) {
          spaceBetween = 13
        }

        let drugs = []
        for (let i = 0; i < info.drugs.length; i++) {
          drugs.push(info.drugs[i].value)
        }
        if (drugs.length === 0) {
          drugs.push('None')
        }

        doc.text(texts[index], imgWidth + spaceBetween, 23 + subtitleH, { align: 'justify', maxWidth: 50 })
        // if (index === 2) {
        //   doc.setFont('helvetica', 'bold');
        //   doc.setFontSize(11)
        //   doc.text('Shown Drugs:', imgWidth + spaceBetween, 100 + subtitleH, { maxWidth: 50 })
        //   doc.setFont('helvetica', 'normal');
        //   doc.setFontSize(11)
        //   doc.text(drugs.join(', '), imgWidth + spaceBetween, 105 + subtitleH, { align: 'justify', maxWidth: 50 })
        // }

        doc.setFontSize(14)
        doc.text(names2[index], 23, 10)
        doc.setFontSize(9)

        if (index === 0) {
          doc.text("Top Genotypes (up to 5)", 23, 15)
        }
        if (index === 1) {
          doc.text("Top Genotypes (up to 10)", 23, 15)
        }
        if (index === 2) {
          doc.text("Data are plotted for years with N ≥ 10 genomes", 23, 15)
        }

        // const brushInterval = info.brush[index]

        // if (index === 1 || index === 2) {
        //   doc.text("Interval: " + brushInterval[0] + " to " + brushInterval[1], 23, 15)
        // } else {
        //   doc.text("Interval: " + brushInterval[0] + " to " + brushInterval[1], 23, 20)
        // }

        if (index === 1) {
          var img4 = new Image()
          if (info.amrClassFilter === "Fluoroquinolones (CipI/R)") {
            img4.src = "legends/Fluoroquinolones (CipI-R).png"
          } else {
            img4.src = "legends/" + info.amrClassFilter + ".png"
          }
          doc.addImage(img4, 'PNG', 22, 97 + subtitleH)
        } else if (index === 3) {
          var img5 = new Image()
          img5.src = "legends/GD.png"
          doc.addImage(img5, 'PNG', 22, 105 + subtitleH)
        }
        if (index < ids.length - 1) {
          doc.addPage('a4', 'l')
        }
      }

      doc.save("TyphiNET - Report.pdf");
      setCaptureReportInProgress(false);

    } else if (index !== 0) {

      let graph = document.getElementById(id)
      let canvas = document.createElement("canvas")
      let ctx = canvas.getContext('2d');
      let graphImg = document.createElement("img");
      let graphImgPromise = imgOnLoadPromise(graphImg);

      var legend = graph.getElementsByClassName('recharts-legend-wrapper')[0];

      if (id === "RFWAG" || id === "GD") {
        legend.style.display = 'none'
      }

      await domtoimage.toPng(graph, { quality: 0.1, bgcolor: "white" })
        .then(function (dataUrl) {
          graphImg.src = dataUrl;
          legend.style.display = 'block'
        });

      let cHeight = 20
      let logoHeight = 50
      let legendHeight = 0
      let filterHeight = 80
      let subtitleHeight = 0
      let drtShownLinesHeight = 0
      if (id === "RFWG" || id === "RFWAG" || id === "DRT") {
        cHeight += 20
        subtitleHeight = 20
      }
      let imgHeight = graphImg.height
      if (id === "RFWAG" || id === "GD") {
        imgHeight -= 180
      }

      if (id === "GD") legendHeight = 40
      if (id === "DRT") {
        drtShownLinesHeight = 50
        if (info.drugs.length > 4) drtShownLinesHeight += 22
        if (info.drugs.length > 8) drtShownLinesHeight += 22
      }

      let imgWidth = graphImg.width
      if (id === "RFWAG") {
        imgWidth += 130
        if (info.amrClassFilter === "Azithromycin") {
          imgWidth += 100
        }
        else if (info.amrClassFilter === "Co-trimoxazole") {
          imgWidth += 195
        }
        else if (info.amrClassFilter === "Fluoroquinolones (CipI/R)") {
          imgWidth += 200
        }
      } else if (id === "GD") {
        imgWidth += 370
      }

      await graphImgPromise;
      canvas.width = imgWidth;

      canvas.height = imgHeight + cHeight + logoHeight + legendHeight + filterHeight + subtitleHeight + 40 + drtShownLinesHeight;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "18px Montserrat"
      ctx.fillStyle = "black";
      ctx.textAlign = "center";

      ctx.drawImage(graphImg, 10, cHeight + logoHeight + subtitleHeight);

      if (id === "RFWG") {
        ctx.fillText(brokenNames[0][0], canvas.width / 2, 10 + logoHeight)
        ctx.fillText(brokenNames[0][1], canvas.width / 2, 30 + logoHeight)
        ctx.font = "12px Montserrat"
        ctx.fillText("Top Genotypes (up to 5)", canvas.width / 2, 32 + logoHeight + subtitleHeight)
      } else if (id === "RFWAG") {
        ctx.fillText(brokenNames[1][0], canvas.width / 2, 10 + logoHeight)
        ctx.fillText(brokenNames[1][1], canvas.width / 2, 30 + logoHeight)
        ctx.font = "12px Montserrat"
        ctx.fillText("Top Genotypes (up to 10)", canvas.width / 2, 32 + logoHeight + subtitleHeight)
      } else if (id === "DRT") {
        ctx.fillText(names[index - 1], canvas.width / 2, 10 + logoHeight)
        ctx.font = "12px Montserrat"
        ctx.fillText("Data are plotted for years with N ≥ 10 genomes", canvas.width / 2, 32 + logoHeight + subtitleHeight)
      } else {
        ctx.fillText(names[index - 1], canvas.width / 2, 10 + logoHeight)
      }

      if (id === "RFWAG" || id === "GD") {
        let legendImg = document.createElement("img")
        let legendImgPromise = imgOnLoadPromise(legendImg)
        if (id === "RFWAG") {
          if (info.amrClassFilter === "Fluoroquinolones (CipI/R)") {
            legendImg.src = "legends/Fluoroquinolones (CipI-R).png";
          } else {
            if (info.amrClassFilter === "Trimethoprim" || info.amrClassFilter === "Co-trimoxazole") {
              info.amrClassFilter += "2"
            }
            legendImg.src = "legends/" + info.amrClassFilter + ".png";
          }

        } else {
          legendImg.src = "legends/GD2.png";
        }
        await legendImgPromise;

        ctx.drawImage(legendImg, graphImg.width, logoHeight + subtitleHeight + 12 + cHeight);
      }

      let typhinetLogo = document.createElement("img");
      let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
      typhinetLogo.src = typhinetLogoImg2;
      await typhinetLogoPromise;
      ctx.drawImage(typhinetLogo, 10, 10, 120, 50);

      ctx.fillStyle = "black"
      ctx.font = "14px Montserrat"
      ctx.textAlign = "start"
      ctx.fillText("Dataset: " + info.dataset, 10, canvas.height - 90 - drtShownLinesHeight)
      ctx.fillText("Time period: " + info.actualTimePeriodRange[0] + " to " + info.actualTimePeriodRange[1], 10, canvas.height - 68 - drtShownLinesHeight)
      ctx.fillText("Country: " + info.country, 10, canvas.height - 46 - drtShownLinesHeight)
      // ctx.fillText("Interval: " + info.interval[0] + " to " + info.interval[1], 10, canvas.height - 24 - drtShownLinesHeight)
      if (id === "DRT") {
        let drugs = []
        let drugs2 = []
        let drugs3 = []
        for (let i = 0; i < info.drugs.length; i++) {
          if (i < 4) {
            drugs.push(info.drugs[i].value)
          } else if (i < 8) {
            drugs2.push(info.drugs[i].value)
          } else {
            drugs3.push(info.drugs[i].value)
          }
        }
        if (drugs.length === 0) drugs = ['None']

        ctx.font = "bold 14px Montserrat"
        ctx.fillText("Shown Drugs:", 10, canvas.height + 8 - drtShownLinesHeight, 400)
        ctx.font = "14px Montserrat"

        let aux = info.drugs.length > 4
        let aux2 = info.drugs.length > 8
        ctx.fillText(drugs.join(", ") + (aux ? ',' : ''), 10, canvas.height - (aux2 ? 64 : aux ? 42 : 20), canvas.width - 20)
        ctx.fillText(drugs2.join(", ") + (aux2 ? ',' : ''), 10, canvas.height - (aux2 ? 42 : 20), canvas.width - 20)
        ctx.fillText(drugs3.join(", "), 10, canvas.height - 20, canvas.width - 20)
      }

      const base64 = canvas.toDataURL();
      stopLoading(index)
      download(base64, "TiphyNET - " + names[index - 1] + ".png");
    } else {
      svgAsPngUri(document.getElementById(id), { scale: 4, backgroundColor: "white", width: 1200, left: -200 })
        .then(async (uri) => {

          let canvas = document.createElement("canvas")
          let ctx = canvas.getContext('2d');

          let mapImg = document.createElement("img");
          let mapImgPromise = imgOnLoadPromise(mapImg);
          mapImg.src = uri;
          await mapImgPromise;

          let cWidth = 3600
          let cHeight = 1800
          let textHeight = 240
          let legendHeight = 0
          if (info.mapView === 'Dominant Genotype') {
            legendHeight = 440
          }

          canvas.width = cWidth;
          canvas.height = cHeight + textHeight + legendHeight;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.font = "bolder 50px Montserrat"
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.fillText("Global Overview of Salmonella Typhi", canvas.width / 2, 80)
          ctx.font = "35px Montserrat"
          ctx.textAlign = "center";

          let actualMapView = info.mapView
          switch (actualMapView) {
            case "MDR":
              actualMapView = "Multidrug resistant (MDR)"
              break;
            case "XDR":
              actualMapView = "Extensively drug resistant (XDR)"
              break;
            case "Azith":
              actualMapView = "Azithromycin resistant"
              break;
            case "CipI":
              actualMapView = "Ciprofloxacin insusceptible and resistant (CipI/R)"
              break;
            case "CipR":
              actualMapView = "Ciprofloxacin resistant (CipR)"
              break;
            case "H58 / Non-H58":
              actualMapView = "H58 genotype"
              break;
            default:
              break;
          }

          ctx.fillText("Map view: " + actualMapView, canvas.width / 2, 140)
          ctx.fillText("Dataset: " + info.dataset, canvas.width / 2, 190)
          ctx.fillText("Time period: " + info.actualTimePeriodRange[0] + " to " + info.actualTimePeriodRange[1], canvas.width / 2, 240)

          ctx.drawImage(mapImg, 0, textHeight, canvas.width, cHeight);

          let legendImg = document.createElement("img");
          let legendImgoPromise = imgOnLoadPromise(legendImg);
          let h
          let w
          if (info.mapView === 'Dominant Genotype') {
            legendImg.src = "legends/MV_DG.png";
            await legendImgoPromise;
            let centerWidth = (canvas.width - 1731) / 2
            ctx.drawImage(legendImg, centerWidth, canvas.height - legendHeight - 20, 1731, 420);
          } else if (info.mapView === 'No. Samples') {
            legendImg.src = "legends/MV_NS.png";
            await legendImgoPromise;
            h = 350
            w = 310
            ctx.drawImage(legendImg, canvas.width - w - 15, canvas.height - h - 10, w, h);
          } else {
            legendImg.src = "legends/MV_outros.png";
            await legendImgoPromise;
            h = 350
            w = 280
            ctx.drawImage(legendImg, canvas.width - w - 25, canvas.height - h - 20, w, h);
          }

          let typhinetLogo = document.createElement("img");
          let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
          typhinetLogo.src = typhinetLogoImg2;
          await typhinetLogoPromise;
          ctx.drawImage(typhinetLogo, 25, 25, 500, 200);

          const base64 = canvas.toDataURL();
          stopLoading(index)
          download(base64, 'TyphiNET - Global Overview Salmonella Typhi.png');
        });
    }

  })

  const [dowloadBaseSpreadsheet] = useState(() => () => {
    axios.get(`${API_ENDPOINT}file/download`)
      .then((res) => {
        let cols_to_remove = ['azith_pred_pheno', 'cip_pred_pheno', 'dcs_category', 'amr_category', 'num_qrdr', 'num_acrb', 'ESBL_category', 'chloramphenicol_category', 'tetracycline_category', 'cip_pheno_qrdr_gene', 'dcs_mechanisms', 'num_amr_genes', 'dfra_any', 'sul_any', 'co_trim', 'GENOTYPE_SIMPLE', 'h58_genotypes']
        let indexes = []
        let csv = res.data.split('\n')
        let lines = []

        for (let index = 0; index < csv.length; index++) {
          let line = csv[index].split(',')
          if (line[1] !== '-' && line[2] !== '-') {
            lines.push(line)
          }
        }

        for (let index = 0; index < cols_to_remove.length; index++) {
          let currentIndex = lines[0].indexOf(cols_to_remove[index])
          indexes.push(currentIndex)
        }
        indexes.sort()
        indexes.reverse()

        let newLines = []
        for (let j = 0; j < lines.length; j++) {
          let aux = []
          for (let i = 0; i < lines[j].length; i++) {
            if (!indexes.includes(i)) {
              aux.push(lines[j][i])
            }
          }
          newLines.push(aux)
        }

        let newCSV = ""
        for (let i = 0; i < newLines.length; i++) {
          let aux = ""
          for (let index = 0; index < newLines[i].length; index++) {
            aux += newLines[i][index]
            if (index !== newLines[i].length - 1) {
              aux += ","
            }
          }
          if (i !== newLines.length - 1) {
            aux += "\n"
          }
          newCSV += aux
        }

        download(newCSV, 'TyphiNET_Database.csv');
      })
  })

  const generateMapLegendOptions = () => {
    let percentageSteps = ['1', '25', '50', '75']
    const otherViews = ['CipI', 'CipR', 'Azith', 'Sensitive to all drugs', 'MDR', 'XDR']

    if (otherViews.includes(mapView)) {
      return (
        <>
          <div className="samples-info">
            <div className="color samples-info-insufficient-data" />
            <span>Insufficient data</span>
          </div>
          <div className="samples-info">
            <div className="color samples-info-zero-percent" />
            <span>0%</span>
          </div>
          {percentageSteps.map((n) => {
            return (
              <div key={n} className="samples-info">
                <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                {n === "1" && (<span>{'1 - 25'}%</span>)}
                {n === "25" && (<span>{'26 - 50'}%</span>)}
                {n === "50" && (<span>{'51 - 75'}%</span>)}
                {n === "75" && (<span>{'76 - 100'}%</span>)}
              </div>
            )
          })}
        </>
      )
    }

    switch (mapView) {
      case 'No. Samples':
        let legends = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300']
        let aux = [1, 10, 20, 100, 300]
        return (
          <>
            <div className="samples-info">
              <div className="color samples-info-insufficient-data" />
              <span>Insufficient data</span>
            </div>
            {[...Array(5).keys()].map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapSamplesColorScale(aux[n]) }} />
                  <span>{legends[n]}</span>
                </div>
              )
            })}
          </>
        )
      case 'Dominant Genotype':
        return (
          <div className="map-legend-DG">
            <div className="samples-info">
              <div className="color samples-info-insufficient-data" />
              <span>Insufficient data</span>
            </div>
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
              <div className="color samples-info-insufficient-data" />
              <span>Insufficient data</span>
            </div>
            <div className="samples-info">
              <div className="color samples-info-zero-percent" />
              <span>0%</span>
            </div>
            {percentageSteps.map((g, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(g) }} />
                  {g === "1" && (<span>{'1 - 25'}%</span>)}
                  {g === "25" && (<span>{'26 - 50'}%</span>)}
                  {g === "50" && (<span>{'51 - 75'}%</span>)}
                  {g === "75" && (<span>{'76 - 100'}%</span>)}
                </div>
              )
            })}
          </>
        )
      default:
        return null
    }
  }

  const renderMapLegend = () => {
    const mapLegends = [
      ['MDR', 'Multidrug resistant (MDR)'], ['XDR', 'Extensively drug resistant (XDR)'], ['Azith', 'Azithromycin resistant'],
      ['CipI', 'Ciprofloxacin insusceptible and resistant (CipI/R)'], ['CipR', 'Ciprofloxacin resistant (CipR)'], ['Sensitive to all drugs', 'Sensitive to all drugs'], 
      ['Dominant Genotype', 'Dominant Genotype'], ['H58 / Non-H58', 'H58 genotype'], ['No. Samples', 'No. Samples']
    ]
    return (
      <div className="map-legend">
        {/* <FormControl fullWidth className={classes.formControlSelect}>
          <div className="map-legend-formcontrol-div">
            <div className="map-legend-formcontrol-label">Select continent</div>
          </div>
          <Select
            value={actualContinent}
            onChange={(evt, value) => setActualContinent(value.props.value)}
            className={classes.select}
            fullWidth
          >
            {continentOptions.map((n)=>{
              return (
                <MenuItem className={classes.select} value={n}>
                  {n}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl> */}
        <FormControl fullWidth className={classes.formControlSelect}>
          <div className="map-legend-formcontrol-div map-legend-formcontrol-div-pad">
            <div className="map-legend-formcontrol-label">Select map view</div>
            <FontAwesomeIcon icon={faInfoCircle} onClick={handleClickOpen3} className="icon-info" />
            <Dialog
              open={open3}
              onClose={handleClose3}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Information"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {'Percentage frequency data is shown only for countries with N≥20 genomes'}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose3} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
          <Select
            value={mapView}
            onChange={evt => setMapView(evt.target.value)}
            fullWidth
            className={classes.select}
          >
            {mapLegends.map((n) => {
              return (
                <MenuItem className={classes.select} value={n[0]}>
                  {n[1]}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        {generateMapLegendOptions()}
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="menu-bar-mobile">
        <img className="logoImageMenu-mobile" src={typhinetLogoImg} alt="TyphiNET" />
      </div>
      <div style={{ padding: dimensions.width > 770 ? '16px 16px 0px 16px' : '16px 0px 0px 0px' }}>
        <div className="info-wrapper">
          {dimensions.width > desktop && (
            <>
              <div className="typhinet-logo">
                <img className="typhinet-logo-image" src={typhinetLogoImg} alt="TyphiNET" />
              </div>
            </>
          )}
          <div className="card card-padding">
            <span>
              Total Genomes
              {/* <FontAwesomeIcon icon={faInfoCircle} onClick={handleClickOpen2} className="icon-info" />
              <Dialog
                open={open2}
                onClose={handleClose2}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Information"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    155 genome samples absent from TyphiNET DB
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose2} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog> */}
            </span>
            {totalGenomes.length === actualGenomes.length ? (
              <span className="value">{totalGenomes.length}</span>
            ) : (
              <span className="value">
                {actualGenomes.length}
                <span className="value-total">/{totalGenomes.length}</span>
              </span>
            )}
          </div>
          <div className="card">
            <span>
              Total Genotypes
              {/* <FontAwesomeIcon icon={faInfoCircle} onClick={handleClickOpen} className="icon-info" />
              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Information"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Total genotypes present in TyphiNET database / Total genotypes worldwide published
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog> */}
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
        <div className="map-filters-wrapper">
          <h2>Global Overview of <i>Salmonella</i> Typhi</h2>
          <div className="map-filters-wrapper-inside" style={{ flexDirection: dimensions.width > desktop ? 'row' : 'column' }}>
            <div className="map-wrapper">
              <ComposableMap
                id="control-map"
                data-tip=""
                projectionConfig={{
                  rotate: [-10, 0, 0],
                  scale: 210,
                }}
                className="composable-map"
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
                        const sample = worldMapSamplesData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))

                        const d = worldMapComplementaryData[geo.properties.NAME]; /* .NAME || .NAME_LONG */
                        let country

                        let fill = "lightgrey"
                        let darkGray = "#727272"

                        switch (mapView) {
                          case 'No. Samples':
                            if (sample && sample.count !== 0) {
                              fill = mapSamplesColorScale(sample.count);
                            } else if (sample && sample.count === 0) {
                              fill = '#F5F4F6'
                            }
                            break;
                          case 'Dominant Genotype':
                            country = worldMapGenotypesData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              const temp = country.genotypes
                              temp.sort((a, b) => a.count <= b.count ? 1 : -1)
                              if (sample) {
                                fill = getColorForGenotype(temp[0].lineage)
                              }
                            }
                            break;
                          case 'H58 / Non-H58':
                            country = worldMapH58Data.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              let countH58 = 0
                              const isH58 = country.genotypes.find(g => g.type === 'H58')
                              if (isH58 !== undefined) { countH58 = isH58.count }

                              if (country.total >= 20 && countH58 > 0) {
                                fill = mapRedColorScale(isH58.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'MDR':
                            country = worldMapMDRData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'Sensitive to all drugs':
                            country = worldMapSTADData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'XDR':
                            country = worldMapXDRData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'Azith':
                            country = worldMapAZITHData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'CipI':
                            country = worldMapCIPIData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'CipR':
                            country = worldMapCIPRData.find(s => s.displayName === geo.properties.NAME && (actualContinent === "All" || geo.properties.CONTINENT === actualContinent))
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray
                              }
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
                            onMouseLeave={() => {
                              setTooltipContent(null);
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
                                        XDR: Math.round(d.XDR) !== d.XDR ? d.XDR.toFixed(2) : d.XDR,
                                        DCS: Math.round(d.DCS) !== d.DCS ? d.DCS.toFixed(2) : d.DCS,
                                        CipI: Math.round(d.CipI) !== d.CipI ? d.CipI.toFixed(2) : d.CipI,
                                        CipR: Math.round(d.CipR) !== d.CipR ? d.CipR.toFixed(2) : d.CipR,
                                        AzithR: Math.round(d.AzithR) !== d.AzithR ? d.AzithR.toFixed(2) : d.AzithR,
                                        STAD: Math.round(d.STAD) !== d.STAD ? d.STAD.toFixed(2) : d.STAD
                                      }
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
                                    let countH58 = 0
                                    const isH58 = country.genotypes.find(g => g.type === 'H58')
                                    if (isH58 !== undefined) { countH58 = isH58.count }

                                    if (country.total >= 20 && countH58 > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        simpleGenotypeInfo: country.genotypes
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }

                                  break;
                                case 'MDR':
                                  if (country !== undefined && country.MDRs.length > 0) {
                                    if (country.total >= 20 && country.count > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        mdrInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                case 'Sensitive to all drugs':
                                  if (country !== undefined && country.STADs.length > 0) {
                                    if (country.total >= 20 && country.count > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        stadInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                case 'XDR':
                                  if (country !== undefined && country.XDRs.length > 0) {
                                    if (country.total >= 20 && country.count > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        xdrInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                case 'Azith':
                                  if (country !== undefined && country.AZs.length > 0) {
                                    if (country.total >= 20 && country.count > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        azInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                case 'CipI':
                                  if (country !== undefined && country.CipIs.length > 0) {
                                    if (country.total >= 20 && country.count > 0) {
                                      let cipI = country.CipIs.filter(x => x.type === 'CipI')
                                      if (cipI.length) {
                                        cipI = cipI[0]
                                        if (Math.round(cipI.percentage) !== cipI.percentage)
                                          cipI.percentage = cipI.percentage.toFixed(2)
                                        cipI.percentage = parseFloat(cipI.percentage);
                                      } else {
                                        cipI = {
                                          count: 0,
                                          percentage: 0
                                        }
                                      }
                                      let cipR = country.CipIs.filter(x => x.type === 'CipR')
                                      if (cipR.length) {
                                        cipR = cipR[0]
                                        if (Math.round(cipR.percentage) !== cipR.percentage)
                                          cipR.percentage = cipR.percentage.toFixed(2)
                                        cipR.percentage = parseFloat(cipR.percentage);
                                      } else {
                                        cipR = {
                                          count: 0,
                                          percentage: 0
                                        }
                                      }
                                      setTooltipContent({
                                        name: NAME,
                                        cipIInfo: {
                                          count: cipI.count,
                                          percentage: cipI.percentage,
                                        },
                                        cipRInfo2: {
                                          count: cipR.count,
                                          percentage: cipR.percentage,
                                        },
                                        cipIRInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                case 'CipR':
                                  if (country !== undefined && country.CipRs.length > 0) {
                                    if (country.total >= 20 && country.count > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        cipRInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    } else {
                                      setTooltipContent({
                                        name: NAME
                                      })
                                    }
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
                            style={{
                              default: {
                                outline: "none",
                              },
                              hover: {
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
              {(dimensions.width > desktop) && (
                <div className="map-upper-right-buttons">
                  {renderMapLegend()}
                </div>
              )}
              {(dimensions.width > desktop) && (
                <div className="map-upper-left-buttons ">
                  <div className="map-filters" style={{ width: dimensions.width > desktop ? 200 : "-webkit-fill-available" }}>
                    <span className="map-filters-label" style={{ marginBottom: dimensions.width > desktop ? 20 : 10 }}>Filters</span>
                    <div style={{ marginBottom: dimensions.width > desktop ? 16 : 8 }}>
                      <Typography className={classes.typography}>
                        Select dataset
                      </Typography>
                      <ToggleButtonGroup
                        value={dataset}
                        exclusive
                        size="small"
                        className={classes.tbg}
                        onChange={(evt, newDataset) => {
                          if (newDataset !== null)
                            setDataset(newDataset)
                        }}
                      >
                        <CustomToggleButton value="All">
                          All
                        </CustomToggleButton>
                        <CustomToggleButton value="Local">
                          Local
                        </CustomToggleButton>
                        <CustomToggleButton value="Travel">
                          Travel
                        </CustomToggleButton>
                      </ToggleButtonGroup>
                    </div>
                    <div className="margin-div">
                      {/* <Typography gutterBottom className={classes.typography}>
                        Select time period
                      </Typography>
                      <CustomSlider
                        style={{ marginTop: dimensions.width > desktop ? '' : -5, marginBottom: dimensions.width > desktop ? '' : -5 }}
                        value={actualTimePeriodRange}
                        min={timePeriodRange[0]}
                        max={timePeriodRange[1]}
                        onChange={(evt, value) => {
                          setActualTimePeriodRange(value)
                        }}
                        valueLabelDisplay="auto"
                      /> */}
                      <div className="my-year-range">
                        <div>
                          <Typography gutterBottom className={classes.typography}>
                            Start year
                          </Typography>
                          <Select
                            value={actualTimePeriodRange[0]}
                            onChange={(evt, value) => setActualTimePeriodRange([value.props.value, actualTimePeriodRange[1]])}
                            className={classes.selectYear}
                            fullWidth
                          >
                            {years.map((n) => {
                              return (
                                <MenuItem className={classes.select} value={n}>
                                  {n}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </div>
                        <div className="my-divider"></div>
                        <div className="my-year-range-row">
                          <Typography gutterBottom className={classes.typographyEndYear}>
                            End year
                          </Typography>
                          <Select
                            value={actualTimePeriodRange[1]}
                            onChange={(evt, value) => setActualTimePeriodRange([actualTimePeriodRange[0], value.props.value])}
                            className={classes.selectYear}
                            fullWidth
                          >
                            {years.map((n) => {
                              return (
                                <MenuItem className={classes.select} value={n}>
                                  {n}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="map-lower-left-buttons">
                <Zoom in={controlMapPosition.zoom !== 1 || controlMapPosition.coordinates.some(c => c !== 0)}>
                  <TooltipMaterialUI title={<span className="my-font">Recenter Map</span>} placement="right">
                    <div
                      className="button"
                      onClick={() => setControlMapPosition({ coordinates: [0, 0], zoom: 1 })}
                    >
                      <FontAwesomeIcon icon={faCrosshairs} />
                    </div>
                  </TooltipMaterialUI>
                </Zoom>
                <TooltipMaterialUI title={<span className="my-font">Zoom In</span>} placement="right">
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
                <TooltipMaterialUI title={<span className="my-font">Zoom Out</span>} placement="right">
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
                <TooltipMaterialUI title={<span className="my-font">Download Map as PNG</span>} placement="left">
                  <div
                    className={`button ${captureControlMapInProgress && "disabled"}`}
                    onClick={() => {
                      if (!captureControlMapInProgress)
                        capturePicture('control-map', 0, { mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange })
                    }}
                  >
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                </TooltipMaterialUI>
                {captureControlMapInProgress && (
                  <CustomCircularProgress
                    size={54}
                    thickness={4}
                    style={{ top: 5, left: -7 }} />
                )}
              </div>
            </div>
            {!(dimensions.width > desktop) && (
              <div className="wrapper-map-legend">
                {renderMapLegend()}
                <div>
                  <div className="map-filters-mobile" style={{ width: dimensions.width > desktop ? 200 : "-webkit-fill-available" }}>
                    <span className="map-filters-label" style={{ marginBottom: dimensions.width > desktop ? 20 : 10 }}>Filters</span>
                    <div style={{ marginBottom: dimensions.width > desktop ? 16 : 8 }}>
                      <Typography className={classes.typography}>
                        Select dataset
                      </Typography>
                      <ToggleButtonGroup
                        value={dataset}
                        exclusive
                        size="small"
                        className={classes.tbg}
                        onChange={(evt, newDataset) => {
                          if (newDataset !== null)
                            setDataset(newDataset)
                        }}
                      >
                        <CustomToggleButton value="All">
                          All
                        </CustomToggleButton>
                        <CustomToggleButton value="Local">
                          Local
                        </CustomToggleButton>
                        <CustomToggleButton value="Travel">
                          Travel
                        </CustomToggleButton>
                      </ToggleButtonGroup>
                    </div>
                    <div className="margin-div">
                      {/* <Typography gutterBottom className={classes.typography}>
                        Select time period
                      </Typography>
                      <CustomSlider
                        style={{ marginTop: dimensions.width > desktop ? '' : -5, marginBottom: dimensions.width > desktop ? '' : -5 }}
                        value={actualTimePeriodRange}
                        min={timePeriodRange[0]}
                        max={timePeriodRange[1]}
                        onChange={(evt, value) => {
                          setActualTimePeriodRange(value)
                        }}
                        valueLabelDisplay="auto"
                      /> */}
                      <div className="my-year-range">
                        <div className="my-year-range-row">
                          <Typography gutterBottom className={classes.typography}>
                            Start year
                          </Typography>
                          <Select
                            value={actualTimePeriodRange[0]}
                            onChange={(evt, value) => setActualTimePeriodRange([value.props.value, actualTimePeriodRange[1]])}
                            className={classes.select}
                            fullWidth
                          >
                            {years.map((n) => {
                              return (
                                <MenuItem className={classes.select} value={n}>
                                  {n}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </div>
                        <div className="my-divider"></div>
                        <div className="my-year-range-row">
                          <Typography gutterBottom className={classes.typographyEndYear}>
                            End year
                          </Typography>
                          <Select
                            value={actualTimePeriodRange[1]}
                            onChange={(evt, value) => setActualTimePeriodRange([actualTimePeriodRange[0], value.props.value])}
                            className={classes.select}
                            fullWidth
                          >
                            {years.map((n) => {
                              return (
                                <MenuItem className={classes.select} value={n}>
                                  {n}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <span>XDR: {tooltipContent.additionalInfo.XDR}%</span>
                      <span>DCS: {tooltipContent.additionalInfo.DCS}%</span>
                      <span>AzithR: {tooltipContent.additionalInfo.AzithR}%</span>
                      <span>CipI: {tooltipContent.additionalInfo.CipI}%</span>
                      <span>CipR: {tooltipContent.additionalInfo.CipR}%</span>
                      <span>Susceptible: {tooltipContent.additionalInfo.STAD}%</span>
                    </div>
                  )}
                  {tooltipContent.genotypeInfo && (
                    <div className="additional-info" className="margin-div">
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
                    <div className="additional-info margin-div">
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
                  {tooltipContent.stadInfo && (
                    <div className="additional-info">
                      <span>Susceptible: {tooltipContent.stadInfo.count} ({tooltipContent.stadInfo.percentage}%)</span>
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
                      <span>CipR: {tooltipContent.cipRInfo2.count} ({tooltipContent.cipRInfo2.percentage}%)</span>
                      <span>CipI/R: {tooltipContent.cipIRInfo.count} ({tooltipContent.cipIRInfo.percentage}%)</span>
                    </div>
                  )}
                  {tooltipContent.cipRInfo && (
                    <div className="additional-info">
                      <span>CipR: {tooltipContent.cipRInfo.count} ({tooltipContent.cipRInfo.percentage}%)</span>
                    </div>
                  )}
                  {tooltipContent.drugsInfo && (
                    <div className="additional-info margin-div">
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
                    <div className="additional-info margin-div">
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
                    <div className="additional-info margin-div">
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
                  {(!tooltipContent.incTypesInfo && !tooltipContent.amrProfilesInfo && !tooltipContent.drugsInfo && !tooltipContent.xdrInfo && !tooltipContent.mdrInfo && !tooltipContent.stadInfo && !tooltipContent.dcsInfo && !tooltipContent.azInfo && !tooltipContent.cipIInfo && !tooltipContent.cipRInfo && !tooltipContent.simpleGenotypeInfo && !tooltipContent.genotypeInfo && !tooltipContent.additionalInfo) && (
                    <div className="additional-info">
                      <span>{tooltipContent.smallerThan20 ? "0%" : 'Insufficient data'}</span>
                    </div>
                  )}
                </div>
              )}
            </ReactTooltip>
          </div>
        </div>
        <div className="chart-wrapper">
          <h2 className="showing-data">Now showing: {dataset} data from {actualCountry === "All" ? "all countries" : actualCountry} from {actualTimePeriodRange.toString().substring(0, 4)} to {actualTimePeriodRange.toString().substring(5)}</h2>
          <div className="country-region-div" style={{flexDirection: dimensions.width > 560 ? 'row' : 'column'}}>
            <FormControl className={classes.formControlSelect, dimensions.width <= 560 ? classes.formControlSelectCountryRegionH : classes.formControlSelectCountryRegionV}>
              <label className="select-country-label">Select country (or click map)</label>
              <Select
                value={actualCountry}
                onChange={evt => setActualCountry(evt.target.value)}
                fullWidth
                className={classes.selectCountry}
              >
                {countriesForFilter.map((country, index) => {
                  return (
                    <MenuItem key={index} className={classes.selectCountryValues} value={country}>
                      {country}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            {/* {dimensions.width > 560 && <div className="country-region-spacer"></div>}
            <FormControl className={classes.formControlSelect, dimensions.width <= 560 ? classes.formControlSelectCountryRegionH : classes.formControlSelectCountryRegionV}>
              <label className="select-country-label">Select region</label>
              <Select
                value={actualRegion}
                onChange={evt => setActualRegion(evt.target.value)}
                fullWidth
                className={classes.selectCountry}
              >
                {regionsForFilter.map((region, index) => {
                  return (
                    <MenuItem key={index} className={classes.selectCountryValues} value={region}>
                      {region}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl> */}
          </div>
          <div className="chart-wrapper-div">
            <div className="chart-wrapper-div2" style={{ flexDirection: dimensions.width > desktop ? "row" : "column", paddingBottom: dimensions.width > desktop ? 20 : 0 }}>
              <div className="chart-wrapper-div3" style={{ paddingRight: dimensions.width < mobile ? 0 : 10 }}>
                <div className="chart-wrapper-RFWA">
                  <div className="chart-wrapper-RFWA-div">
                    <span className="chart-title chart-wrapper-RFWA-title">Resistance frequencies within genotypes</span>
                    <div className="chart-wrapper-RFWA-download">
                      <TooltipMaterialUI title={<span className="my-font">Download Chart as PNG</span>} placement="right">
                        <div
                          className={`button ${captureControlChartRFWGInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartRFWGInProgress)
                              capturePicture('RFWG', 1, { mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, interval: brushRFWG })
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartRFWGInProgress && (
                        <CustomCircularProgress
                          size={44}
                          thickness={4} />
                      )}
                    </div>
                  </div>
                  <span className="chart-title chart-wrapper-RFWA-top">Top Genotypes (up to 5)</span>
                  <div className="chart-wrapper-RFWA-view" style={{ width: dimensions.width > 790 ? "71%" : '260px' }}>
                    <InputLabel className={classes.inputLabel}>Data view</InputLabel>
                    <FormControl fullWidth className={classes.formControlSelect}>
                      <DropDownSelect
                        options={RFWGFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[{ value: RFWGFilterOptions[RFWGFilter - 1].value, id: RFWGFilter }]}
                        onChange={evt => {
                          setRFWGFilter(evt[0].id)
                          setBrushRFWG([drugsAndGenotypesChartData[0].name, drugsAndGenotypesChartData[drugsAndGenotypesChartData.length - 2].name])
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                  </div>
                  <div id="RFWG">
                    {/* <span className="y-axis-label-vertical" style={{ paddingRight: 8, marginBottom: 100 }}>{RFWGFilter === 1 ? 'Number of genomes' : 'Percentage within genotype (%)'}</span> */}
                    {plotDrugsAndGenotypesChart}
                  </div>
                </div>
                <div className="chart-wrapper-RDWAG">
                  <div className="chart-wrapper-RDWAG-div">
                    <span className="chart-title chart-wrapper-RDWAG-title">Resistance determinants within genotypes</span>
                    <div className="chart-wrapper-RDWAG-download">
                      <TooltipMaterialUI title={<span className="my-font">Download Chart as PNG</span>} placement="right">
                        <div
                          className={`button ${captureControlChartRFWAGInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartRFWAGInProgress)
                              capturePicture('RFWAG', 4, { mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, amrClassFilter: amrClassFilter, interval: brushRDWAG })
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartRFWAGInProgress && (
                        <CustomCircularProgress
                          size={44}
                          thickness={4} />
                      )}
                    </div>
                  </div>
                  <span className="chart-title chart-wrapper-RDWAG-top">Top Genotypes (up to 10)</span>
                  <div className="chart-wrapper-RDWAG-view" style={{ width: dimensions.width > desktop ? "71%" : "90%" }}>
                    <InputLabel className={classes.inputLabel}>Select Drug Class</InputLabel>
                    <FormControl fullWidth className={classes.formControlSelect}>
                      <DropDownSelect
                        options={amrClassFilterforFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[{ value: amrClassFilter, id: (amrClassFilterforFilterOptions.find(o => o.value === amrClassFilter)).id }]}
                        onChange={evt => {
                          setAmrClassFilter(evt[0].value)
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                    <InputLabel className={classes.inputLabel}>Data view</InputLabel>
                    <FormControl fullWidth className={classes.formControlSelect}>
                      <DropDownSelect
                        options={amrClassFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[{ value: amrClassFilterOptions[RDWAGDataviewFilter - 1].value, id: RDWAGDataviewFilter }]}
                        onChange={evt => {
                          setRDWAGDataviewFilter(evt[0].id)
                          setBrushRDWAG([amrClassChartData[0].genotype, amrClassChartData[amrClassChartData.length - 2].genotype])
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                  </div>
                  <div id="RFWAG" >
                    {/* <span className="y-axis-label-vertical" style={{ paddingRight: 8, paddingTop: 190 }}>Number of occurrences</span> */}
                    {plotAmrClassChart}
                  </div>
                </div>
              </div>
              <div className="chart-wrapper-div3" style={{ paddingLeft: dimensions.width < mobile ? 0 : 10, marginTop: dimensions.width < desktop ? 50 : 0 }}>
                <div className="chart-wrapper-DRT">
                  <div className="chart-wrapper-DRT-div">
                    <span className="chart-title chart-wrapper-DRT-title">Drug resistance trends</span>
                    <div className="chart-wrapper-DRT-download">
                      <TooltipMaterialUI title={<span className="my-font">Download Chart as PNG</span>} placement="right">
                        <div
                          className={`button ${captureControlChartDRTInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartDRTInProgress)
                              capturePicture('DRT', 2, { mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, interval: brushDRT, drugs: trendValues })
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartDRTInProgress && (
                        <CustomCircularProgress
                          size={44}
                          thickness={4} />
                      )}
                    </div>
                  </div>
                  <span className="chart-title chart-wrapper-RFWA-top">Data are plotted for years with N ≥ 10 genomes</span>
                  {dimensions.width > desktop && (<span className="chart-title" ></span>)}
                  <div className="chart-wrapper-DRT-view" style={{ width: dimensions.width > 790 ? "71%" : '260px' }}>
                    {/* <InputLabel style={{fontSize: 12, fontWeight: 500, fontFamily: "Montserrat" }}>Drugs view</InputLabel> */}
                    <div className="chart-wrapper-DRT-view-drugs">
                      <div className="chart-wrapper-DRT-view-drugs-label">Drugs view</div>
                      <FontAwesomeIcon icon={faInfoCircle} onClick={handleClickOpen4} className="icon-info" />
                      <Dialog
                        open={open4}
                        onClose={handleClose4}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle id="alert-dialog-title">{"Information"}</DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-description">
                            {'Data is shown only for years with N≥10 genomes'}
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleClose4} color="primary">
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </div>
                    <FormControl id="DDS" fullWidth className={classes.formControlSelect}>
                      <DropDownSelect
                        options={trendDropdownOptions}
                        multi={true}
                        searchable={false}
                        clearable={true}
                        separator={true}
                        labelField={"value"}
                        values={trendDropdownOptions}
                        className="dropdown-select"
                        contentRenderer={({ props, state }) => {
                          return (
                            <div className="chart-wrapper-DRT-view-drugs-select">
                              {state.values.length} of {props.options.length} Selected
                            </div>
                          );
                        }}
                        itemRenderer={({ item, itemIndex, props, state, methods }) => (
                          <div key={item[props.valueField]} onClick={() => methods.addItem(item)}>
                            <div className="chart-wrapper-DRT-view-drugs-select-options">
                              <input type="checkbox" checked={methods.isSelected(item)} />
                              &nbsp;&nbsp;&nbsp;{item[props.labelField]}
                            </div>
                          </div>
                        )}
                        clearRenderer={
                          ({ props, state, methods }) => {
                            return (
                              <Buttons>
                                {methods.areAllSelected() ? (
                                  <ButtonClearSelect id="DSButton" className="clear" onClick={methods.clearAll} checked={false}>
                                    Clear all
                                  </ButtonClearSelect>
                                ) : (
                                  <ButtonClearSelect id="DSButton" onClick={methods.selectAll} checked={true}>Select all</ButtonClearSelect>
                                )}
                              </Buttons>
                            );
                          }
                        }
                        onChange={(values) => {
                          const doc = document.getElementById('DRT');
                          const lines = doc.getElementsByClassName('recharts-line')
                          for (let index = 0; index < lines.length; index++) {
                            const isValue = values.some(e => e.id === index)
                            lines[index].style.display = isValue ? 'block' : 'none';
                          }
                          setTrendValues(values)
                        }}
                      />
                    </FormControl>
                  </div>
                  <div id="DRT">
                    {/* <span className="y-axis-label-vertical" style={{ paddingTop: 80 }}>Resistant (%)</span> */}
                    {plotDrugTrendsChart}
                  </div>
                </div>
                <div className="chart-wrapper-GD">
                  <div className="chart-wrapper-GD-div">
                    <span className="chart-title chart-wrapper-GD-title">Genotype distribution</span>
                    <div className="chart-wrapper-GD-download">
                      <TooltipMaterialUI title={<span className="my-font">Download Chart as PNG</span>} placement="right">
                        <div
                          className={`button ${captureControlChartGDInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartGDInProgress)
                              capturePicture('GD', 3, { mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, interval: brushGD })
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartGDInProgress && (
                        <CustomCircularProgress
                          size={44}
                          thickness={4} />
                      )}
                    </div>
                  </div>
                  {dimensions.width > desktop && (<span className="chart-title chart-wrapper-GD-space"></span>)}
                  <div className="chart-wrapper-GD-view" style={{ paddingTop: dimensions.width > desktop ? '67px' : '', width: dimensions.width > desktop ? "71%" : "90%" }}>
                    <InputLabel className={classes.inputLabel}>Data view</InputLabel>
                    <FormControl fullWidth className={classes.formControlSelect}>
                      <DropDownSelect
                        options={populationStructureFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[{ value: populationStructureFilterOptions[populationStructureFilter - 1].value, id: populationStructureFilter }]}
                        onChange={evt => {
                          setPopulationStructureFilter(evt[0].id)
                          setBrushGD([populationStructureChartData[0].name, populationStructureChartData[populationStructureChartData.length - 1].name])
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                  </div>
                  <div id="GD">
                    {/* {getPopulationStructureChartLabel()} */}
                    {/* <span className="y-axis-label-vertical" style={{ paddingTop: 190 }}>{populationStructureFilter === 1 ? 'Number of genomes' : '% Genomes per year'}</span> */}
                    {plotPopulationStructureChart}
                  </div>
                </div>
              </div>
            </div>
            <div className="wrapper-download-sheet-button" style={{ flexDirection: dimensions.width > desktop ? "row" : "column", padding: dimensions.width < desktop ? '0px 12px 12px 12px' : '50px 12px 12px 12px', width: "-webkit-fill-available" }}>
              <div className="download-sheet-button" onClick={() => dowloadBaseSpreadsheet()}>
                <FontAwesomeIcon icon={faTable} style={{ marginRight: 8 }} />
                <span>Download database</span>
              </div>
              {/* <div style={{ marginTop: dimensions.width > desktop ? 0 : 20, marginLeft: dimensions.width > desktop ? 20 : 0 }} className={`download-sheet-button`} onClick={() => {
                if (!captureReportInProgress) {
                  setCaptureReportInProgress(true);
                  capturePicture('', 5, { mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, amrClassFilter: amrClassFilter, brush: [brushRFWG, brushRDWAG, brushDRT, brushGD], drugs: trendValues });
                }
              }}>
                <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: 8 }} />
                <span>Download report from current view</span>
                {captureReportInProgress && (<div style={{ position: 'absolute', paddingBottom: 32, paddingRight: 20 }}>
                  <CustomCircularProgress
                    size={44}
                    thickness={4}
                    style={{ position: "absolute", top: -5, left: -6, color: "white" }} />
                </div>)}
              </div> */}
            </div>
          </div>
        </div>
        <div className="about-wrapper">
          <h2>About TyphiNET</h2>
          <p>
            The TyphiNET dashboard collates antimicrobial resistance (AMR) and genotype (lineage) information extracted from whole genome sequence (WGS) data from the bacterial pathogen <i>Salmonella</i> Typhi, the agent of typhoid fever. Data are sourced monthly from Typhoid <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">Pathogenwatch</a>. Information on genotype definitions and population structure can be found in <a href="https://www.nature.com/articles/ncomms12827" target="_blank" rel="noreferrer">Wong et al, 2016</a>, and details of AMR determinants in <a href="https://www.nature.com/articles/s41467-021-23091-2" target="_blank" rel="noreferrer">Argimon et al, 2021</a>. (CipI/R = decreased ciprofloxacin susceptibility).
          </p>
          <p>
            The TyphiNET dashboard is coordinated by Dr Zoe Dyson, Dr Louise Cerdeira &amp; Prof Kat Holt at the <a href="https://www.lshtm.ac.uk/" target="_blank" rel="noreferrer">London School of Hygiene and Tropical Medicine</a> &amp; <a href="https://www.monash.edu/" target="_blank" rel="noreferrer">Monash University</a>, supported by the Wellcome Trust (Open Research Fund, 219692/Z/19/Z) and the EU Horizon 2020 research and innovation programme (Marie Skłodowska-Curie grant #845681).
          </p>
          <p>
            <b>Note: This is a beta version, data are incomplete</b>.
          </p>
        </div>
        <div className="footer-buttons-wrapper">
          <div
            className="flex-button"
            onClick={() => {
              window.open('mailto:dashboard@typhi.net', '_blank')
            }}
          >
            <FontAwesomeIcon icon={faEnvelope} className="fontawesome-icon" />
            <span>Contact</span>
          </div>
          <div
            className="flex-button"
            onClick={() => {
              window.open('https://github.com/zadyson/TyphiNET', '_blank')
            }}
          >
            <FontAwesomeIcon icon={faGithub} className="fontawesome-icon" />
            <span>GitHub</span>
          </div>
          <div
            className="flex-button"
            onClick={() => {
              window.open('https://twitter.com/typhinet', '_blank')
            }}
          >
            <FontAwesomeIcon icon={faTwitter} className="fontawesome-icon" />
            <span>Twitter</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="footer">
          <span>Data obtained from: <a href="https://pathogen.watch" rel="noreferrer" target="_blank">pathogen watch project</a> on 15/06/2021. <a href="https://holtlab.net" rel="noreferrer" target="_blank">Holt Lab</a></span>
        </div>
        <div className="fab-button" style={{ width: dimensions.width < mobile ? '48px' : '56px' }}>
          <TooltipMaterialUI title={<span className="my-font">Reset Configurations</span>} placement="left">
            <Fab
              color="primary"
              aria-label="add"
              size={dimensions.width < mobile ? 'medium' : 'large'}
              onClick={() => {
                setMapView('CipI');
                setDataset('All');
                setActualTimePeriodRange(timePeriodRange);
                setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
                setActualCountry('All');
                setPopulationStructureFilter(1);
                setAmrClassFilter(amrClassesForFilter[5]);
                setRDWAGDataviewFilter(2)
                setRFWGFilter(2)
                setActualContinent("All")
                const text = document.getElementById('DSButton')
                if (text.innerText === "SELECT ALL") {
                  text.click()
                }
              }}
            >
              <FontAwesomeIcon icon={faUndoAlt} size="lg" color="white" />
            </Fab>
          </TooltipMaterialUI>
        </div>
      </div>
      <div className="loading">
        {dimensions.width > desktop && (
          <img className="logoImageMenu-loading" src={typhinetLogoImg} alt="TyphiNET" />
        )}
        <Loader
          className="my-loader"
          type="Circles"
          color="#D91E45"
          height={70}
          width={70}
        />
      </div>
    </div>
  );
};

export default DashboardPage;