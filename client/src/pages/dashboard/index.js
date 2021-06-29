import './index.css';
import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import Loader from "react-loader-spinner";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from "react-simple-maps";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Fab from '@material-ui/core/Fab';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import TooltipMaterialUI from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Zoom from '@material-ui/core/Zoom';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ReactTooltip from "react-tooltip";
import { BarChart, Bar, XAxis, Label, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, LineChart, Line, Legend } from 'recharts';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faCrosshairs, faCamera, faTable, faFilePdf, faInfoCircle, faUndoAlt } from '@fortawesome/free-solid-svg-icons'
import download from 'downloadjs';
import { svgAsPngUri } from 'save-svg-as-png';
import typhinetLogoImg from '../../assets/img/logo-typhinet.png';
import typhinetLogoImg2 from '../../assets/img/logo-typhinet-prod.png';
import geography from '../../assets/world-110m.json'
import { API_ENDPOINT } from '../../constants';
import { getColorForGenotype, getColorForAMR, getColorForDrug, getColorForIncType, getColorForTetracyclines } from '../../util/colorHelper';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
// import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
// import ContactPage from '../contact';
import domtoimage from 'dom-to-image';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { jsPDF } from "jspdf";

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
  // const [samplesQty, setSamplesQty] = useState(0);

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

  const [allCountries, setAllCountries] = useState([]);

  const [timePeriodRange, setTimePeriodRange] = React.useState([1905, 2019]);
  const [actualTimePeriodRange, setActualTimePeriodRange] = React.useState([1905, 2019]);
  const [countriesForFilter, setCountriesForFilter] = React.useState(['All']);
  const [actualCountry, setActualCountry] = useState("All");
  const [populationStructureFilter, setPopulationStructureFilter] = React.useState(1);
  const [RFWGFilter, setRFWGFilter] = React.useState(1);
  const [amrClassesForFilter] = useState([/*"AMR Profiles", */"Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (CipI/R)", "Sulphonamides", "Tetracyclines", "Trimethoprim"])
  const [drtClassesForFilter] = useState(["Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (CipI/R)", "Susceptible", "Sulphonamides", "Tetracyclines", "Trimethoprim"])
  const [amrClassFilter, setAmrClassFilter] = React.useState(amrClassesForFilter[5])
  const [RDWAGDataviewFilter, setRDWAGDataviewFilter] = React.useState(1)

  const [drugTrendsChartData, setDrugTrendsChartData] = useState([])
  const [drugsAndGenotypesChartData, setDrugsAndGenotypesChartData] = useState([])
  const [chartMaxHeight, setChartMaxHeight] = useState(0)
  // const [chartMaxWidth, setChartMaxWidth] = useState(0)
  const [populationStructureChartData, setPopulationStructureChartData] = useState([])
  const [amrClassChartData, setAmrClassChartData] = useState([])

  const [mapView, setMapView] = React.useState('CipI');
  const [dataset, setDataset] = React.useState('full');
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

  // const [contactModalVisible, setContactModalVisible] = useState(false)

  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

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

  // const [dimensions.width > desktop, setdimensions.width > desktop] = useState(window.innerWidth > 767)
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

  // useEffect(() => {
  //   const timeOutId = setTimeout(() => {
  //     setAppLoading(false)
  //   }, 8000)
  //   return () => clearTimeout(timeOutId);
  // }, [appLoading])

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
    '0','0.0.1', '0.0.2', '0.0.3', '0.1.0', '0.1',
    '0.1.1', '0.1.2', '0.1.3', '1.1', '1.1.1',
    '1.1.2', '1.1.3', '1.1.4', '1.2', '1.2.1',
    '2', '2.0.0', '2.0.1', '2.0.2', '2.1.0', '2.1',
    '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5', '2.1.6',
    '2.1.7', '2.1.8', '2.1.9', '2.1.7.1', '2.1.7.2', '2.2',
    '2.2.0', '2.2.1', '2.2.2', '2.2.3', '2.2.4',
    '2.3', '2.3.1', '2.3.2', '2.3.3', '2.3.4',
    '2.3.5', '2.4.0', '2.4', '2.4.1', '2.5.0', '2.5',
    '2.5.1', '2.5.2', '3.0.0', '3', '3.0.1', '3.0.2',
    '3.1.0', '3.1', '3.1.1', '3.1.2', '3.2',
    '3.2.1', '3.2.2', '3.3.0', '3.3', '3.3.1',
    '3.3.2', '3.3.2.Bd1', '3.3.2.Bd2', '3.4',
    '3.5', '3.5.1', '3.5.2', '3.5.3',
    '3.5.4', '4', '4.1.0', '4.1', '4.1.1', '4.2', '4.2.1',
    '4.2.2', '4.2.3', /*'4.3', '4.3.0', */'4.3.1', '4.3.1.1',
    '4.3.1.1.P1', '4.3.1.1.EA1', '4.3.1.2', '4.3.1.2.EA2',
    '4.3.1.2.EA3', '4.3.1.3', '4.3.1.3.Bdq'].sort((a, b) => a.localeCompare(b)));

  useEffect(() => {
    axios.get(`${API_ENDPOINT}filters/getYearLimits`)
      .then((res) => {
        let limits = res.data
        setTimePeriodRange([limits.min, limits.max])
        setActualTimePeriodRange([limits.min, limits.max])
        setAllCountries(limits.countries)
        setAllGenotypes(limits.allGenotypes)
        setTotalGenotypes(limits.totalGenotypes)
        setAppLoading((value) => value + 1)
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
    const parseDataForGenotypeChart = (data) => {
      var finalPopulationStructureChartData = [];

      var genomes = data;
      var genotypes = [];

      data.forEach((entry) => {
        if (!genotypes.some(g => g === entry.GENOTYPE)) {
          genotypes.push(entry.GENOTYPE)
        }

        /* POPULATION STRUCTURE CHART GENERATION */
        // if (populationStructureFilter === 1) { /* Genotype */
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
        // } 
        // else { /* H58 / Non-H58 */
        //   if (entry['GENOTYPE_SIMPLE'] === 'H58' || entry['GENOTYPE_SIMPLE'] === 'Non-H58')
        //     if (!finalPopulationStructureChartData.some(e => e.name === entry['GENOTYPE_SIMPLE'])) {
        //       finalPopulationStructureChartData.push({
        //         name: entry['GENOTYPE_SIMPLE'],
        //         [entry.GENOTYPE]: 1
        //       })
        //     } else {
        //       let genotypeSimple = finalPopulationStructureChartData.find(e => e.name === entry['GENOTYPE_SIMPLE']);
        //       let genotypeSimpleIndex = finalPopulationStructureChartData.findIndex(e => e.name === entry['GENOTYPE_SIMPLE']);

        //       if (genotypeSimple[entry.GENOTYPE] === undefined) {
        //         genotypeSimple[entry.GENOTYPE] = 1
        //       } else {
        //         genotypeSimple[entry.GENOTYPE] = genotypeSimple[entry.GENOTYPE] + 1
        //       }
        //       finalPopulationStructureChartData[genotypeSimpleIndex] = genotypeSimple;
        //     }
        // }
      })

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

      if (!arraysEqual(finalPopulationStructureChartData, populationStructureChartData)){
        setPopulationStructureChartData(finalPopulationStructureChartData)
        setBrushGD([finalPopulationStructureChartData[0].name, finalPopulationStructureChartData[finalPopulationStructureChartData.length - 1].name])
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

        // if (populationStructureFilter === 1) {
        //   if (highestSum > chartMaxHeight)
        //     setChartMaxHeight(Math.ceil(highestSum / 100) * 100)
        // } else {
        //   if (highestSum > chartMaxWidth)
        //     setChartMaxWidth(Math.ceil(highestSum / 100) * 100)
        // }
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
        // setSamplesQty(
        //   Math.ceil((
        //     samplesData.length > 0 ? samplesData.sort((a, b) => b.count - a.count)[0].count : 0
        //   ) / 50) * 50
        // )
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

      let genotypes = []
      finalChartData.forEach(element => {
        let keys = Object.keys(element).slice(1)
        let filteredData = keys.filter((key) => { return !(key.includes('No')) && !(key.includes('0_')) })
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
            if (actualCountry === "All") {
              data.total2 = allGenotypes[entry[1].toString()];
            } else {
              let noneCount = 'None' in data ? data['None'] : 0
              data.total2 = data.total + noneCount
            }
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

      // if (amrClassFilter !== "Co-trimoxazole") {
      //   if (!arraysEqual(amrClassChartData, top10))
      //     setAmrClassChartData(top10)
      // } else {
      //   if (!arraysEqual(amrClassChartData, top10))
      //     setAmrClassChartData(top10)
      // }
      if (!arraysEqual(amrClassChartData, top10)){
        setAmrClassChartData(top10)
        setBrushRDWAG([top10[0].genotype, top10[top10.length - 2].genotype])
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
          if (actualCountry !== "All" && entry[0] === "name") {
            data.total = totalCountryCount[entry[1]].total
            data.totalS = totalCountryCount[entry[1]].totalS
          }
          else if (entry[0] === "name")
            data.total = allGenotypes[entry[1]]
        })
      })

      finalDrugTrendsChartData = finalDrugTrendsChartData.filter(item => item.total === 10 || item.total > 10)

      finalDrugTrendsChartData.sort((a, b) => a.name.localeCompare(b.name))
      finalDrugTrendsChartData.push({ totalSum: allDrugs})

      finalDrugsAndGenotypesChartData.sort((a, b) => b.total - a.total)
      finalDrugsAndGenotypesChartData = finalDrugsAndGenotypesChartData.slice(0, finalDrugsAndGenotypesChartData.length >= 5 ? 5 : finalDrugsAndGenotypesChartData.length)
      finalDrugsAndGenotypesChartData.push({ totalSum: totalSum})

      if (!arraysEqual(finalDrugTrendsChartData, drugTrendsChartData)){
        setDrugTrendsChartData(finalDrugTrendsChartData)
        setBrushDRT([finalDrugTrendsChartData[0].name, finalDrugTrendsChartData[finalDrugTrendsChartData.length - 2].name])
      }
      if (!arraysEqual(finalDrugsAndGenotypesChartData, drugsAndGenotypesChartData)) {
        setDrugsAndGenotypesChartData(finalDrugsAndGenotypesChartData)
        setBrushRFWG([finalDrugsAndGenotypesChartData[0].name, finalDrugsAndGenotypesChartData[finalDrugsAndGenotypesChartData.length - 2].name])
      }
    }

    const timeOutId = setTimeout(async () => {
      let filter;

      filter = 2
      // if (populationStructureFilter === 1) {
      //   filter = 2
      // } else {
      //   filter = 3 /* H58 and Non-H58 */
      // }

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

      let classChartResponse
      if (amrClassFilter === "Fluoroquinolones (CipI/R)") {
        classChartResponse = await axios.get(`${API_ENDPOINT}filters/amrClassChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${"Fluoroquinolones (CipI-R)"}/${dataset}`)
      } else {
        classChartResponse = await axios.get(`${API_ENDPOINT}filters/amrClassChart/${actualCountry === "All" ? "all" : actualCountry}/${actualTimePeriodRange[0]}/${actualTimePeriodRange[1]}/${amrClassFilter}/${dataset}`)
      }
      parseDataForAmrClassChart(classChartResponse.data)

      setAppLoading((value) => { if (value < 2) return value + 1 })

    }, 500);
    return () => clearTimeout(timeOutId);
  }, [populationStructureFilter, actualTimePeriodRange, actualCountry, dataset, amrClassFilter, allGenotypes]) // eslint-disable-line react-hooks/exhaustive-deps

  function arraysEqual(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  // const mapSamplesColorScale = scaleLinear()
  //   .domain([1, samplesQty / 5, 2 * (samplesQty / 5), 3 * (samplesQty / 5), 4 * (samplesQty / 5), samplesQty])
  //   .range(["#4575b4", "#91bfdb", "#e0f3f8", "#fee090", "#fc8d59", "#d73027"]);

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
        position={{ y: positionY, x: dimensions.width < mobile ? -20 : 0 }}
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
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                  <div style={{display: "flex", flexDirection: "row", alignItems: 'center'}}>
                    <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                    {chart === 0 && (<span style={{ fontFamily: "Montserrat", fontSize: 16, paddingLeft: 10 }}>{"N = " + (actualCountry !== "All" ? payload[0].payload.totalS : payload[0].payload.total)}</span>)}
                    {chart === 4 && (<span style={{ fontFamily: "Montserrat", fontSize: 16, paddingLeft: 10 }}>{"N = " + (actualCountry !== "All" ? payload[0].payload.quantities.totalS : payload[0].payload.total)}</span>)}
                    {chart === 1 && (<span style={{ fontFamily: "Montserrat", fontSize: 16, paddingLeft: 10 }}>{"N = " + payload[0].payload.total}</span>)}
                  </div>
                  <div style={{ height: 14 }} />
                  <div style={{ display: "flex", flexWrap: "wrap", width: width1, flexDirection: "" }}>
                    {payload.reverse().map((item, index) => {
                      let percentage = ((item.value / item.payload.total) * 100)
                      if (chart === 1) {
                        percentage = ((item.payload.drugsPercentage[item.dataKey] / item.payload.total) * 100)
                      }
                      if (chart === 0 && actualCountry !== "All") {
                        percentage = ((item.value / item.payload.totalS) * 100)
                      }
                      percentage = Math.round(percentage * 100) / 100
                      if ((populationStructureFilter === 2 && chart === 3) || (RFWGFilter === 2 && chart === 4)) {
                        percentage = Math.round(item.value * 100) / 100
                      }
                      return (
                        <div key={index + item} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: width2, marginBottom: 8 }}>
                          <div style={{ backgroundColor: stroke ? item.stroke : item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flex: "none" }} />
                          <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, width: "95%" }}>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14, wordWrap: 'break-word', width: dimensions.width < mobile ? '80%' : '100%' }}>{item.name}</span>
                            <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {(populationStructureFilter === 2 && chart === 3) || (RFWGFilter === 2 && chart === 4) ? item.payload.quantities[item.name] : chart === 1 ? item.payload.drugsPercentage[item.dataKey] : item.value}</span>
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
  }, [dimensions, mobile, populationStructureFilter, RFWGFilter, hoverColor, actualCountry])

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
              height={300}
              data={populationStructureChartData}
              margin={{
                top: 20, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={[0, maxH]} allowDataOverflow={true} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle', fontSize: '' }} offset={6}>
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
                    <div style={{ display: "flex", flexDirection: "column", height: 180 }}>
                      <div style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", overflowX: 'scroll', height: 180, marginLeft: 68, justifyContent: "space-between", marginTop: 10 }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", marginBottom: 4, marginLeft: 3, marginRight: 10 }}>
                              <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, paddingLeft: 4 }}>{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {tooltip(280, dimensions.width < 620 ? 250 : 530, dimensions.width > 620 ? "20%" : "50%", false, { zIndex: 100, top: 20, right: -20 }, false)}
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
              height={300}
              data={teste}
              margin={{
                top: 20, bottom: 5, right: 0
              }}
              barCategoryGap={'10%'}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={[0, maxH]} allowDataOverflow={true} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} offset={6}>
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
                    <div style={{ display: "flex", flexDirection: "column", height: 180 }}>
                      <div style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", overflowX: 'scroll', height: 180, marginLeft: 68, justifyContent: "space-between", marginTop: 10 }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", marginBottom: 4, marginLeft: 3, marginRight: 10 }}>
                              <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, paddingLeft: 4 }}>{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {tooltip(280, dimensions.width < 620 ? 250 : 530, dimensions.width > 620 ? "20%" : "50%", false, { zIndex: 100, top: 20, right: -20 }, false, 3)}
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
          position={{ x: 0, y: 250 }}
          wrapperStyle={{ zIndex: 100, top: 50 }}
          allowEscapeViewBox={{ x: true, y: true }}
          cursor={{ fill: hoverColor }}
          content={({ active, payload, label }) => {
            if (payload !== null) {
              if (active) {
                return (
                  <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                    <div style={{ height: 14 }} />
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 250 }}>
                      {payload.reverse().map((item, index) => {
                        let percentage
                        if (RDWAGDataviewFilter === 1) {
                          percentage = ((item.value / item.payload.total2) * 100)
                        } else {
                          percentage = item.value
                        }
                        percentage = Math.round(percentage * 100) / 100
                        return (
                          <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "33.33%", marginBottom: 8 }}>
                            <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flex: "none" }} />
                            <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, wordWrap: "break-word", overflowX: "hidden" }}>
                              <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                              <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {RDWAGDataviewFilter === 2 ? item.payload.percentage[item.name] : item.value}</span>
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
              <XAxis padding={{ left: 5, right: 5 }} dataKey="genotype" type={"category"} interval={dimensions.width < middle ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis domain={[0, maxSum]} type={"number"} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} offset={6}>
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
                    <div style={{ display: "flex", flexDirection: "column", height: 180 }}>
                      <div style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", overflowX: 'scroll', height: 180, marginLeft: 68, justifyContent: amrClassFilter === "Ampicillin" ? "" : "space-between", marginTop: 10 }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", marginBottom: 4, marginLeft: 3, marginRight: 10 }}>
                              <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, paddingLeft: 4 }}>{dataKey}</span>
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
      } else if (RDWAGDataviewFilter === 2){
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
              <XAxis padding={{ left: 5, right: 5 }} dataKey="genotype" type={"category"} interval={dimensions.width < middle ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis domain={[0, 100]} type={"number"} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} offset={6}>
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
                    <div style={{ display: "flex", flexDirection: "column", height: 180 }}>
                      <div style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", overflowX: 'scroll', height: 180, marginLeft: 68, justifyContent: amrClassFilter === "Ampicillin" ? "" : "space-between", marginTop: 10 }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", marginBottom: 4, marginLeft: 3, marginRight: 10 }}>
                              <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, paddingLeft: 4 }}>{dataKey}</span>
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
              ['ereA-acrB_R717Q', "#FFEC78", "error-ereA-acrB_R717Q"],
              ['ereA-acrB_R717L', "#66c2a4", "error-ereA-acrB_R717L"],
              ['acrB_R717Q-acrB_R717L', "#fd8d3c", "error-acrB_R717Q-acrB_R717L"],
              ['ereA-acrB_R717Q-acrB_R717L', "#6baed6", "error-ereA-acrB_R717Q-acrB_R717L"],
              ['None', "#B9B9B9", "error-None"]
            ]
          }))
        case 'Fluoroquinolones (CipI/R)':
          return (armClassFilterComponent({
            left: 10, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
              ['3_QRDR', "#6baed6", "error-3_QRDR"],
              ['2_QRDR', "#FFEC78", "error-2_QRDR"],
              ['1_QRDR + qnrS', "#66c2a4", "error-1_QRDR + qnrS"],
              ['1_QRDR', "#FBCFE5", "error-1_QRDR"],
              ['None', "#B9B9B9", "error-None"],
              ['0_QRDR + qnrS', "#8D8D8D", "error-0_QRDR + qnrS"]]
          }))
        case 'Chloramphenicol':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['cmlA', "#addd8e", "error-cmlA"],
              ['catA1', "#9e9ac8", "error-catA1"],
              ["catA1-cmlA", "#FFEC78", "error-catA1-cmlA"],
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
              ['sul1-sul2', "#B4DD70", "error-sul1-sul2"],
              ['None', "#B9B9B9", "error-None"]]
          }))
        case 'Trimethoprim':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 0.5, width: 3, bars: [
              ['dfrA7', "#FFEC78", "error-dfrA7"],
              ['dfrA5', "#D7AEF7", "error-dfrA5"],
              ['dfrA18', "#66c2a4", "error-dfrA18"],
              ['dfrA17', "#FCB469", "error-dfrA17"],
              ['dfrA15', "#FBCFE5", "error-dfrA15"],
              ['dfrA14', "#6baed6", "error-dfrA14"],
              ['dfrA1', "#B4DD70", "error-dfrA1"],
              ['None', "#B9B9B9", "error-None"]]
          }))
        case 'Co-trimoxazole':
          let cotrim = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"];
          let colors1 = ["#ffeda0", "#fd8d3c", "#addd8e", "#9e9ac8", "#6baed6", "#7a0177", "#54278f"]
          let colors2 = ["#a50f15", "#6a5acd", "#f1b6da", "#fb8072", "#4682b4", "#2e8b57", "#98fb98"]
          let colors3 = ["#fcc5c0", "#bcbddc", "#fdd0a2", "#c994c7", "#9ecae1", "#a8ddb5", "#fc9272"]
          let bars = [['None', "#B9B9B9", "error-None"]]

          for (const index in cotrim) {
            bars.push([cotrim[index] + "-sul1", colors1[index], "error-" + cotrim[index] + "-sul1"])
            bars.push([cotrim[index] + "-sul2", colors2[index], "error-" + cotrim[index] + "-sul2"])
            bars.push([cotrim[index] + "-sul1-sul2", colors3[index], "error-" + cotrim[index] + "-sul1-sul2"])
          }

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
        // case 'AMR Profiles':
        //   return (armClassFilterComponent({
        //     left: dimensions.width > desktop ? 12 : -30, fontsize: dimensions.width > desktop ? 14 : 5, strokeWidth: 0.5, width: 3, bars: [
        //       ['No AMR detected', getColorForAMR('No AMR detected'), "error-No AMR detected"],
        //       ['MDR_DCS', getColorForAMR('MDR_DCS'), "error-MDR_DCS"],
        //       ['MDR', getColorForAMR('MDR'), "error-MDR"],
        //       ['DCS', getColorForAMR('DCS'), "error-DCS"],
        //       ['AzithR_MDR', getColorForAMR('AzithR_MDR'), "error-AzithR_MDR"],
        //       ['AzithR_DCS', getColorForAMR('AzithR_DCS'), "error-AzithR_DCS"],
        //       ['AzithR_DCS_MDR', getColorForAMR('AzithR_DCS_MDR'), "error-AzithR_DCS_MDR"],
        //       ['XDR', getColorForAMR('XDR'), "error-XDR"],
        //       ['AMR', getColorForAMR('AMR'), "error-AMR"],
        //       ['AMR_DCS', getColorForAMR('AMR_DCS'), "error-AMR_DCS"]]
        //   }))
        case 'ESBL':
          return (armClassFilterComponent({
            left: 3, fontsize: 14, strokeWidth: 1, width: null, bars: [
              ['blaSHV-12', "#addd8e", "error-blaSHV-12"],
              ['blaOXA-7', "#9e9ac8", "error-blaOXA-7"],
              ['blaCTX-M-15_23', "#6baed6", "error-blaCTX-M-15_23"],
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
    // const CustomizedDot = (props) => {
    //   const { cx, cy, stroke, payload, value, dataKey } = props;

    //   if (value !== undefined) {
    //     switch (dataKey) {
    //       case "Azithromycin":
    //         return (
    //           <svg x={cx - 6} y={cy - 7} width={120} height={120} fill={getColorForDrug(dataKey)} viewBox="0 0 1024 1024">
    //             <path d="M 50,5 95,97.5 5,97.5 Z"/>
    //           </svg>
    //         );
    //       case "Chloramphenicol":
    //         return (
    //           <svg x={cx - 7} y={cy - 7} width={160} height={160} fill={getColorForDrug(dataKey)} viewBox="0 0 1024 1024">
    //             <path d="M 25, 50 a 25,25 0 1,1 50,0 a 25,25 0 1,1 -50,0"/>
    //           </svg>
    //         );
    //       case "Fluoroquinolones (CipI/R)":
    //         return (
    //           <svg x={cx - 7} y={cy - 7} width={160} height={160} fill="black" viewBox="0 0 1024 1024">
    //             {/* <path d="M0,0 150,0 150,50 0,50" /> */}
    //           </svg>
    //         );
    //       default:
    //         return (
    //           <svg x={cx - 7} y={cy - 5} width={1} height={1} fill="transparent" viewBox="0 0 1024 1024"></svg>
    //         );
    //     }
    //   }
    //   return (
    //     <svg x={cx - 7} y={cy - 5} width={1} height={1} fill="transparent" viewBox="0 0 1024 1024"></svg>
    //   );
    // };

    const plotDrugTrendsChart = () => {
      let dataDRT = drugTrendsChartData.slice(0, drugTrendsChartData.length - 1)

      return (
        <ResponsiveContainer width="90%">
          <LineChart
            height={500}
            data={dataDRT}
            margin={{
              top: 20, bottom: 5, right: 0, left: -5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis padding={{ left: 20, right: 20 }} dataKey="name" interval={"preserveStartEnd"} tick={{fontSize: 14}} />
            <YAxis allowDecimals={false} width={70}>
              <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} offset={12}>
                Resistant (%)
              </Label>
            </YAxis>
            {drugTrendsChartData.slice(0, drugTrendsChartData.length - 1).length > 0 && (
              <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} onChange={(value)=>{
                console.log(value);
                setBrushDRT([
                  drugTrendsChartData[value.startIndex].name,
                  drugTrendsChartData[value.endIndex].name
                ])
              }}/>
            )}

            <Legend
              content={(props) => {
                const { payload } = props;
                return (
                  <div style={{ display: "flex", flexDirection: "row", justifyContent: 'flex-end' }}>
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: dimensions.width < 1585 ? "space-between" : "", paddingLeft: 68, marginTop: 10 }}>
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry
                        return (
                          <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", width: dimensions.width < 1585 ? 120: '19%', marginBottom: 4, marginLeft: 3, marginRight: 3 }}>
                            <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, paddingLeft: 4, fontFamily: 'Montserrat' }}>{dataKey}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              }}
            />
            {tooltip(275, dimensions.width < mobile ? 250 : 325, "50%", true, { zIndex: 100, top: 175, right: 0 }, true, 1)}
            {drtClassesForFilter.slice(1).map((item) => (<Line dataKey={item} strokeWidth={2} stroke={getColorForDrug(item)} connectNulls type="monotone" />))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    setPlotDrugTrendsChart(plotDrugTrendsChart)
  }, [drtClassesForFilter, dimensions, drugTrendsChartData, tooltip, mobile])

  useEffect(() => {
    const plotDrugsAndGenotypesChart = () => {
      if (RFWGFilter === 1) {
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={500}
              data={drugsAndGenotypesChartData.slice(0, drugsAndGenotypesChartData.length - 1)}
              margin={{
                top: 20, left: -5, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval={dimensions.width < mobile ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis allowDecimals={false} width={75}>
                <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} offset={12}>
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
                }/>
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: 'flex-end' }}>
                      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", paddingLeft: 73, marginTop: 10, justifyContent: dimensions.width < 1585 ? "space-between" : "" }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", width: dimensions.width < 1585 ? 120: '19%', marginBottom: 4, marginLeft: 3, marginRight: 3 }}>
                              <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, paddingLeft: 4 }}>{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {tooltip(285, dimensions.width < mobile ? 250 : 325, "50%", false, { zIndex: 100, top: 160 }, false, 0)}
              {drtClassesForFilter.slice(1).map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))}
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
              if (actualCountry === "All") {
                element[aux] = (element[aux] * 100) / element.total
              } else {
                element[aux] = (element[aux] * 100) / element.totalS
              }
            }
          }
        });

        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={500}
              data={teste}
              margin={{
                top: 20, left: -5, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis padding={{ left: 5, right: 5 }} dataKey="name" interval={dimensions.width < mobile ? 1 : 0} tick={{ fontSize: 14 }} />
              <YAxis domain={[0, 100]} allowDecimals={false} width={70}>
                <Label angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} offset={12}>
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
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: 'flex-end' }}>
                      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", paddingLeft: 68, justifyContent: dimensions.width < 1585 ? "space-between" : "", marginTop: 10 }}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry
                          return (
                            <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "start", width: dimensions.width < 1585 ? 120: '19%', marginBottom: 4, marginLeft: 3, marginRight: 3 }}>
                              <div style={{ height: 8, width: 8, borderRadius: 4, marginTop: 3, backgroundColor: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, paddingLeft: 4 }}>{dataKey}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {tooltip(285, dimensions.width < mobile ? 250 : 325, "50%", false, { zIndex: 100, top: 160 }, false, 4)}
              {drtClassesForFilter.slice(1).map((item) => (<Bar dataKey={item} fill={getColorForDrug(item)} />))}
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

  const [capturePicture] = useState(() => async (id, index, info={}) => {
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
    if (info.dataset === "full") {
      info.dataset = "All"
    } else if (info.dataset === "local") {
      info.dataset = "Travel"
    } else {
      info.dataset = "Local"
    }

    const names = ["Resistance frequencies within genotypes", "Drug resistance trends", "Genotype distribution", "Resistance determinants within all genotypes"]
    const brokenNames = [["Resistance frequencies", "within genotypes"], ["Resistance determinants", "within all genotypes"]]
    
    if (index === 5) {
      let ids = ["RFWG", "RFWAG", "DRT", "GD"]

      var doc = new jsPDF({unit: 'mm', format: 'a4', orientation: 'l'});

      let typhinetLogo = new Image();
      typhinetLogo.src = typhinetLogoImg2;
      doc.addImage(typhinetLogo, 'PNG', 115, 0, 80, 34)
      doc.setFontSize(16);
      const paragraph1 = "Nunc ultrices blandit urna mollis porttitor. Vivamus viverra imperdiet justo, vitae fermentum elit accumsan placerat. Maecenas malesuada tincidunt rhoncus. Sed quam mauris, lacinia ac nisi consectetur, tincidunt pulvinar mauris. Proin ultricies quam sit amet dolor faucibus, at aliquam leo porttitor. Morbi at molestie nulla. Mauris porta lacus at augue facilisis volutpat. Suspendisse justo odio, congue nec diam ut, pretium blandit arcu. Duis vel leo euismod, pretium ante sit amet, viverra nibh."
      const paragraph2 = "Quisque in tortor dignissim, mollis augue ac, sollicitudin ex. Quisque quis accumsan erat. Suspendisse sed nulla id ante fringilla sodales. Etiam sed pulvinar ex. Integer rutrum dolor a lobortis semper. Praesent fermentum feugiat justo ultrices facilisis. Etiam non sem ac ante rhoncus pretium eget eget dui. Duis non mollis nisl. Nullam id elementum augue, eget feugiat felis. Integer posuere nec sapien quis scelerisque. Etiam ut tortor dignissim, bibendum metus a, varius lectus. Nunc sollicitudin fringilla enim nec auctor. In vel rhoncus arcu. Morbi sed blandit libero."
      doc.text(paragraph1, 10, 50, {align: 'justify', maxWidth: 130})
      doc.text(paragraph2, 155, 50, {align: 'justify', maxWidth: 130})

      doc.addPage('a4', 'l')
      doc.setFontSize(25);
      doc.text("Global overview Salmonella Typhi", 80, 15);
      
      await svgAsPngUri(document.getElementById('control-map'), { scale: 4, backgroundColor: "white", width: 1200, left: -200} )
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
          actualMapView = "Extremely drug resistant (XDR)"
          break;
        case "Azith":
          actualMapView = "Azithromycin resistant"
          break;
        case "CipI":
          actualMapView = "Ciprofloxacin insusceptible (CipI)"
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
      doc.text("Map view: " + actualMapView, 10, 180);
      doc.text("Dataset: " + info.dataset, 10, 187);
      doc.text("Time period: " + info.actualTimePeriodRange[0] + " to " + info.actualTimePeriodRange[1], 10, 194);
      doc.text("Country: " + info.country, 10, 201);
      
      if (info.mapView === 'Dominant Genotype') {
        var img = new Image()
        img.src = "legends/MV_DG.png"
        doc.addImage(img, 'PNG', 90, 175, 160, 33)
      } else if (info.mapView === 'No. Samples') {
        var img2 = new Image()
        img2.src = "legends/MV_NS.png"
        doc.addImage(img2, 'PNG', 260, 170, 28, 35)
      } else {
        var img3 = new Image()
        img3.src = "legends/MV_outros.png"
        doc.addImage(img3, 'PNG', 260, 165, 30, 40)
      }
      
      doc.addPage('a4', 'l')
      const names2 = ["Resistance frequencies within genotypes", "Resistance determinants within all genotypes", "Drug resistance trends", "Genotype distribution"]
      for (let index = 0; index < ids.length; index++) {
        let legend
        // let brush
        const graph = document.getElementById(ids[index])
        if (index === 1 || index === 3) {
          legend = graph.getElementsByClassName('recharts-legend-wrapper')[0];
          legend.style.display = 'none'
        }
        // brush = graph.getElementsByClassName('recharts-brush')[0];
        // if (brush !== undefined) {
        //   brush.style.display = 'none'
        // }

        let url
        await domtoimage.toPng(document.getElementById(ids[index]), { quality: 1, bgcolor: "white" })
          .then(function (dataUrl) {
            url = dataUrl
          });

        if (index === 1 || index === 3) {
          legend.style.display = 'block'
        }
        // if (brush !== undefined) {
        //   brush.style.display = 'block'
        // }

        let subtitleH = 0
        if (index === 0 || index === 3) {
          subtitleH = 3
        }
        subtitleH += 3


        if (index === 2 && dimensions.width >= desktop) {
          doc.addImage(url, "PNG", 5, 15 + subtitleH - 21);
        } else {
          doc.addImage(url, "PNG", 5, 15 + subtitleH);
        }

        let imgWidth = jsPDF.API.getImageProperties(url).width
        imgWidth = Math.floor(imgWidth * 0.264583)
        doc.setFontSize(11)
        const texts = [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum lorem sit amet auctor hendrerit. Morbi ut pulvinar leo, et dignissim tortor. Cras eget diam dignissim leo volutpat pharetra. Proin blandit consequat eleifend. Pellentesque imperdiet luctus aliquet. Sed vel tortor eros. Praesent interdum, tellus sit amet accumsan tincidunt, nisi magna interdum lorem, quis rhoncus eros massa ac risus.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum lorem sit amet auctor hendrerit. Morbi ut pulvinar leo, et dignissim tortor. Cras eget diam dignissim leo volutpat pharetra. Proin blandit consequat eleifend. Pellentesque imperdiet luctus aliquet. Sed vel tortor eros. Praesent interdum, tellus sit amet accumsan tincidunt, nisi magna interdum lorem, quis rhoncus eros massa ac risus.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum lorem sit amet auctor hendrerit. Morbi ut pulvinar leo, et dignissim tortor. Cras eget diam dignissim leo volutpat pharetra. Proin blandit consequat eleifend. Pellentesque imperdiet luctus aliquet. Sed vel tortor eros. Praesent interdum, tellus sit amet accumsan tincidunt, nisi magna interdum lorem, quis rhoncus eros massa ac risus.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum lorem sit amet auctor hendrerit. Morbi ut pulvinar leo, et dignissim tortor. Cras eget diam dignissim leo volutpat pharetra. Proin blandit consequat eleifend. Pellentesque imperdiet luctus aliquet. Sed vel tortor eros. Praesent interdum, tellus sit amet accumsan tincidunt, nisi magna interdum lorem, quis rhoncus eros massa ac risus."
        ]
        let spaceBetween = -4
        if (dimensions.width < 1750) {
          spaceBetween = 13
        }
        doc.text(texts[index], imgWidth + spaceBetween, 23 + subtitleH, {align: 'justify', maxWidth: 50})


        doc.setFontSize(14)
        doc.text(names2[index], 23, 10)
        doc.setFontSize(9)

        if (index === 0) {
          doc.text("Top Genotypes (up to 5)", 23, 15)
        }
        if (index === 3) {
          doc.text("Top Genotypes (up to 10)", 23, 15)
        }

        const brushInterval = info.brush[index]

        if (index === 1 || index === 2) {
          doc.text("Interval: " + brushInterval[0] + " to " + brushInterval[1], 23, 15)
        } else {
          doc.text("Interval: " + brushInterval[0] + " to " + brushInterval[1], 23, 20)
        }

        if (index === 1) {
          var img4 = new Image()
          if (amrClassFilter === "Fluoroquinolones (CipI/R)") {
            img4.src = "legends/Fluoroquinolones (CipI-R).png"
          } else {
            img4.src = "legends/" + info.amrClassFilter + ".png"
          }
          doc.addImage(img4, 'PNG', 22, 105 + subtitleH)
        } else if (index === 3) {
          var img5 = new Image()
          img5.src = "legends/GD.png"
          doc.addImage(img5, 'PNG', 22, 105 + subtitleH)
        }
        if (index < ids.length - 1) {
          doc.addPage('a4', 'l')
        }
      }

      doc.save("TyphiNET - Global Overview.pdf");
      setCaptureReportInProgress(false);

    } else if (index !== 0) {

      let graph = document.getElementById(id)
      let canvas = document.createElement("canvas")
      let ctx = canvas.getContext('2d');
      let graphImg = document.createElement("img");
      let graphImgPromise = imgOnLoadPromise(graphImg);

      var legend = graph.getElementsByClassName('recharts-legend-wrapper')[0];
      // var brush = graph.getElementsByClassName('recharts-brush')[0];
  
      if (id === "RFWAG" || id === "GD") {
        legend.style.display = 'none'
      }
      // brush.style.display = 'none'

      await domtoimage.toPng(graph, { quality: 0.1, bgcolor: "white" })
        .then(function (dataUrl) {
          graphImg.src = dataUrl;
          legend.style.display = 'block'
          // brush.style.display = 'block'
        });
      
      let cHeight = 20
      let logoHeight = 50
      let legendHeight = 0
      let filterHeight = 80
      let subtitleHeight = 0
      if (id === "RFWG" || id === "RFWAG") {
        cHeight += 20
        subtitleHeight = 20
      }
      let imgHeight = graphImg.height
      if (id === "RFWAG" || id === "GD") {
        imgHeight -= 180
      }
      if (id === "GD") {
        legendHeight = 40
      }
      let imgWidth = graphImg.width
      if (id === "RFWAG") {
        imgWidth += 130
        if (info.amrClassFilter === "Co-trimoxazole") {
          imgWidth += 120
        }
      } else if (id === "GD") {
        imgWidth += 370
      }

      await graphImgPromise;
      canvas.width = imgWidth;

      let DRTHeight = 0
      if (id === "DRT" && dimensions.width >= desktop) {
        DRTHeight = 76
      }
      canvas.height = imgHeight + cHeight + logoHeight + legendHeight + filterHeight + subtitleHeight + 40 - DRTHeight;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "18px Montserrat"
      ctx.fillStyle = "black";
      ctx.textAlign = "center";

      if (id === "DRT" && dimensions.width >= desktop) {
        ctx.drawImage(graphImg, 10, cHeight + logoHeight + subtitleHeight - DRTHeight);
      } else {
        ctx.drawImage(graphImg, 10, cHeight + logoHeight + subtitleHeight);
      }

      if (id === "RFWG") {
        ctx.fillText(brokenNames[0][0], canvas.width/2, 10 + logoHeight)
        ctx.fillText(brokenNames[0][1], canvas.width/2, 30 + logoHeight)
        ctx.font = "12px Montserrat"
        ctx.fillText("Top Genotypes (up to 5)", canvas.width/2, 32 + logoHeight + subtitleHeight)
      } else if (id === "RFWAG") {
        ctx.fillText(brokenNames[1][0], canvas.width/2, 10 + logoHeight)
        ctx.fillText(brokenNames[1][1], canvas.width/2, 30 + logoHeight)
        ctx.font = "12px Montserrat"
        ctx.fillText("Top Genotypes (up to 10)", canvas.width/2, 32 + logoHeight + subtitleHeight)
      }else{
        ctx.fillText(names[index - 1], canvas.width/2, 10 + logoHeight)
      }

      if (id === "RFWAG" || id === "GD") {
        let legendImg = document.createElement("img")
        let legendImgPromise = imgOnLoadPromise(legendImg)
        if (id === "RFWAG") {
          if (amrClassFilter === "Fluoroquinolones (CipI/R)") {
            legendImg.src = "legends/Fluoroquinolones (CipI-R).png";
          } else {
            legendImg.src = "legends/" + info.amrClassFilter + ".png";
          }
          
        } else {
          legendImg.src = "legends/GD2.png";
        }
        await legendImgPromise;

        if (id === "DRT" && dimensions.width >= desktop) {
          ctx.drawImage(legendImg, graphImg.width, logoHeight + subtitleHeight + 12 + cHeight - DRTHeight);
        } else {
          ctx.drawImage(legendImg, graphImg.width, logoHeight + subtitleHeight + 12 + cHeight);
        }
      }

      let typhinetLogo = document.createElement("img");
      let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
      typhinetLogo.src = typhinetLogoImg2;
      await typhinetLogoPromise;
      ctx.drawImage(typhinetLogo, 0, 0, 120, 50);

      ctx.fillStyle = "black"
      ctx.font = "14px Montserrat"
      ctx.textAlign = "start"
      ctx.fillText("Dataset: " + info.dataset, 10, canvas.height - 90)
      ctx.fillText("Time period: " + info.actualTimePeriodRange[0] + " to " + info.actualTimePeriodRange[1], 10, canvas.height - 68)
      ctx.fillText("Country: " + info.country, 10, canvas.height - 46)
      ctx.fillText("Interval: " + info.interval[0] + " to " + info.interval[1], 10, canvas.height - 24)

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
          ctx.fillText("Global overview Salmonella Typhi", canvas.width/2, 80)
          ctx.font = "35px Montserrat"
          ctx.textAlign = "center";

          let actualMapView = info.mapView
          switch (actualMapView) {
            case "MDR":
              actualMapView = "Multidrug resistant (MDR)"
              break;
            case "XDR":
              actualMapView = "Extremely drug resistant (XDR)"
              break;
            case "Azith":
              actualMapView = "Azithromycin resistant"
              break;
            case "CipI":
              actualMapView = "Ciprofloxacin insusceptible (CipI)"
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

          ctx.fillText("Map view: " + actualMapView, canvas.width/2, 140)
          ctx.fillText("Dataset: " + info.dataset, canvas.width/2, 190)
          ctx.fillText("Time period: " + info.actualTimePeriodRange[0] + " to " + info.actualTimePeriodRange[1], canvas.width/2, 240)

          ctx.drawImage(mapImg, 0, textHeight, canvas.width, cHeight);

          let legendImg = document.createElement("img");
          let legendImgoPromise = imgOnLoadPromise(legendImg);
          let h
          let w
          if (info.mapView === 'Dominant Genotype') {
            legendImg.src = "legends/MV_DG.png";
            await legendImgoPromise;
            let centerWidth = (canvas.width - 1731)/2
            ctx.drawImage(legendImg, centerWidth, canvas.height - legendHeight, 1731, 400);
          } else if (info.mapView === 'No. Samples') {
            legendImg.src = "legends/MV_NS.png";
            await legendImgoPromise;
            h = 350
            w = 300
            ctx.drawImage(legendImg, canvas.width - w - 10, canvas.height - h - 10, w, h);
          } else {
            legendImg.src = "legends/MV_outros.png";
            await legendImgoPromise;
            h = 350
            w = 230
            ctx.drawImage(legendImg, canvas.width - w - 20, canvas.height - h - 20, w, h);
          }

          let typhinetLogo = document.createElement("img");
          let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
          typhinetLogo.src = typhinetLogoImg2;
          await typhinetLogoPromise;
          ctx.drawImage(typhinetLogo, 0, 0, 600, 252);

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

        let newLines = []
        for (let i = 0; i < lines.length; i++) {
          let aux = []
          for (let index = 0; index < lines[i].length; index++) {
            if (!indexes.includes(index)) {
              aux.push(lines[i][index])
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
    let percentageSteps = ['1', '25', '50', '75', '100']

    switch (mapView) {
      case 'No. Samples':
        let legends = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300']
        let aux = [1, 10, 20, 100, 300]
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0</span>
            </div> */}
            {[...Array(5).keys()].map((n) => {
              // const samplesLegend = n !== 0 ? n * (samplesQty / 5) : 1
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapSamplesColorScale(aux[n]) }} />
                  <span>{legends[n]}</span>
                </div>
              )
            })}
          </>
        )
      // case 'AMR Profiles':
      //   let amrProfiles = ['MDR_DCS', 'MDR', 'DCS', 'AzithR_MDR', 'AzithR_DCS', 'AzithR_DCS_MDR', 'XDR', 'AMR', 'AMR_DCS'].sort((a, b) => a.localeCompare(b));
      //   amrProfiles.push('No AMR detected')
      //   return (
      //     <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
      //       {amrProfiles.map((a, n) => {
      //         return (
      //           <div key={n} className="samples-info">
      //             <div className="color" style={{ backgroundColor: getColorForAMR(a) }} />
      //             <span>{a}</span>
      //           </div>
      //         )
      //       })}
      //     </div>
      //   )
      case 'Sensitive to all drugs':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
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
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((g, n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(g) }} />
                  <span>{g === "1" ? '1 - 24' : g}%</span>
                </div>
              )
            })}
          </>
        )
      case 'MDR':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'XDR':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'DCS':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'Azith':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'CipI':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
        )
      case 'CipR':
        return (
          <>
            {/* <div className="samples-info">
              <div className="color" style={{ backgroundColor: "#F5F4F6" }} />
              <span>0%</span>
            </div> */}
            {percentageSteps.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div className="color" style={{ backgroundColor: mapRedColorScale(n) }} />
                  <span>{n === "1" ? '1 - 24' : n}%</span>
                </div>
              )
            })}
          </>
        )
      // case 'Resistance to Drug':
      //   let drugs = ["Ampicillin", "Azithromycin", "Chloramphenicol", "Co-trimoxazole", "ESBL", "Fluoroquinolones (CipI/R)", "Sulphonamides", "Tetracyclines", "Trimethoprim"]
      //   return (
      //     <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
      //       {drugs.map((d, n) => {
      //         return (
      //           <div key={n} className="samples-info">
      //             <div className="color" style={{ backgroundColor: getColorForDrug(d) }} />
      //             <span>{d}</span>
      //           </div>
      //         )
      //       })}
      //     </div>
      //   )
      // case 'Plasmid Incompatibility Type':
      //   let incTypes = ["IncX1", "IncFIA(HI1)", "IncFIB(pHCM2)", "IncA/C2", "IncP1", "IncFIA(HI1)/IncHI1A/IncHI1B(R27)", "Col(BS512)", "IncHI1A/IncHI1B(R27)", "IncN", "IncHI1B(R27)", "p0111", "IncHI1A", "IncI1", "IncY", "IncFIB(AP001918)", "IncFIB(K)", "IncHI2/IncHI2A", "Col440I", "Col440I", "Col156", "Col440II/Col440II", "IncFIA(HI1)/IncHI1A", "ColRNAI", "ColpVC", "IncX3"].sort((a, b) => a.localeCompare(b));
      //   return (
      //     <div style={{ maxHeight: 300, display: "flex", flexDirection: "column", overflowY: "scroll" }}>
      //       {incTypes.map((d, n) => {
      //         return (
      //           <div key={n} className="samples-info">
      //             <div className="color" style={{ backgroundColor: getColorForIncType(d) }} />
      //             <span>{d}</span>
      //           </div>
      //         )
      //       })}
      //     </div>
      //   )
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
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'MDR'}>
              Multidrug resistant (MDR)
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'XDR'}>
              Extremely drug resistant (XDR)
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Azith'}>
              Azithromycin resistant
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'CipI'}>
              Ciprofloxacin insusceptible (CipI)
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'CipR'}>
              Ciprofloxacin resistant (CipR)
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Dominant Genotype'}>
              Dominant Genotype
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'H58 / Non-H58'}>
              H58 genotype
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Sensitive to all drugs'}>
              Sensitive to all drugs
            </MenuItem>
            <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'No. Samples'}>
              No. Samples
            </MenuItem>
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'AMR Profiles'}>
              AMR Profiles
            </MenuItem> */}
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'Plasmid Incompatibility Type'}>
              Plasmid Incompatibility Type
            </MenuItem> */}
            {/* <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat", fontSize: 14 }} value={'DCS'}>
              DCS
            </MenuItem> */}
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
      <div className="menu-bar-mobile">
        <img className="logoImageMenu-mobile" src={typhinetLogoImg} alt="TyphiNET" />
      </div>
      <div style={{ padding: dimensions.width > 770 ? '16px 16px 0px 16px' : '16px 0px 0px 0px' }}>
        <div className="info-wrapper">
          {dimensions.width > desktop && (
            <>
              <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                <img style={{ height: 90, marginBottom: -10 }} src={typhinetLogoImg} alt="TyphiNET" />
              </div>
              <div style={{ width: 16 }} />
            </>
          )}
          <div className="card">
            <span>
              Total Genomes
              <FontAwesomeIcon icon={faInfoCircle} onClick={handleClickOpen2} className="icon-info" />
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
              </Dialog>
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
          <div style={{ width: 16 }} />
          <div className="card">
            <span>
              Total Genotypes
              <FontAwesomeIcon icon={faInfoCircle} onClick={handleClickOpen} className="icon-info" />
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
              </Dialog>
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
          <h2 style={{ textAlign: "center" }}>Global Overview of <i>Salmonella</i> Typhi</h2>
          <div className="map-filters-wrapper-inside" style={{ flexDirection: dimensions.width > desktop ? 'row' : 'column' }}>
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
                        let darkGray = "#727272"

                        switch (mapView) {
                          case 'No. Samples':
                            if (sample && sample.count !== 0) {
                              fill = mapSamplesColorScale(sample.count);
                            } else if (sample && sample.count === 0) {
                              fill = '#F5F4F6'
                            }
                            break;
                          // case 'AMR Profiles':
                          //   country = worldMapAmrProfilesData.find(s => s.displayName === geo.properties.NAME)
                          //   if (country !== undefined)
                          //     if (country.amrProfiles.length > 0)
                          //       fill = getColorForAMR(country.amrProfiles[0].name);
                          //   break;
                          case 'Dominant Genotype':
                            country = worldMapGenotypesData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              const temp = country.genotypes
                              temp.sort((a, b) => a.count <= b.count ? 1 : -1)
                              if (sample && sample.count >= 20) {
                                fill = getColorForGenotype(temp[0].lineage)
                              } else {
                                fill = darkGray
                              }
                            }
                            break;
                          case 'H58 / Non-H58':
                            country = worldMapH58Data.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined && country.genotypes[0]) {
                              const temp = country.genotypes.find(g => g.type === 'H58')

                              if (temp === undefined || (temp !== undefined && temp.count < 20)) {
                                fill = darkGray
                              } else if (temp !== undefined && temp.count >= 20) {
                                fill = mapRedColorScale(temp.percentage)
                              } else {
                                fill = '#F5F4F6'
                              }

                              // switch (temp === undefined) {
                              //   case false:
                              //     fill = mapRedColorScale(temp.percentage)
                              //     break;
                              //   // case 'Non-H58':
                              //   //   fill = '#F5F4F6'
                              //   //   break;
                              //   default:
                              //     fill = '#F5F4F6'
                              //     break;
                              // }
                            }
                            break;
                          case 'MDR':
                            country = worldMapMDRData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              if (country.count >= 20) {
                                fill = mapRedColorScale(country.percentage);
                              } else {
                                fill = darkGray
                              }
                              
                            } else if (country !== undefined) {
                              fill = '#F5F4F6'
                            }
                            break;
                          case 'Sensitive to all drugs':
                            country = worldMapSTADData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              if (country.count >= 20) {
                                fill = mapRedColorScale(country.percentage);
                              } else {
                                fill = darkGray
                              }
                            } else {
                              fill = '#F5F4F6'
                            }
                            break;
                          case 'XDR':
                            country = worldMapXDRData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              if (country.count >= 20) {
                                fill = mapRedColorScale(country.percentage);
                              } else {
                                fill = darkGray
                              }
                            } else {
                              fill = '#F5F4F6'
                            }
                            break;
                          // case 'DCS':
                          //   country = worldMapDCSData.find(s => s.displayName === geo.properties.NAME)
                          //   if (country !== undefined && country.percentage) {
                          //     fill = mapRedColorScale(country.percentage);
                          //   } else if (country !== undefined) {
                          //     fill = '#F5F4F6'
                          //   }
                          //   break;
                          case 'Azith':
                            country = worldMapAZITHData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              if (country.count >= 20) {
                                fill = mapRedColorScale(country.percentage);
                              } else {
                                fill = darkGray
                              }
                            } else {
                              fill = '#F5F4F6'
                            }
                            break;
                          case 'CipI':
                            country = worldMapCIPIData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              if (country.count >= 20) {
                                fill = mapRedColorScale(country.percentage);
                              } else {
                                fill = darkGray
                              }
                            } else {
                              fill = '#F5F4F6'
                            }
                            break;
                          case 'CipR':
                            country = worldMapCIPRData.find(s => s.displayName === geo.properties.NAME)
                            if (country !== undefined) {
                              if (country.count >= 20) {
                                fill = mapRedColorScale(country.percentage);
                              } else {
                                fill = darkGray
                              }
                            } else {
                              fill = '#F5F4F6'
                            }
                            break;
                          // case 'Resistance to Drug':
                          //   country = worldMapDrugsData.find(s => s.displayName === geo.properties.NAME)
                          //   if (country !== undefined && country.drugs.length > 0) {
                          //     fill = getColorForDrug(country.drugs[0].name);
                          //   } else if (country !== undefined) {
                          //     fill = '#F5F4F6'
                          //   }
                          //   break;
                          // case 'Plasmid Incompatibility Type':
                          //   country = worldMapPlasmidIncompatibilityTypeData.find(s => s.displayName === geo.properties.NAME)
                          //   if (country !== undefined && country.incTypes.length > 0) {
                          //     fill = getColorForIncType(country.incTypes[0].type);
                          //   } else if (country !== undefined) {
                          //     fill = '#F5F4F6'
                          //   }
                          //   break;
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
                                // case 'AMR Profiles':
                                //   if (country !== undefined) {
                                //     setTooltipContent({
                                //       name: NAME,
                                //       amrProfilesInfo: country.amrProfiles
                                //     });
                                //   } else {
                                //     setTooltipContent({
                                //       name: NAME
                                //     })
                                //   }
                                //   break;
                                case 'Dominant Genotype':
                                  if (country !== undefined && country.total >= 20) {
                                    let temp = country.genotypes
                                    temp.sort((a, b) => a.count <= b.count ? 1 : -1)
                                    setTooltipContent({
                                      name: NAME,
                                      genotypeInfo: temp
                                    });
                                  } else if (country !== undefined && country.total < 20) {
                                    setTooltipContent({
                                      name: NAME,
                                      smallerThan20: true
                                    })
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                case 'H58 / Non-H58':
                                  if (country !== undefined && country.genotypes.length > 0) {
                                    const isBiggerThan20 = country.genotypes.find(g => g.type === "H58" && g.count >= 20) !== undefined
                                    if (isBiggerThan20) {
                                      setTooltipContent({
                                        name: NAME,
                                        simpleGenotypeInfo: country.genotypes
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
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
                                    if (country.count >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        mdrInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
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
                                    if (country.count >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        stadInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
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
                                    if (country.count >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        xdrInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                // case 'DCS':
                                //   if (country !== undefined && country.DCSs.length > 0) {
                                //     setTooltipContent({
                                //       name: NAME,
                                //       dcsInfo: {
                                //         count: country.count,
                                //         percentage: country.percentage,
                                //       }
                                //     });
                                //   } else {
                                //     setTooltipContent({
                                //       name: NAME
                                //     })
                                //   }
                                //   break;
                                case 'Azith':
                                  if (country !== undefined && country.AZs.length > 0) {
                                    if (country.count >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        azInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
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
                                    if (country.count >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        cipIInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
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
                                    if (country.count >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        cipRInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        }
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true
                                      })
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME
                                    })
                                  }
                                  break;
                                // case 'Resistance to Drug':
                                //   if (country !== undefined && country.drugs.length > 0) {
                                //     setTooltipContent({
                                //       name: NAME,
                                //       drugsInfo: country.drugs
                                //     });
                                //   } else {
                                //     setTooltipContent({
                                //       name: NAME
                                //     })
                                //   }
                                //   break;
                                // case 'Plasmid Incompatibility Type':
                                //   if (country !== undefined && country.incTypes.length > 0) {
                                //     setTooltipContent({
                                //       name: NAME,
                                //       incTypesInfo: country.incTypes
                                //     });
                                //   } else {
                                //     setTooltipContent({
                                //       name: NAME
                                //     })
                                //   }
                                //   break;
                                default:
                                  break;
                              }
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
              {(dimensions.width > desktop) && (
                <div className="map-upper-right-buttons">
                  {renderMapLegend()}
                </div>
              )}
              {(
                <div className="map-upper-left-buttons ">
                  <div className="map-filters" style={{ width: dimensions.width > desktop ? 200 : "-webkit-fill-available" }}>
                    <span style={{ fontWeight: 600, fontSize: 20, marginBottom: dimensions.width > desktop ? 20 : 10 }}>Filters</span>
                    <div style={{ marginBottom: dimensions.width > desktop ? 16 : 8 }}>
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
                        style={{ marginTop: dimensions.width > desktop ? '' : -5, marginBottom: dimensions.width > desktop ? '' : -5 }}
                        value={actualTimePeriodRange}
                        min={timePeriodRange[0]}
                        max={timePeriodRange[1]}
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
                      capturePicture('control-map', 0, {mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange})
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
            {!(dimensions.width > desktop) && (
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
                      <span>XDR: {tooltipContent.additionalInfo.XDR}%</span>
                      <span>DCS: {tooltipContent.additionalInfo.DCS}%</span>
                      <span>AzithR: {tooltipContent.additionalInfo.AzithR}%</span>
                      <span>CipI: {tooltipContent.additionalInfo.CipI}%</span>
                      <span>CipR: {tooltipContent.additionalInfo.CipR}%</span>
                      <span>Susceptible: {tooltipContent.additionalInfo.STAD}%</span>
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
                  {(!tooltipContent.incTypesInfo && !tooltipContent.amrProfilesInfo && !tooltipContent.drugsInfo && !tooltipContent.xdrInfo && !tooltipContent.mdrInfo && !tooltipContent.stadInfo && !tooltipContent.dcsInfo && !tooltipContent.azInfo && !tooltipContent.cipIInfo && !tooltipContent.cipRInfo && !tooltipContent.simpleGenotypeInfo && !tooltipContent.genotypeInfo && !tooltipContent.additionalInfo) && (
                    <div className="additional-info">
                      <span>{tooltipContent.smallerThan20 ? "Not known" : !allCountries.includes(tooltipContent.name) || dataset === 'full' ? 'No reported data' : dataset === 'local' ? 'No travel reported' : 'No travel information'}</span>
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
            <div style={{ display: "flex", flexDirection: dimensions.width > desktop ? "row" : "column", marginTop: 16, paddingBottom: 20 }}>
              <div style={{ alignItems: 'center', display: "flex", flexDirection: "column", flex: 0.5, paddingRight: dimensions.width < mobile ? 0 : 10 }}>
                <div style={{ height: 717, width: '100%', maxWidth: 920, display: "flex", flexDirection: "column" }}>
                  <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                    <span style={{ paddingRight: 32, marginRight: -22, paddingLeft: 35 }} className="chart-title">Resistance frequencies within genotypes</span>
                    <div style={{ display: "inline-block", position: "relative" }}>
                      <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                        <div
                          style={{ marginTop: "0", height: "33px", width: "33px" }}
                          className={`button ${captureControlChartRFWGInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartRFWGInProgress)
                            capturePicture('RFWG', 1, {mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, interval: brushRFWG})
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
                  <span className="chart-title" style={{ marginLeft: 45, marginBottom: -8, marginTop: dimensions.width > 1010 ? 5 : dimensions.width > desktop ? 10 : 10, fontSize: 10, fontWeight: 400 }}>Top Genotypes (up to 5)</span>
                  <div style={{ paddingTop: '0px', height: '74px', width: dimensions.width > desktop ? "60%" : "90%", alignSelf: "center", paddingBottom: -8 }}>
                    <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 5, marginTop: 23 }}>
                      <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Data view</InputLabel>
                      <Select
                        value={RFWGFilter}
                        onChange={evt => {
                          setRFWGFilter(evt.target.value)
                          setBrushRFWG([drugsAndGenotypesChartData[0].name, drugsAndGenotypesChartData[drugsAndGenotypesChartData.length - 2].name])
                        }}
                        fullWidth
                        style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                      >
                        <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                          Number of genomes
                        </MenuItem>
                        <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                          Percentage within genotype
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div id="RFWG" style={{ height: 687, display: "flex", flexDirection: "row", alignItems: "center" }}>
                    {/* <span className="y-axis-label-vertical" style={{ paddingRight: 8, marginBottom: 100 }}>{RFWGFilter === 1 ? 'Number of genomes' : 'Percentage within genotype (%)'}</span> */}
                    {plotDrugsAndGenotypesChart}
                  </div>
                  {/* {brushRFWG}<br/>
                  {brushDRT}<br/>
                  {brushRDWAG}<br/>
                  {brushGD} */}
                </div>
                <div style={{ width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", paddingTop: 50 }}>
                  <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                    <span className="chart-title" style={{ paddingLeft: 50, marginRight: -22, paddingRight: 32 }}>Resistance determinants within all genotypes</span>
                    <div style={{ display: "inline-block", position: "relative" }}>
                      <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                        <div
                          style={{ marginTop: "0", height: "33px", width: "33px" }}
                          className={`button ${captureControlChartRFWAGInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartRFWAGInProgress)
                            capturePicture('RFWAG', 4, {mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, amrClassFilter: amrClassFilter, interval: brushRDWAG})
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
                  <span className="chart-title" style={{ fontSize: 10, fontWeight: 400, paddingBottom: 10, marginTop: dimensions.width > 1120 ? 5 : dimensions.width < desktop ? 10 : 10, paddingLeft: 50 }}>Top Genotypes (up to 10)</span>
                  <div style={{ width: dimensions.width > desktop ? "60%" : "90%", alignSelf: "center", marginBottom: -4, marginRight: dimensions.width > desktop ? "-10%" : 0 }}>
                    <FormControl fullWidth className={classes.formControlSelect} style={{ marginTop: 0 }}>
                      <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Select Drug Class</InputLabel>
                      <Select
                        value={amrClassFilter}
                        onChange={evt => {
                          setAmrClassFilter(evt.target.value)
                        }}
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
                    <FormControl fullWidth className={classes.formControlSelect} style={{ marginTop: 0 }}>
                      <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Data view</InputLabel>
                      <Select
                        value={RDWAGDataviewFilter}
                        onChange={evt => {
                          setRDWAGDataviewFilter(evt.target.value)
                          setBrushRDWAG([amrClassChartData[0].genotype, amrClassChartData[amrClassChartData.length - 2].genotype])
                        }}
                        fullWidth
                        style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                      > 
                        <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                          Number of genomes
                        </MenuItem>
                        <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                          Percentage per year
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div id="RFWAG" style={{ height: 513, display: "flex", flexDirection: "row", alignItems: "center" }}>
                    {/* <span className="y-axis-label-vertical" style={{ paddingRight: 8, paddingTop: 190 }}>Number of occurrences</span> */}
                    {plotAmrClassChart}
                  </div>
                </div>
              </div>
              <div style={{ alignItems: 'center', display: "flex", flexDirection: "column", flex: 0.5, paddingLeft: dimensions.width < mobile ? 0 : 10, marginTop: dimensions.width < mobile ? 25 : 0 }}>
                <div style={{ width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", paddingTop: dimensions.width < desktop ? 50 : dimensions.width < 930 ? 0 : 0 }}>
                  <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center", paddingBottom: dimensions.width < desktop ? 0 : dimensions.width < 1010 ? 24 : 8 }}>
                    <span className="chart-title" style={{ paddingRight: 32, marginRight: -22 }}>Drug resistance trends</span>
                    <div style={{ display: "inline-block", position: "relative" }}>
                      <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                        <div
                          style={{ marginTop: "0", height: "33px", width: "33px" }}
                          className={`button ${captureControlChartDRTInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartDRTInProgress)
                            capturePicture('DRT', 2, {mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, interval: brushDRT})
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
                  <div id="DRT" style={{ paddingTop: dimensions.width < desktop ? '10px' : '76px', height: 600, display: "flex", flexDirection: "row", alignItems: "center" }}>
                    {/* <span className="y-axis-label-vertical" style={{ paddingTop: 80 }}>Resistant (%)</span> */}
                    {plotDrugTrendsChart}
                  </div>
                </div>
                <div style={{ width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", paddingTop: dimensions.width < desktop ? 50 : dimensions.width < 1010 ? 29 : 45 }}>
                  <div style={{ width: "100%", flexDirection: "row", textAlign: "center", display: "flex", justifyContent: "center" }}>
                    <span className="chart-title" style={{ marginRight: -22, paddingRight: 32 }}>Genotype distribution</span>
                    <div style={{ display: "inline-block", position: "relative" }}>
                      <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Download Chart as PNG</span>} placement="right">
                        <div
                          style={{ marginTop: "0", height: "33px", width: "33px" }}
                          className={`button ${captureControlChartGDInProgress && "disabled"}`}
                          onClick={() => {
                            if (!captureControlChartGDInProgress)
                            capturePicture('GD', 3, {mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, interval: brushGD})
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
                  <div style={{ paddingTop: dimensions.width < desktop ? '0px' : dimensions.width > 1120 ? '65px' : '86px', height: dimensions.width > 1120 ? '78px' : '74px', width: dimensions.width > desktop ? "60%" : "90%", alignSelf: "center", paddingBottom: -8 }}>
                    <FormControl fullWidth className={classes.formControlSelect} style={{ marginBottom: 5, marginTop: 23 }}>
                      <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Data view</InputLabel>
                      <Select
                        value={populationStructureFilter}
                        onChange={evt => {
                          setPopulationStructureFilter(evt.target.value)
                          setBrushGD([populationStructureChartData[0].name, populationStructureChartData[populationStructureChartData.length - 1].name])
                        }}
                        fullWidth
                        style={{ fontWeight: 600, fontFamily: "Montserrat" }}
                      >
                        <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                          Number of genomes
                        </MenuItem>
                        <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                          Percentage per year
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div id="GD" style={{ width: '100%', height: 511, display: "flex", flexDirection: /*populationStructureFilter === 1 ? "row" : "column-reverse"*/"row", alignItems: "center" }}>
                    {/* {getPopulationStructureChartLabel()} */}
                    {/* <span className="y-axis-label-vertical" style={{ paddingTop: 190 }}>{populationStructureFilter === 1 ? 'Number of genomes' : '% Genomes per year'}</span> */}
                    {plotPopulationStructureChart}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: dimensions.width > desktop ? "row" : "column", padding: 12, alignItems: "center", width: "-webkit-fill-available", justifyContent: "center" }}>
              <div className="download-sheet-button" onClick={() => dowloadBaseSpreadsheet()}>
                <FontAwesomeIcon icon={faTable} style={{ marginRight: 8 }} />
                <span>Download database</span>
              </div>
              <div style={{ marginTop: dimensions.width > desktop ? 0 : 20, marginLeft: dimensions.width > desktop ? 20 : 0}} className={`download-sheet-button`} onClick={() => {
                if (!captureReportInProgress) {
                  setCaptureReportInProgress(true);
                  capturePicture('', 5, {mapView: mapView, dataset: dataset, actualTimePeriodRange: actualTimePeriodRange, country: actualCountry, amrClassFilter: amrClassFilter, brush: [brushRFWG, brushRDWAG, brushDRT, brushGD]});
                }
              }}>
                <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: 8 }} />
                <span>Download report from current view</span>
                {captureReportInProgress && (<div style={{position: 'absolute', paddingBottom: 32, paddingRight: 20 }}>
                  <CustomCircularProgress
                    size={44}
                    thickness={4}
                    style={{ position: "absolute", top: -5, left: -6, color: "white" }} />
                </div>)}
              </div>
            </div>
          </div>
        </div>
        <div className="about-wrapper" style={{ paddingBottom: '15px' }}>
          <h2 style={{ marginBottom: 0 }}>About TyphiNET</h2>
          <p>
            The TyphiNET dashboard collates antimicrobial resistance (AMR) and genotype (lineage) information extracted from whole genome sequence (WGS) data from the bacterial pathogen <i>Salmonella</i> Typhi, the agent of typhoid fever. Data are sourced monthly from Typhoid <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">Pathogenwatch</a>. Information on genotype definitions and population structure can be found in <a href="https://www.nature.com/articles/ncomms12827" target="_blank" rel="noreferrer">Wong et al, 2016</a>, and details of AMR determinants in <a href="https://www.nature.com/articles/s41467-021-23091-2" target="_blank" rel="noreferrer">Argimon et al, 2021</a>. (CipI-R = decreased ciprofloxacin susceptibility).
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
          <span>Data obtained from: <a href="https://pathogen.watch" rel="noreferrer" target="_blank">pathogen watch project</a> on 15/06/2021. <a href="https://holtlab.net" rel="noreferrer" target="_blank">Holt Lab</a></span>
        </div>
        <div className="fab-button" style={{ marginTop: -80 }}>
          <TooltipMaterialUI title={<span style={{ fontFamily: "Montserrat" }}>Reset Configurations</span>} placement="left">
            <Fab
              color="primary"
              aria-label="add"
              size={dimensions.width < mobile ? 'medium' : ''}
              onClick={() => {
                setMapView('CipI');
                setDataset('full');
                setActualTimePeriodRange(timePeriodRange);
                setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
                setActualCountry('All');
                setPopulationStructureFilter(1);
                setAmrClassFilter(amrClassesForFilter[5]);
                setRDWAGDataviewFilter(1)
                setRFWGFilter(1)

              }}
            >
              <FontAwesomeIcon icon={faUndoAlt} size="lg" color="white" />
            </Fab>
          </TooltipMaterialUI>
        </div>
      </div>
      <div className="loading">
        {dimensions.width > desktop && (
          <img className="logoImageMenu-loading" src={typhinetLogoImg} alt="TyphiNET" style={{ paddingLeft: '20px' }} />
        )}
        <Loader
          style={{ paddingLeft: '10px' }}
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