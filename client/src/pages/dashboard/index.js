import "./index.css";
import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import Loader from "react-loader-spinner";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup,
} from "react-simple-maps";
import InputLabel from "@material-ui/core/InputLabel";
import { Tooltip as IconTooltip } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Fab from "@material-ui/core/Fab";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import TooltipMaterialUI from "@material-ui/core/Tooltip";
import Zoom from "@material-ui/core/Zoom";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ReactTooltip from "react-tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  Label,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  LineChart,
  Line,
  Legend,
} from "recharts";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faCrosshairs,
  faCamera,
  faTable,
  faFilePdf,
  faInfoCircle,
  faUndoAlt,
} from "@fortawesome/free-solid-svg-icons";
import download from "downloadjs";
import { svgAsPngUri } from "save-svg-as-png";
import typhinetLogoImg from "../../assets/img/logo-typhinet-prod.png";
import euFlagImg from "../../assets/img/eu_flag.jpg";
import geography from "../../assets/world-50m.json";
import { API_ENDPOINT } from "../../constants";
import {
  getColorForGenotype,
  getColorForDrug,
  getColorForTetracyclines,
} from "../../util/colorHelper";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Select as DropDownSelect } from "react-dropdown-select";
import "rodal/lib/rodal.css";
import domtoimage from "dom-to-image";
import { jsPDF } from "jspdf";
import {
  useStyles,
  CustomCircularProgress,
  CustomToggleButton,
  Buttons,
  ButtonClearSelect,
} from "./materialUI";
import moment from "moment";
import { filterForComponents } from "./filters";

const DashboardPage = () => {
  const classes = useStyles();

  const [controlMapPosition, setControlMapPosition] = useState({
    coordinates: [0, 0],
    zoom: 1,
  });

  const [worldMapSamplesData, setWorldMapSamplesData] = useState([]);
  const [worldMapComplementaryData, setWorldMapComplementaryData] = useState(
    {}
  );
  const [worldMapGenotypesData, setWorldMapGenotypesData] = useState([]);
  const [worldMapH58Data, setWorldMapH58Data] = useState([]);
  const [worldMapMDRData, setWorldMapMDRData] = useState([]);
  const [worldMapSTADData, setWorldMapSTADData] = useState([]);
  const [worldMapXDRData, setWorldMapXDRData] = useState([]);
  const [worldMapAZITHData, setWorldMapAZITHData] = useState([]);
  const [worldMapCIPIData, setWorldMapCIPIData] = useState([]);
  const [worldMapCIPRData, setWorldMapCIPRData] = useState([]);

  const [plotAmrClassChart, setPlotAmrClassChart] = useState(function () { });
  const [plotDrugsAndGenotypesChart, setPlotDrugsAndGenotypesChart] = useState(
    function () { }
  );
  const [plotPopulationStructureChart, setPlotPopulationStructureChart] =
    useState(function () { });
  const [plotDrugTrendsChart, setPlotDrugTrendsChart] = useState(
    function () { }
  );

  const [captureControlMapInProgress, setCaptureControlMapInProgress] =
    useState(false);
  const [
    captureControlChartRFWGInProgress,
    setCaptureControlChartRFWGInProgress,
  ] = useState(false);
  const [
    captureControlChartDRTInProgress,
    setCaptureControlChartDRTInProgress,
  ] = useState(false);
  const [captureControlChartGDInProgress, setCaptureControlChartGDInProgress] =
    useState(false);
  const [
    captureControlChartRFWAGInProgress,
    setCaptureControlChartRFWAGInProgress,
  ] = useState(false);
  const [captureReportInProgress, setCaptureReportInProgress] = useState(false);
  const [tooltipContent, setTooltipContent] = useState(null);

  const [timeInitial, setTimeInitial] = React.useState(0);
  const [timeFinal, setTimeFinal] = React.useState(0);
  const [actualTimeInitial, setActualTimeInitial] = React.useState(0);
  const [actualTimeFinal, setActualTimeFinal] = React.useState(0);
  const [years, setYears] = useState([0, 0]);

  const [countriesForFilter, setCountriesForFilter] = React.useState(["All"]);
  const [regionsForFilter, setRegionsForFilter] = React.useState(["All"]);
  const [actualCountry, setActualCountry] = useState("All");
  const [actualRegion, setActualRegion] = useState("All");

  // const [actualContinent, setActualContinent] = useState("All");
  // const [continentOptions] = useState(['All', 'Africa', 'Asia', 'Central America', 'Europe', 'North America', 'Oceania', 'South America'])

  const [populationStructureFilter, setPopulationStructureFilter] =
    React.useState(1);
  const [populationStructureFilterOptions] = useState([
    { value: "Number of genomes", id: 1 },
    { value: "Percentage per year", id: 2 },
  ]);
  const [RFWGFilterOptions] = useState([
    { value: "Number of genomes", id: 1 },
    { value: "Percentage within genotype", id: 2 },
  ]);
  const [amrClassFilterOptions] = useState([
    { value: "Number of genomes", id: 1 },
    { value: "Percentage per genotype", id: 2 },
  ]);
  const [amrClassFilterforFilterOptions] = useState([
    { value: "Ampicillin", id: 0 },
    { value: "Azithromycin", id: 1 },
    { value: "Chloramphenicol", id: 2 },
    { value: "Co-trimoxazole", id: 3 },
    { value: "ESBL", id: 4 },
    { value: "Fluoroquinolones (CipI/R)", id: 5 },
    { value: "Sulphonamides", id: 6 },
    { value: "Tetracyclines", id: 7 },
    { value: "Trimethoprim", id: 8 },
  ]);

  const [RFWGFilter, setRFWGFilter] = React.useState(2);
  const [amrClassesForFilter] = useState([
    "Ampicillin",
    "Azithromycin",
    "Chloramphenicol",
    "Co-trimoxazole",
    "ESBL",
    "Fluoroquinolones (CipI/R)",
    "Sulphonamides",
    "Tetracyclines",
    "Trimethoprim",
  ]);
  const [drtClassesForFilter] = useState([
    "Ampicillin",
    "Azithromycin",
    "Chloramphenicol",
    "Co-trimoxazole",
    "ESBL",
    "Fluoroquinolones (CipI/R)",
    "Susceptible",
    "Sulphonamides",
    "Tetracyclines",
    "Trimethoprim",
  ]);
  const [trendClassesForFilter] = useState([
    "Ampicillin",
    "Azithromycin",
    "Chloramphenicol",
    /*"Fluoroquinolone (CipI)",*/ "Fluoroquinolones (CipR)",
    "Co-trimoxazole",
    "ESBL",
    "Fluoroquinolones (CipI/R)",
    "Susceptible",
    "Sulphonamides",
    "Tetracyclines",
    "Trimethoprim",
  ]);
  const [trendDropdownOptions] = useState([
    { value: "Ampicillin", id: 0 },
    { value: "Azithromycin", id: 1 },
    { value: "Chloramphenicol", id: 2 },
    /*{value: "Fluoroquinolone (CipI)", id: 3},*/ {
      value: "Fluoroquinolones (CipR)",
      id: 3,
    },
    { value: "Co-trimoxazole", id: 4 },
    { value: "ESBL", id: 5 },
    { value: "Fluoroquinolones (CipI/R)", id: 6 },
    { value: "Susceptible", id: 7 },
    { value: "Sulphonamides", id: 8 },
    { value: "Tetracyclines", id: 9 },
    { value: "Trimethoprim", id: 10 },
  ]);
  const [RFWGDropdownOptions, setRFWGDropdownOptions] = useState([]);
  const [amrClassFilter, setAmrClassFilter] = React.useState(
    amrClassesForFilter[5]
  );
  const [RDWAGDataviewFilter, setRDWAGDataviewFilter] = React.useState(2);

  const [drugTrendsChartData, setDrugTrendsChartData] = useState([]);
  const [drugsAndGenotypesChartData, setDrugsAndGenotypesChartData] = useState(
    []
  );
  const [populationStructureChartData, setPopulationStructureChartData] =
    useState([]);
  const [amrClassChartData, setAmrClassChartData] = useState({});

  const [mapView, setMapView] = React.useState("CipI");
  const [dataset, setDataset] = React.useState("All");
  const [totalGenomes, setTotalGenomes] = useState(0);
  const [actualGenomes, setActualGenomes] = useState(0);
  const [totalGenotypes, setTotalGenotypes] = useState(0);
  const [actualGenotypes, setActualGenotypes] = useState(0);
  const [appLoading, setAppLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [countryPMID, setCountryPMID] = useState([]);

  const [trendValues, setTrendValues] = React.useState(trendDropdownOptions);
  const [RFWGValues, setRFWGValues] = React.useState([]);

  const [desktop] = useState(767);
  const [mobile] = useState(500);

  const [hoverColor] = useState("#D2F1F6");

  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  // Helper function for getting height and width of window
  function debounce(fn, ms) {
    let timer;
    return (_) => {
      clearTimeout(timer);
      timer = setTimeout((_) => {
        timer = null;
        fn.apply(this, arguments);
      }, ms);
    };
  }

  // Format selected date
  function formatDate(date) {
    return moment(date).format("ddd MMM DD YYYY HH:mm:ss");
  }

  // Watcher for window resize
  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }, 1000);

    window.addEventListener("resize", debouncedHandleResize);

    return (_) => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  });

  const [genotypes] = useState(
    [
      "0",
      "0.0.1",
      "0.0.2",
      "0.0.3",
      "0.1",
      "0.1.1",
      "0.1.2",
      "0.1.3",
      "1.1",
      "1.1.1",
      "1.1.2",
      "1.1.3",
      "1.1.4",
      "1.2",
      "1.2.1",
      "2",
      "2.0.1",
      "2.0.2",
      "2.1",
      "2.1.1",
      "2.1.2",
      "2.1.3",
      "2.1.4",
      "2.1.5",
      "2.1.6",
      "2.1.7",
      "2.1.8",
      "2.1.9",
      "2.1.7.1",
      "2.1.7.2",
      "2.2",
      "2.2.1",
      "2.2.2",
      "2.2.3",
      "2.2.4",
      "2.3",
      "2.3.1",
      "2.3.2",
      "2.3.3",
      "2.3.4",
      "2.3.5",
      "2.4",
      "2.4.1",
      "2.5",
      "2.5.1",
      "2.5.2",
      "3",
      "3.0.1",
      "3.0.2",
      "3.1",
      "3.1.1",
      "3.1.2",
      "3.2",
      "3.2.1",
      "3.2.2",
      "3.3",
      "3.3.1",
      "3.3.2",
      "3.3.2.Bd1",
      "3.3.2.Bd2",
      "3.4",
      "3.5",
      "3.5.1",
      "3.5.2",
      "3.5.3",
      "3.5.4",
      "3.5.4.1",
      "3.5.4.2",
      "3.5.4.3",
      "4",
      "4.1",
      "4.1.1",
      "4.2",
      "4.2.1",
      "4.2.2",
      "4.2.3",
      /*'4.3', '4.3.0', */ "4.3.1",
      "4.3.1.1",
      "4.3.1.1.P1",
      "4.3.1.1.EA1",
      "4.3.1.2",
      "4.3.1.2.EA2",
      "4.3.1.2.EA3",
      "4.3.1.2.1",
      "4.3.1.2.1.1",
      "4.3.1.3",
      "4.3.1.3.Bdq",
    ].sort((a, b) => a.localeCompare(b))
  );

  // Get date from the las update on the table from admin page
  useEffect(() => {
    axios.get(`${API_ENDPOINT}mongo/lastUpdated`).then((res) => {
      setLastUpdated(new Date(res.data));
    });
  }, []);

  // Colors for the No. Samples label
  const mapSamplesColorScale = (domain) => {
    if (domain >= 1 && domain <= 9) {
      return "#4575b4";
    } else if (domain >= 10 && domain <= 19) {
      return "#91bfdb";
    } else if (domain >= 20 && domain <= 99) {
      return "#addd8e";
    } else if (domain >= 100 && domain <= 299) {
      return "#fee090";
    } else if (domain >= 300) {
      return "#fc8d59";
    }
  };

  const mapRedColorScale = (percentage) => {
    const p = parseInt(percentage);
    if (p >= 51) {
      return "#A20F17";
    } else if (p >= 11) {
      return "#DD2C24";
    } else if (p >= 3) {
      return "#FA694A";
    } else {
      return "#FAAD8F";
    }
  };

  const mapRedColorScaleForSensitive = (percentage) => {
    const p = parseFloat(percentage);
    if (p > 90) {
      return "#727272";
    } else if (p > 50) {
      return "#FAAD8F";
    } else if (p > 20) {
      return "#FA694A";
    } else if (p > 10) {
      return "#DD2C24";
    }
    return "#A20F17";
  };

  // Tooltip for all graphs but the Resistance determinants within genotypes
  const tooltip = React.useCallback(
    (positionY, width1, width2, sort, wrapperS, stroke, chart = -1) => {
      return (
        <Tooltip
          position={{
            y:
              dimensions.width < mobile
                ? positionY[0]
                : dimensions.width < desktop
                  ? positionY[1]
                  : positionY[2],
            x: dimensions.width < mobile ? -10 : 0,
          }}
          wrapperStyle={wrapperS}
          cursor={{ fill: hoverColor }}
          content={({ active, payload, label }) => {
            if (payload !== null) {
              if (payload[0]?.payload.name === "") {
                return null;
              }

              if (sort) {
                payload.sort((a, b) => b.value - a.value);
                payload = payload.reverse();
              }
              if (active) {
                return (
                  <div className="my-tooltip">
                    <div className="my-tooltip-title">
                      <span className="my-tooltip-title-label">{label}</span>
                      {chart === 0 && (
                        <span className="my-tooltip-title-total">
                          {"N = " + payload[0].payload.totalS}
                        </span>
                      )}
                      {chart === 4 && (
                        <span className="my-tooltip-title-total">
                          {"N = " + payload[0].payload.quantities.totalS}
                        </span>
                      )}
                      {chart === 1 && (
                        <span className="my-tooltip-title-total">
                          {"N = " + payload[0].payload.total}
                        </span>
                      )}
                      {chart === 2 && (
                        <span className="my-tooltip-title-total">
                          {"N = " + payload[0].payload.total}
                        </span>
                      )}
                      {chart === 3 && (
                        <span className="my-tooltip-title-total">
                          {"N = " + payload[0].payload.total}
                        </span>
                      )}
                    </div>
                    <div
                      className="my-tooltip-content"
                      style={{ width: width1 }}
                    >
                      {payload.reverse().map((item, index) => {
                        let percentage =
                          (item.value / item.payload.total) * 100;
                        if (chart === 1) {
                          percentage =
                            (item.payload.drugsPercentage[item.dataKey] /
                              item.payload.total) *
                            100;
                        }
                        if (chart === 0) {
                          percentage = (item.value / item.payload.totalS) * 100;
                        }
                        percentage = Math.round(percentage * 100) / 100;
                        if (
                          (populationStructureFilter === 2 && chart === 3) ||
                          (RFWGFilter === 2 && chart === 4)
                        ) {
                          percentage = Math.round(item.value * 100) / 100;
                        }
                        if (
                          chart === 1 &&
                          item.payload.drugsPercentage[item.dataKey] === 0
                        ) {
                          return null;
                        }
                        return (
                          <div
                            key={index + item}
                            className="my-tooltip-content-individual"
                            style={{ width: width2 }}
                          >
                            <div
                              className="my-tooltip-content-square"
                              style={{
                                backgroundColor: stroke
                                  ? item.stroke
                                  : item.fill,
                              }}
                            />
                            <div className="my-tooltip-content-info">
                              <span
                                className="my-tooltip-content-name"
                                style={{
                                  width:
                                    dimensions.width < mobile ? "80%" : "100%",
                                }}
                              >
                                {item.name}
                              </span>
                              <span className="my-tooltip-content-count">
                                N ={" "}
                                {(populationStructureFilter === 2 &&
                                  chart === 3) ||
                                  (RFWGFilter === 2 && chart === 4)
                                  ? item.payload.quantities[item.name]
                                  : chart === 1
                                    ? item.payload.drugsPercentage[item.dataKey]
                                    : item.value}
                              </span>
                              <span className="my-tooltip-content-percent">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            }
            return null;
          }}
        />
      );
    },
    [
      desktop,
      dimensions,
      mobile,
      populationStructureFilter,
      RFWGFilter,
      hoverColor,
    ]
  );

  // Genotype Distribution graph
  useEffect(() => {
    const plotPopulationStructureChart = () => {
      if (populationStructureFilter === 1) {
        /* QUANTITY */
        let maxH = 0;
        for (
          let index = 0;
          index < populationStructureChartData.length;
          index++
        ) {
          if (populationStructureChartData[index].total > maxH) {
            maxH = populationStructureChartData[index].total;
          }
        }
        maxH = Math.ceil(maxH / 50) * 50;
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={350}
              data={populationStructureChartData}
              margin={{
                top: 20,
                bottom: 5,
                right: 0,
              }}
              maxBarSize={62}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                padding={{ left: 5, right: 5 }}
                dataKey="name"
                interval="preserveStartEnd"
                tick={{ fontSize: 14 }}
              />
              <YAxis
                domain={[0, maxH]}
                allowDataOverflow={true}
                allowDecimals={false}
                width={70}
              >
                <Label
                  angle={-90}
                  position="insideLeft"
                  className="PSC-label"
                  offset={6}
                >
                  Number of genomes
                </Label>
              </YAxis>
              {populationStructureChartData.length > 0 && (
                <Brush
                  dataKey="name"
                  height={20}
                  stroke={"rgb(31, 187, 211)"}
                />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="PSC-legend">
                      <div className="PSC-legend-div">
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <div
                              key={index + "PSC_2"}
                              className="PSC-legend-info"
                            >
                              <div
                                className="PSC-legend-info-circle"
                                style={{ backgroundColor: color }}
                              />
                              <span className="PSC-legend-info-name">
                                {dataKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {tooltip(
                [290, 290, 260],
                dimensions.width < 620 ? 250 : 530,
                dimensions.width > 620 ? "20%" : "50%",
                false,
                { zIndex: 100, top: 20, right: -20 },
                false,
                2
              )}
              {genotypes.map((item, i) => (
                <Bar
                  key={i + "PSC_Q"}
                  dataKey={item}
                  stackId={0}
                  fill={getColorForGenotype(item)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      } else {
        /* PERCENTAGE */
        let maxH = 100;

        let teste = JSON.parse(JSON.stringify(populationStructureChartData));
        teste.forEach((element) => {
          element["quantities"] = {};
          const keys = Object.keys(element);
          for (const key in keys) {
            if (
              keys[key] !== "name" &&
              keys[key] !== "total" &&
              keys[key] !== "quantities"
            ) {
              let aux = keys[key];
              element.quantities[aux] = element[aux];
              element[aux] = (element[aux] * 100) / element.total;
            }
          }
        });

        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={350}
              data={teste}
              margin={{
                top: 20,
                bottom: 5,
                right: 0,
              }}
              maxBarSize={62}
              barCategoryGap={"10%"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                padding={{ left: 5, right: 5 }}
                dataKey="name"
                interval="preserveStartEnd"
                tick={{ fontSize: 14 }}
              />
              <YAxis
                domain={[0, maxH]}
                allowDataOverflow={true}
                allowDecimals={false}
                width={70}
              >
                <Label
                  angle={-90}
                  position="insideLeft"
                  className="PSC-label"
                  offset={6}
                >
                  % Genomes per year
                </Label>
              </YAxis>
              {teste.length > 0 && (
                <Brush
                  dataKey="name"
                  height={20}
                  stroke={"rgb(31, 187, 211)"}
                />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="PSC-legend">
                      <div className="PSC-legend-div">
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <div
                              key={index + "PSC"}
                              className="PSC-legend-info"
                            >
                              <div
                                className="PSC-legend-info-circle"
                                style={{ backgroundColor: color }}
                              />
                              <span className="PSC-legend-info-name">
                                {dataKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {tooltip(
                [290, 290, 260],
                dimensions.width < 620 ? 250 : 530,
                dimensions.width > 620 ? "20%" : "50%",
                false,
                { zIndex: 100, top: 20, right: -20 },
                false,
                3
              )}
              {genotypes.map((item, i) => (
                <Bar
                  key={i + "PSC_P"}
                  dataKey={item}
                  stackId="a"
                  fill={getColorForGenotype(item)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }
    };
    setPlotPopulationStructureChart(plotPopulationStructureChart);
  }, [
    dimensions.width,
    genotypes,
    populationStructureChartData,
    populationStructureFilter,
    tooltip,
  ]);

  // Resistance determinants within genotypes graph and tooltip
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
                    <div className="my-tooltip-title">
                      <span className="my-tooltip-title-label">{label}</span>
                      <span className="my-tooltip-title-total">
                        {"N = " + payload[0].payload.total2}
                      </span>
                    </div>
                    <div className="my-tooltip-content amr-tooltip-content">
                      {payload.reverse().map((item, index) => {
                        let percentage;
                        if (RDWAGDataviewFilter === 1) {
                          percentage = (item.value / item.payload.total2) * 100;
                        } else {
                          percentage = item.value;
                        }
                        percentage = Math.round(percentage * 100) / 100;
                        return (
                          <div
                            key={index + "tooltip"}
                            className="amr-tooltip-content-individual"
                          >
                            <div
                              className="my-tooltip-content-square"
                              style={{ backgroundColor: item.fill }}
                            />
                            <div className="amr-tooltip-content-info">
                              <span className="amr-tooltip-content-name">
                                {item.name}
                              </span>
                              <span className="my-tooltip-content-count">
                                N ={" "}
                                {RDWAGDataviewFilter === 2
                                  ? item.payload.percentage[item.name]
                                  : item.value}
                              </span>
                              <span className="my-tooltip-content-percent">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            }

            return null;
          }}
        />
      );
    };

    const armClassFilterComponent = (info) => {
      let maxSum = 0;
      const amr = amrClassChartData[amrClassFilter];
      if (amr && amr[amr.length - 1] !== undefined) {
        maxSum = amr[amr.length - 1].maxSum;
      }

      let dataAMR = amr?.slice(0, amr.length - 1);
      if (dataAMR === undefined) dataAMR = [];

      if (RDWAGDataviewFilter === 1) {
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={300}
              data={dataAMR}
              margin={{
                top: 20,
                left: 0,
                bottom: 5,
                right: 0,
              }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                padding={{ left: 5, right: 5 }}
                dataKey="genotype"
                type={"category"}
                interval={dimensions.width < 1700 ? 1 : 0}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                domain={[0, maxSum]}
                type={"number"}
                allowDecimals={false}
                width={70}
              >
                <Label
                  angle={-90}
                  position="insideLeft"
                  className="RDWAG-label"
                  offset={6}
                >
                  Number of occurrences
                </Label>
              </YAxis>
              {dataAMR.length > 0 && (
                <Brush
                  dataKey="genotype"
                  height={20}
                  stroke={"rgb(31, 187, 211)"}
                />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RDWAG-legend">
                      <div
                        className="RDWAG-legend-div"
                        style={{
                          justifyContent:
                            amrClassFilter === "Ampicillin" ||
                              amrClassFilter === "Fluoroquinolones (CipI/R)"
                              ? ""
                              : "space-between",
                        }}
                      >
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <div
                              key={index + "RDWAG-legend"}
                              className="RDWAG-legend-info"
                            >
                              <div
                                className="RDWAG-legend-info-circle"
                                style={{ backgroundColor: color }}
                              />
                              <span className="RDWAG-legend-info-name">
                                {dataKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {amrClassChartTooltip()}
              {info.bars.map((item, i) => {
                return (
                  <Bar
                    key={i + "RDWAG_Q"}
                    dataKey={item[0]}
                    fill={item[1]}
                    stackId="a"
                    barSize={30}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );
      } else if (RDWAGDataviewFilter === 2) {
        let temp = JSON.parse(JSON.stringify(dataAMR));

        temp.forEach((element) => {
          element.percentage = {};
          for (const key in element) {
            if (
              !["genotype", "total", "total2", "percentage"].includes(key) &&
              !key.includes("error")
            ) {
              const aux = (element[key] * 100) / element.total2;
              element.percentage[key] = element[key];
              element[key] = aux;
            }
          }
        });

        return (
          <ResponsiveContainer width="90%">
            <BarChart
              height={300}
              data={temp}
              margin={{
                top: 20,
                left: 0,
                bottom: 5,
                right: 0,
              }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                padding={{ left: 5, right: 5 }}
                dataKey="genotype"
                type={"category"}
                interval={dimensions.width < 1700 ? 1 : 0}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                domain={[0, 100]}
                type={"number"}
                allowDecimals={false}
                width={70}
                allowDataOverflow={true}
              >
                <Label
                  angle={-90}
                  position="insideLeft"
                  className="RDWAG-label"
                  offset={6}
                >
                  % Genomes
                </Label>
              </YAxis>
              {temp.length > 0 && (
                <Brush
                  dataKey="genotype"
                  height={20}
                  stroke={"rgb(31, 187, 211)"}
                />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RDWAG-legend">
                      <div
                        className="RDWAG-legend-div"
                        style={{
                          justifyContent:
                            amrClassFilter === "Ampicillin" ||
                              amrClassFilter === "Fluoroquinolones (CipI/R)"
                              ? ""
                              : "space-between",
                        }}
                      >
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <div
                              key={index + "RDWAG-legend-2"}
                              className="RDWAG-legend-info"
                            >
                              <div
                                className="RDWAG-legend-info-circle"
                                style={{ backgroundColor: color }}
                              />
                              <span className="RDWAG-legend-info-name">
                                {dataKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {amrClassChartTooltip()}
              {info.bars.map((item, i) => {
                return (
                  <Bar
                    key={i + "RDWAG_P"}
                    dataKey={item[0]}
                    fill={item[1]}
                    stackId="a"
                    barSize={30}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );
      }
    };

    const plotAmrClassChart = () => {
      switch (amrClassFilter) {
        case "Azithromycin":
          return armClassFilterComponent({
            left: -5,
            fontsize: 14,
            strokeWidth: 1,
            width: null,
            bars: [
              ["ereA", "#9e9ac8"],
              ["acrB_R717Q", "#addd8e"],
              ["acrB_R717L", "#FBCFE5"],
              ["ereA + acrB_R717Q", "#FFEC78"],
              ["ereA + acrB_R717L", "#66c2a4"],
              ["acrB_R717Q + acrB_R717L", "#fd8d3c"],
              ["ereA + acrB_R717Q + acrB_R717L", "#6baed6"],
              ["None", "#B9B9B9"],
            ],
          });
        case "Fluoroquinolones (CipI/R)":
          return armClassFilterComponent({
            left: 10,
            fontsize: 14,
            strokeWidth: 0.5,
            width: 3,
            bars: [
              ["3_QRDR + qnrS (CipR)", "black"],
              ["3_QRDR + qnrB (CipR)", "#660000"],
              ["3_QRDR (CipR)", "#cc0000"],
              ["2_QRDR + qnrS (CipR)", "#ff6666"],
              ["2_QRDR + qnrB (CipR)", "#ffcccc"],
              ["2_QRDR (CipI)", "#ff6600"],
              ["1_QRDR + qnrS (CipR)", "#660066"],
              ["1_QRDR + qnrB (CipR)", "#993399"],
              ["1_QRDR (CipI)", "#ffcc00"],
              ["0_QRDR + qnrS (CipI)", "#009999"],
              ["0_QRDR + qnrB (CipI)", "#0066cc"],
              ["None (CipS)", "#B9B9B9"],
            ],
          });
        case "Chloramphenicol":
          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 1,
            width: null,
            bars: [
              ["cmlA", "#addd8e"],
              ["catA1", "#9e9ac8"],
              ["catA1 + cmlA", "#FFEC78"],
              ["None", "#B9B9B9"],
            ],
          });
        case "Ampicillin":
          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 1,
            width: null,
            bars: [
              ["blaTEM-1D", "#addd8e"],
              ["None", "#B9B9B9"],
            ],
          });
        case "Sulphonamides":
          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 1,
            width: null,
            bars: [
              ["sul2", "#ffeda0"],
              ["sul1", "#fd8d3c"],
              ["sul1 + sul2", "#B4DD70"],
              ["None", "#B9B9B9"],
            ],
          });
        case "Trimethoprim":
          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 0.5,
            width: 3,
            bars: [
              ["dfrA1", "#B4DD70"],
              ["dfrA5", "#D7AEF7"],
              ["dfrA7", "#FFEC78"],
              ["dfrA14", "#6baed6"],
              ["dfrA7 + dfrA14", "#fd8d3c"],
              ["dfrA15", "#FBCFE5"],
              ["dfrA17", "#FCB469"],
              ["dfrA18", "#66c2a4"],
              ["None", "#B9B9B9"],
            ],
          });
        case "Co-trimoxazole":
          let cotrim = [
            "dfrA1",
            "dfrA5",
            "dfrA7",
            "dfrA14",
            "dfrA15",
            "dfrA17",
            "dfrA18",
          ];
          let colors1 = [
            "#ffeda0",
            "#fd8d3c",
            "#addd8e",
            "#9e9ac8",
            "#6baed6",
            "#7a0177",
            "#54278f",
          ];
          let colors2 = [
            "#a50f15",
            "#6a5acd",
            "#f1b6da",
            "#fb8072",
            "#4682b4",
            "#2e8b57",
            "#98fb98",
          ];
          let colors3 = [
            "#fcc5c0",
            "#bcbddc",
            "#fdd0a2",
            "#c994c7",
            "#9ecae1",
            "#a8ddb5",
            "#fc9272",
          ];
          let bars = [["None", "#B9B9B9"]];

          for (const index in cotrim) {
            bars.push([cotrim[index] + " + sul1", colors1[index]]);
            bars.push([cotrim[index] + " + sul2", colors2[index]]);
            bars.push([cotrim[index] + " + sul1 + sul2", colors3[index]]);
          }
          bars.push(["dfrA7 + dfrA14 + sul1 + sul2", "#F54CEB"]);

          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 0.5,
            width: 3,
            bars: bars,
          });
        case "Tetracyclines":
          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 1,
            width: null,
            bars: [
              ["tetA(D)", getColorForTetracyclines("tetA(D)")],
              ["tetA(C)", getColorForTetracyclines("tetA(C)")],
              ["tetA(B)", getColorForTetracyclines("tetA(B)")],
              ["tetA(A)", getColorForTetracyclines("tetA(A)")],
              ["None", "#B9B9B9"],
            ],
          });
        case "ESBL":
          return armClassFilterComponent({
            left: 3,
            fontsize: 14,
            strokeWidth: 1,
            width: null,
            bars: [
              ["blaSHV-12", "#addd8e"],
              ["blaOXA-7", "#9e9ac8"],
              ["blaCTX-M-15", "#6baed6"],
              ["blaCTX-M-55", "#FBCFE5"],
              ["None", "#B9B9B9"],
            ],
          });
        default:
          return null;
      }
    };
    setPlotAmrClassChart(plotAmrClassChart);
  }, [
    RDWAGDataviewFilter,
    amrClassChartData,
    amrClassFilter,
    dimensions.width,
    hoverColor,
  ]);

  // Drug Resistance Trends graph
  useEffect(() => {
    const plotDrugTrendsChart = () => {
      let dataDRT = drugTrendsChartData;
      for (const index in dataDRT) {
        for (const i in trendClassesForFilter) {
          const TCFF = trendClassesForFilter[i];
          if (!(TCFF.toString() in dataDRT[index])) {
            dataDRT[index][TCFF] = 0;
            dataDRT[index].drugsPercentage[TCFF] = 0;
          }
        }
      }

      return (
        <ResponsiveContainer width="90%">
          <LineChart
            data={dataDRT}
            margin={{
              top: 20,
              bottom: 5,
              right: 0,
              left: -5,
            }}
            height={582}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              tickCount={20}
              allowDecimals={false}
              type="number"
              padding={{ left: 20, right: 20 }}
              dataKey="name"
              domain={["dataMin", "dataMax"]}
              interval={"preserveStartEnd"}
              tick={{ fontSize: 14 }}
            />
            <YAxis
              tickCount={6}
              padding={{ top: 20, bottom: 20 }}
              allowDecimals={false}
              width={70}
            >
              <Label
                angle={-90}
                position="insideLeft"
                className="DRT-label"
                offset={12}
              >
                Resistant (%)
              </Label>
            </YAxis>
            {drugTrendsChartData.length > 0 && (
              <Brush dataKey="name" height={20} stroke={"rgb(31, 187, 211)"} />
            )}

            <Legend
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="DRT-legend">
                    <div
                      className="DRT-legend-div"
                      style={{
                        justifyContent:
                          dimensions.width < 1585 ? "space-between" : "",
                      }}
                    >
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry;
                        return (
                          <div
                            key={index + "DRT-legend"}
                            className="DRT-legend-info"
                          >
                            <div
                              className="DRT-legend-info-circle"
                              style={{ backgroundColor: color }}
                            />
                            <span className="DRT-legend-info-name">
                              {dataKey}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />
            {tooltip(
              [160, 275, 255],
              dimensions.width < mobile ? 250 : 325,
              "50%",
              true,
              { zIndex: 100, top: 175, right: 0 },
              true,
              1
            )}
            {trendClassesForFilter.map((item, i) => (
              <Line
                key={i + "DRTLine"}
                dataKey={item}
                strokeWidth={2}
                stroke={getColorForDrug(item)}
                connectNulls
                type="monotone"
                activeDot={timeInitial === timeFinal ? true : false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    };

    setPlotDrugTrendsChart(plotDrugTrendsChart);
  }, [
    dimensions.width,
    drugTrendsChartData,
    mobile,
    timeFinal,
    timeInitial,
    tooltip,
    trendClassesForFilter,
  ]);

  // Resistance frequencies within genotypes graph
  useEffect(() => {
    const plotDrugsAndGenotypesChart = () => {
      let aux = JSON.parse(JSON.stringify(drugsAndGenotypesChartData));

      const aux2 = [];
      for (let index = 0; index < aux.length; index++) {
        const percentage = (aux[index].total / aux[index].totalS) * 100;
        aux2.push({
          value: aux[index].name,
          label:
            aux[index].name +
            ` (total N=${aux[index].totalS}, ${Math.round(percentage * 100) / 100
            }% resistant)`,
          id: index,
        });
      }
      setRFWGDropdownOptions(aux2);

      const values = RFWGValues.map((x) => x.value);
      aux = aux.filter((x) => values.includes(x.name));

      if (RFWGFilter === 1) {
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              data={aux}
              margin={{
                top: 20,
                left: -5,
                bottom: 5,
                right: 0,
              }}
              height={582}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                padding={{ left: 5, right: 5 }}
                dataKey="name"
                interval={dimensions.width < mobile ? 1 : 0}
                tick={{ fontSize: 14 }}
              />
              <YAxis allowDecimals={false} width={71}>
                <Label
                  angle={-90}
                  position="insideLeft"
                  className="RFWG-label"
                  offset={12}
                >
                  Number of genomes
                </Label>
              </YAxis>
              {drugsAndGenotypesChartData.length > 0 && (
                <Brush
                  dataKey="name"
                  height={20}
                  stroke={"rgb(31, 187, 211)"}
                />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RFWG-legend">
                      <div
                        className="RFWG-legend-div"
                        style={{
                          justifyContent:
                            dimensions.width < 1585 ? "space-between" : "",
                        }}
                      >
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <div
                              key={index + "RFWG-legend"}
                              className="RFWG-legend-info"
                            >
                              <div
                                className="RFWG-legend-info-circle"
                                style={{ backgroundColor: color }}
                              />
                              <span className="RFWG-legend-info-name">
                                {dataKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {tooltip(
                [155, 270, 270],
                dimensions.width < mobile ? 250 : 325,
                "50%",
                false,
                { zIndex: 100, top: 160 },
                false,
                0
              )}
              {drtClassesForFilter.map((item, i) => (
                <Bar
                  key={i + "DRT_Q"}
                  dataKey={item}
                  fill={getColorForDrug(item)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      } else {
        const teste = JSON.parse(JSON.stringify(aux));
        teste.forEach((element) => {
          element["quantities"] = {};
          const keys = Object.keys(element);
          for (const key in keys) {
            if (
              !["name", "total", "quantities", "totalS"].includes(keys[key])
            ) {
              let aux3 = keys[key];
              element.quantities[aux3] = element[aux3];
              element[aux3] = (element[aux3] * 100) / element.totalS;
            }
            element.quantities["totalS"] = element.totalS;
          }
        });

        return (
          <ResponsiveContainer width="90%" height="100%">
            <BarChart
              data={teste}
              margin={{
                top: 20,
                left: -5,
                bottom: 5,
                right: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                padding={{ left: 5, right: 5 }}
                dataKey="name"
                interval={dimensions.width < mobile ? 1 : 0}
                tick={{ fontSize: 14 }}
              />
              <YAxis domain={[0, 100]} allowDecimals={false} width={70}>
                <Label
                  angle={-90}
                  position="insideLeft"
                  className="RFWG-label"
                  offset={12}
                >
                  Percentage within genotype (%)
                </Label>
              </YAxis>
              {teste.length > 0 && (
                <Brush
                  dataKey="name"
                  height={20}
                  stroke={"rgb(31, 187, 211)"}
                />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="RFWG-legend">
                      <div
                        className="RFWG-legend-div"
                        style={{
                          justifyContent:
                            dimensions.width < 1585 ? "space-between" : "",
                        }}
                      >
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <div
                              key={index + "RFWG-legend-2"}
                              className="RFWG-legend-info"
                            >
                              <div
                                className="RFWG-legend-info-circle"
                                style={{ backgroundColor: color }}
                              />
                              <span className="RFWG-legend-info-name">
                                {dataKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {tooltip(
                [155, 270, 270],
                dimensions.width < mobile ? 250 : 325,
                "50%",
                false,
                { zIndex: 100, top: 160 },
                false,
                4
              )}
              {drtClassesForFilter.map((item, i) => (
                <Bar
                  key={i + "DRT_P"}
                  dataKey={item}
                  fill={getColorForDrug(item)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }
    };
    setPlotDrugsAndGenotypesChart(plotDrugsAndGenotypesChart);
  }, [
    RFWGFilter,
    RFWGValues,
    dimensions.width,
    drtClassesForFilter,
    drugsAndGenotypesChartData,
    mobile,
    tooltip,
  ]);

  // Helper for loading images to the report
  function imgOnLoadPromise(obj) {
    return new Promise((resolve, reject) => {
      obj.onload = () => resolve(obj);
      obj.onerror = reject;
    });
  }

  // Stop loadings
  const [stopLoading] = useState(() => (index) => {
    switch (index) {
      case 0:
        setCaptureControlMapInProgress(false);
        break;
      case 1:
        setCaptureControlChartRFWGInProgress(false);
        break;
      case 2:
        setCaptureControlChartDRTInProgress(false);
        break;
      case 3:
        setCaptureControlChartGDInProgress(false);
        break;
      case 4:
        setCaptureControlChartRFWAGInProgress(false);
        break;
      default:
        break;
    }
  });

  // Start loadings
  const [capturePicture] = useState(() => async (id, index, info = {}) => {
    switch (index) {
      case 0:
        setCaptureControlMapInProgress(true);
        setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
        break;
      case 1:
        setCaptureControlChartRFWGInProgress(true);
        break;
      case 2:
        setCaptureControlChartDRTInProgress(true);
        break;
      case 3:
        setCaptureControlChartGDInProgress(true);
        break;
      case 4:
        setCaptureControlChartRFWAGInProgress(true);
        break;
      default:
        break;
    }

    const names = [
      "Resistance frequencies within genotypes",
      "Drug resistance trends",
      "Genotype distribution",
      "Resistance determinants within genotypes",
    ];
    const brokenNames = [
      ["Resistance frequencies", "within genotypes"],
      ["Resistance determinants", "within all genotypes"],
    ];

    if (index === 5) {
      let ids = ["RFWG", "RFWAG", "DRT", "GD"];

      var doc = new jsPDF({ unit: "mm", format: "a4", orientation: "l" });

      const IPW = doc.internal.pageSize.getWidth() / 2;

      let typhinetLogo = new Image();
      typhinetLogo.src = typhinetLogoImg;
      doc.addImage(typhinetLogo, "PNG", 110, 8, 80, 26);

      let euFlag = new Image();
      euFlag.src = euFlagImg;
      doc.addImage(euFlag, "JPG", 237, 148.2, 6, 4);

      let date = new Date();
      date = moment(date).format("ddd MMM DD YYYY HH:mm:ss");

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      const paragraph1 = `This report was generated at [${formatDate(
        new Date()
      )}] using TyphiNET (http://typhi.net), a data data visualisation platform that draws genome-derived data on antimicrobial resistance and genotypes from Typhi Pathogenwatch (http://pathogen.watch).`;
      const paragraph2 = `TyphiNET data were last updated on October 02 2023. For code and further details please see: https://github.com/zadyson/TyphiNET.`;
      const paragraph3 = `The genotypes reported here are defined in Dyson & Holt (2021), J. Infect. Dis.`;
      const paragraph4 = `Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper, Argimón et al. 2021, Nat. Commun.`;
      const paragraph5 = `Travel-associated cases are attributed to the country of travel, not the country of isolation (see Ingle et al. 2019, PLoS NTDs).`;
      const paragraph6 = `TyphiNET presents data aggregated from >100 studies. Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the TyphiNET website (http://typhi.net).`;
      const paragraph7 = `Studies contributing genomes representing infections originating from ${info.country
        } have the following PubMed IDs (PMIDs): ${info.PMID.join(", ")}.`;
      const paragraph8 = `This project has received funding from the the Wellcome Trust (Open Research Fund, 219692/Z/19/Z) and the  European Union's Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681.`;
      doc.setFont(undefined, "bold");
      doc.text(`TyphiNET report [${formatDate(new Date())}]`, 20, 50, {
        align: "justify",
        maxWidth: 255,
      });
      doc.setFont(undefined, "normal");
      doc.text(paragraph1, 20, 65, { align: "justify", maxWidth: 255 });
      doc.text(paragraph2, 20, 82, { align: "justify", maxWidth: 255 });
      doc.text(paragraph3, 20, 99, { align: "justify", maxWidth: 255 });
      doc.text(paragraph4, 20, 106, { align: "justify", maxWidth: 255 });
      doc.text(paragraph5, 20, 113, { align: "justify", maxWidth: 255 });
      doc.text(paragraph6, 20, 125, { align: "justify", maxWidth: 255 });
      doc.text(paragraph8, 20, 147, { align: "justify", maxWidth: 255 });
      if (info.country !== "All") {
        doc.text(paragraph7, 20, 164, { align: "justify", maxWidth: 255 });
      }

      doc.line(0, 200, 300, 200);
      doc.setFontSize(10);
      doc.text(`Source: typhi.net [${date}]`, IPW, 206, { align: "center" });

      doc.addPage("a4", "l");
      doc.setFontSize(25);
      doc.text("Global Overview of", 77, 12);
      doc.setFont(undefined, "italic");
      doc.text("Salmonella", 154, 12);
      doc.setFont(undefined, "normal");
      doc.text("Typhi", 200, 12);

      await svgAsPngUri(document.getElementById("control-map"), {
        scale: 4,
        backgroundColor: "white",
        width: 1200,
        left: -200,
      }).then(async (uri) => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        let mapImg = document.createElement("img");
        let mapImgPromise = imgOnLoadPromise(mapImg);
        mapImg.src = uri;
        await mapImgPromise;

        canvas.width = 1400;
        canvas.height = 700;
        ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
        var img = canvas.toDataURL("image/png");
        doc.addImage(img, "PNG", 0, 45, 298, 155);
      });

      let actualMapView = info.mapView;
      switch (actualMapView) {
        case "MDR":
          actualMapView = "Multidrug resistant (MDR)";
          break;
        case "XDR":
          actualMapView = "Extensively drug resistant (XDR)";
          break;
        case "Azith":
          actualMapView = "Azithromycin resistant";
          break;
        case "CipI":
          actualMapView = "Ciprofloxacin nonsusceptible (CipI/R)";
          break;
        case "CipR":
          actualMapView = "Ciprofloxacin resistant (CipR)";
          break;
        case "H58 / Non-H58":
          actualMapView = "H58 genotype";
          break;
        default:
          break;
      }

      doc.setFontSize(12);
      const dataset =
        info.dataset === "All"
          ? "All (local + travel)"
          : info.dataset === "Local"
            ? "Locally isolated"
            : "Travel isolates";

      doc.setFont(undefined, "bold");
      doc.text(info.mapView, 8, 20);
      doc.setFont(undefined, "normal");
      doc.text(`Total ${info.actualGenomes} genomes`, 8, 25);
      doc.text("Dataset: " + dataset, 8, 30);
      doc.text(
        "Time period: " +
        info.actualTimePeriodRange[0] +
        " to " +
        info.actualTimePeriodRange[1],
        8,
        35
      );
      doc.text("Country: " + info.country, 8, 40);
      // doc.text("Region: " + info.region, 8, 45);

      if (info.mapView === "Dominant Genotype") {
        var img = new Image();
        img.src = "legends/MapView_DominantGenotype.png";
        doc.addImage(img, "PNG", 68, 19, 219, 27);
      } else if (info.mapView === "No. Samples") {
        var img2 = new Image();
        img2.src = "legends/MapView_NoSamples.png";
        doc.addImage(img2, "PNG", 250, 15, 35, 35);
      } else {
        var img3 = new Image();
        img3.src = "legends/MapView_Others.png";
        doc.addImage(img3, "PNG", 250, 15, 35, 35);
      }

      doc.line(0, 200, 300, 200);
      doc.setFontSize(10);
      doc.text(`Source: typhi.net [${date}]`, IPW, 206, { align: "center" });

      doc.addPage("a4", "l");
      const names2 = [
        "Resistance frequencies within genotypes",
        "Resistance determinants within genotypes",
        "Drug resistance trends",
        "Genotype distribution",
      ];
      for (let index = 0; index < ids.length; index++) {
        let url;
        await domtoimage
          .toJpeg(document.getElementById(ids[index]), {
            quality: 1,
            bgcolor: "white",
          })
          .then(function (dataUrl) {
            url = dataUrl;
          });

        let subtitleH = 0;
        if (index === 0 || index === 1 || index === 2) {
          subtitleH = 3;
        }
        subtitleH += 3;

        doc.addImage(url, "PNG", 5, 15 + subtitleH);

        let imgWidth = jsPDF.API.getImageProperties(url).width;
        imgWidth = Math.floor(imgWidth * 0.264583);
        doc.setFontSize(11);
        const texts = [" ", " ", " ", " "];
        let spaceBetween = -4;
        if (dimensions.width < 1750) {
          spaceBetween = 13;
        }

        let drugs = [];
        for (let i = 0; i < info.drugs.length; i++) {
          drugs.push(info.drugs[i].value);
        }
        if (drugs.length === 0) {
          drugs.push("None");
        }

        doc.text(texts[index], imgWidth + spaceBetween, 23 + subtitleH, {
          align: "justify",
          maxWidth: 50,
        });

        doc.setFontSize(14);
        if (index === 1) {
          doc.text(names2[index] + " : " + info.amrClassFilter, 23, 10);
        } else {
          doc.text(names2[index], 23, 10);
        }
        doc.setFontSize(9);

        if (index === 0) {
          doc.text(`Top Genotypes (up to ${info.RFWGCount})`, 23, 15);
        }
        if (index === 1) {
          doc.text("Top Genotypes (up to 10)", 23, 15);
        }
        if (index === 2) {
          doc.text("Data are plotted for years with N >= 10 genomes", 23, 15);
        }

        doc.setFontSize(12);
        doc.text(`Total ${info.actualGenomes} genomes`, 230, 30);
        doc.text("Dataset: " + dataset, 230, 35);
        doc.text(
          "Time period: " +
          info.actualTimePeriodRange[0] +
          " to " +
          info.actualTimePeriodRange[1],
          230,
          40
        );
        doc.text("Country: " + info.country, 230, 45);
        // doc.text("Region: " + info.region, 230, 50);

        if (index === 3) {
          doc.setFillColor(255, 255, 255);
          doc.rect(
            22,
            info.dimensions.width < info.desktop ? 120 : 110,
            300,
            100,
            "F"
          );
        } else if (index === 1) {
          doc.setFillColor(255, 255, 255);
          doc.rect(22, 113, 300, 100, "F");
        }

        if (index === 1) {
          var img4 = new Image();
          if (info.amrClassFilter === "Fluoroquinolones (CipI/R)") {
            img4.src = "legends/Fluoroquinolones (CipI-R).png";
          } else {
            img4.src = "legends/" + info.amrClassFilter + ".png";
          }
          doc.addImage(img4, "PNG", 22, 107 + subtitleH);
        } else if (index === 3) {
          var img5 = new Image();
          img5.src = "legends/Genotype_Distribution.png";
          doc.addImage(
            img5,
            "PNG",
            22,
            (info.dimensions.width < info.desktop ? 115 : 108) + subtitleH
          );
        }
        doc.line(0, 200, 300, 200);
        doc.setFontSize(10);
        doc.text(`Source: typhi.net [${date}]`, IPW, 206, { align: "center" });
        if (index < ids.length - 1) {
          doc.addPage("a4", "l");
        }
      }

      doc.save("TyphiNET - Report.pdf");
      setCaptureReportInProgress(false);
    } else if (index !== 0) {
      let graph = document.getElementById(id);
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      let graphImg = document.createElement("img");
      let graphImgPromise = imgOnLoadPromise(graphImg);

      await domtoimage
        .toPng(graph, { quality: 0.1, bgcolor: "white" })
        .then(function (dataUrl) {
          graphImg.src = dataUrl;
        });

      let cHeight = 20;
      let logoHeight = 100;
      let legendHeight = 0;
      let filterHeight = 80;
      let subtitleHeight = 0;
      if (id === "RFWG" || id === "RFWAG" || id === "DRT") {
        cHeight += 20;
        subtitleHeight = 20;
      }
      let imgHeight = graphImg.height;
      if (id === "RFWAG" || id === "GD") {
        imgHeight -= 200;
      }

      if (id === "GD" || id === "RFWAG") legendHeight = 40;

      let imgWidth = graphImg.width;
      if (id === "RFWAG") {
        imgWidth += 130;
        if (info.amrClassFilter === "Azithromycin") {
          imgWidth += 100;
        } else if (info.amrClassFilter === "Co-trimoxazole") {
          imgWidth += 195;
        } else if (info.amrClassFilter === "Fluoroquinolones (CipI/R)") {
          imgWidth += 250;
        }
      } else if (id === "GD") {
        imgWidth += 370;
      }

      await graphImgPromise;
      canvas.width = imgWidth;

      canvas.height =
        imgHeight +
        cHeight +
        logoHeight +
        legendHeight +
        filterHeight +
        subtitleHeight +
        60;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "18px Montserrat";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";

      ctx.drawImage(graphImg, 10, cHeight + logoHeight + subtitleHeight);
      ctx.fillStyle = "white";
      ctx.fillRect(60, canvas.height - 130, 800, 300);
      ctx.fillStyle = "black";

      if (id === "RFWG") {
        ctx.fillText(brokenNames[0][0], canvas.width / 2, 10 + logoHeight);
        ctx.fillText(brokenNames[0][1], canvas.width / 2, 30 + logoHeight);
        ctx.font = "12px Montserrat";
        ctx.fillText(
          `Top Genotypes (up to ${info.RFWGCount})`,
          canvas.width / 2,
          32 + logoHeight + subtitleHeight
        );
      } else if (id === "RFWAG") {
        ctx.fillText(brokenNames[1][0], canvas.width / 2, 10 + logoHeight);
        ctx.fillText(brokenNames[1][1], canvas.width / 2, 30 + logoHeight);
        ctx.font = "12px Montserrat";
        ctx.fillText(
          "Top Genotypes (up to 10)",
          canvas.width / 2,
          32 + logoHeight + subtitleHeight
        );
      } else if (id === "DRT") {
        ctx.fillText(names[index - 1], canvas.width / 2, 10 + logoHeight);
        ctx.font = "12px Montserrat";
        ctx.fillText(
          "Data are plotted for years with N ≥ 10 genomes",
          canvas.width / 2,
          32 + logoHeight + subtitleHeight
        );
      } else {
        ctx.fillText(names[index - 1], canvas.width / 2, 10 + logoHeight);
      }

      if (id === "RFWAG" || id === "GD") {
        let legendImg = document.createElement("img");
        let legendImgPromise = imgOnLoadPromise(legendImg);
        if (id === "RFWAG") {
          if (info.amrClassFilter === "Fluoroquinolones (CipI/R)") {
            legendImg.src = "legends/Fluoroquinolones (CipI-R).png";
          } else {
            if (
              info.amrClassFilter === "Trimethoprim" ||
              info.amrClassFilter === "Co-trimoxazole"
            ) {
              info.amrClassFilter += "2";
            }
            legendImg.src = "legends/" + info.amrClassFilter + ".png";
          }
        } else {
          legendImg.src = "legends/Genotype_Distribution_2.png";
        }
        await legendImgPromise;

        ctx.drawImage(
          legendImg,
          graphImg.width,
          logoHeight + subtitleHeight + 12 + cHeight
        );
      }

      let typhinetLogo = document.createElement("img");
      let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
      typhinetLogo.src = typhinetLogoImg;
      await typhinetLogoPromise;
      ctx.drawImage(typhinetLogo, 10, 10, 170, 55);

      ctx.fillStyle = "black";
      ctx.font = "14px Montserrat";
      ctx.textAlign = "start";
      ctx.fillText("Dataset: " + info.dataset, 10, canvas.height - 92);
      ctx.fillText(
        "Time period: " +
        info.actualTimePeriodRange[0] +
        " to " +
        info.actualTimePeriodRange[1],
        10,
        canvas.height - 70
      );
      ctx.fillText("Country: " + info.country, 10, canvas.height - 48);
      // ctx.fillText("Region: " + info.region, 10, canvas.height - 26);

      const base64 = canvas.toDataURL();
      stopLoading(index);
      download(base64, "TyphiNET - " + names[index - 1] + ".png");
    } else {
      svgAsPngUri(document.getElementById(id), {
        scale: 4,
        backgroundColor: "white",
        width: 1200,
        left: -200,
      }).then(async (uri) => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        let mapImg = document.createElement("img");
        let mapImgPromise = imgOnLoadPromise(mapImg);
        mapImg.src = uri;
        await mapImgPromise;

        let cWidth = 3600;
        let cHeight = 1800;
        let textHeight = 240;
        let legendHeight = 0;
        if (info.mapView === "Dominant Genotype") {
          legendHeight = 440;
        }

        canvas.width = cWidth;
        canvas.height = cHeight + textHeight + legendHeight;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bolder 50px Montserrat";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(
          "Global Overview of Salmonella Typhi",
          canvas.width / 2,
          80
        );
        ctx.font = "35px Montserrat";
        ctx.textAlign = "center";

        let actualMapView = info.mapView;
        switch (actualMapView) {
          case "MDR":
            actualMapView = "Multidrug resistant (MDR)";
            break;
          case "XDR":
            actualMapView = "Extensively drug resistant (XDR)";
            break;
          case "Azith":
            actualMapView = "Azithromycin resistant";
            break;
          case "CipI":
            actualMapView = "Ciprofloxacin nonsusceptible (CipI/R)";
            break;
          case "CipR":
            actualMapView = "Ciprofloxacin resistant (CipR)";
            break;
          case "H58 / Non-H58":
            actualMapView = "H58 genotype";
            break;
          default:
            break;
        }

        ctx.fillText("Map view: " + actualMapView, canvas.width / 2, 140);
        ctx.fillText("Dataset: " + info.dataset, canvas.width / 2, 190);
        ctx.fillText(
          "Time period: " +
          info.actualTimePeriodRange[0] +
          " to " +
          info.actualTimePeriodRange[1],
          canvas.width / 2,
          240
        );

        ctx.drawImage(mapImg, 0, textHeight, canvas.width, cHeight);

        let legendImg = document.createElement("img");
        let legendImgoPromise = imgOnLoadPromise(legendImg);
        let h;
        let w;
        if (info.mapView === "Dominant Genotype") {
          legendImg.src = "legends/MapView_DominantGenotype.png";
          await legendImgoPromise;
          let centerWidth = (canvas.width - 1731) / 2;
          ctx.drawImage(
            legendImg,
            centerWidth,
            canvas.height - legendHeight - 20,
            1731,
            420
          );
        } else if (info.mapView === "No. Samples") {
          legendImg.src = "legends/MapView_NoSamples.png";
          await legendImgoPromise;
          h = 350;
          w = 310;
          ctx.drawImage(
            legendImg,
            canvas.width - w - 15,
            canvas.height - h - 10,
            w,
            h
          );
        } else {
          legendImg.src = "legends/MapView_Others.png";
          await legendImgoPromise;
          h = 350;
          w = 280;
          ctx.drawImage(
            legendImg,
            canvas.width - w - 25,
            canvas.height - h - 20,
            w,
            h
          );
        }

        let typhinetLogo = document.createElement("img");
        let typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
        typhinetLogo.src = typhinetLogoImg;
        await typhinetLogoPromise;
        ctx.drawImage(typhinetLogo, 25, 25, 500, 200);

        const base64 = canvas.toDataURL();
        stopLoading(index);
        download(base64, "TyphiNET - Global Overview Salmonella Typhi.png");
      });
    }
  });

  // Download spreadsheet
  const [dowloadBaseSpreadsheet] = useState(() => () => {
    axios.get(`${API_ENDPOINT}file/download`).then((res) => {
      let cols_to_remove = [
        "azith_pred_pheno",
        "ACCESSION",
        "COUNTRY_ONLY",
        "REGION_IN_COUNTRY",
        "LOCATION",
        "ACCURACY",
        "LATITUDE",
        "LONGITUDE",
        "REFERENCE",
        "MLST ST (EnteroBase)",
        "MLST PROFILE (EnteroBase)",
        "GENOTYPHI SNPs CALLED",
        "Genome ID",
        "Version",
        "Organism Name",
        "Organism ID",
        "Species Name",
        "Species ID",
        "Genus Name",
        "Genus ID",
        "Reference ID",
        "Matching Hashes",
        "p-Value",
        'Mash Distance',
        "cip_pred_pheno",
        "dcs_category",
        "amr_category",
        "num_qrdr",
        "num_acrb",
        "ESBL_category",
        "chloramphenicol_category",
        "tetracycline_category",
        "cip_pheno_qrdr_gene",
        "dcs_mechanisms",
        "num_amr_genes",
        "dfra_any",
        "sul_any",
        "co_trim",
        "GENOTYPE_SIMPLE",
        "h58_genotypes",
      ];
      let indexes = [];
      let csv = res.data.split("\n");
      let lines = [];

      for (let index = 0; index < csv.length; index++) {
        let line = csv[index].split(",");
        lines.push(line);
      }

      for (let index = 0; index < cols_to_remove.length; index++) {
        let currentIndex = lines[0].indexOf(cols_to_remove[index]);
        indexes.push(currentIndex);
      }
      indexes.sort();
      indexes.reverse();

      let newLines = [];
      for (let j = 0; j < lines.length; j++) {
        let aux = [];
        for (let i = 0; i < lines[j].length; i++) {
          if (!indexes.includes(i)) {
            aux.push(lines[j][i]);
          }
        }
        newLines.push(aux);
      }

      let newCSV = "";
      for (let i = 0; i < newLines.length; i++) {
        let aux = "";
        for (let index = 0; index < newLines[i].length; index++) {
          aux += newLines[i][index];
          if (index !== newLines[i].length - 1) {
            aux += ",";
          }
        }
        if (i !== newLines.length - 1) {
          aux += "\n";
        }
        newCSV += aux;
      }

      download(newCSV, "TyphiNET_Database.csv");
    });
  });

  const [dowloadCurrentDataSpreadsheet] = useState(() => () => { });

  // Component for map view's options
  const generateMapLegendOptions = () => {
    // let percentageSteps2 = ['1', '2', '10', '50']
    let percentageSteps = ["1", "3", "11", "51"];
    let percentageStepsSensitive = ["10", "20", "50", "90", "100"];
    const otherViews = ["CipI", "CipR", "Azith", "MDR", "XDR"];

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
                <div
                  className="color"
                  style={{ backgroundColor: mapRedColorScale(n) }}
                />
                {n === "1" && <span>{"1 - 2"}%</span>}
                {n === "3" && <span>{"3 - 10"}%</span>}
                {n === "11" && <span>{"11 - 50"}%</span>}
                {n === "51" && <span>{"51 - 100"}%</span>}
              </div>
            );
          })}
        </>
      );
    }

    switch (mapView) {
      case "Sensitive to all drugs":
        return (
          <>
            <div className="samples-info">
              <div className="color samples-info-insufficient-data" />
              <span>Insufficient data</span>
            </div>
            {percentageStepsSensitive.map((n) => {
              return (
                <div key={n} className="samples-info">
                  <div
                    className="color"
                    style={{ backgroundColor: mapRedColorScaleForSensitive(n) }}
                  />
                  {n === "10" && <span>{"0 - 10"}%</span>}
                  {n === "20" && <span>{"10 - 20"}%</span>}
                  {n === "50" && <span>{"20 - 50"}%</span>}
                  {n === "90" && <span>{"50 - 90"}%</span>}
                  {n === "100" && <span>{"90 - 100"}%</span>}
                </div>
              );
            })}
          </>
        );
      case "No. Samples":
        let legends = ["1 - 9", "10 - 19", "20 - 99", "100 - 299", ">= 300"];
        let aux = [1, 10, 20, 100, 300];
        return (
          <>
            <div className="samples-info">
              <div className="color samples-info-insufficient-data" />
              <span>Insufficient data</span>
            </div>
            {[...Array(5).keys()].map((n, i) => {
              return (
                <div key={n + i} className="samples-info">
                  <div
                    className="color"
                    style={{ backgroundColor: mapSamplesColorScale(aux[n]) }}
                  />
                  <span>{legends[n]}</span>
                </div>
              );
            })}
          </>
        );
      case "Dominant Genotype":
        return (
          <div className="map-legend-DG">
            <div className="samples-info">
              <div className="color samples-info-insufficient-data" />
              <span>Insufficient data</span>
            </div>
            {genotypes.map((g, n) => {
              return (
                <div key={n + "DG"} className="samples-info">
                  <div
                    className="color"
                    style={{ backgroundColor: getColorForGenotype(g) }}
                  />
                  <span>{g}</span>
                </div>
              );
            })}
          </div>
        );
      case "H58 / Non-H58":
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
                <div key={n + "H58"} className="samples-info">
                  <div
                    className="color"
                    style={{ backgroundColor: mapRedColorScale(g) }}
                  />
                  {g === "1" && <span>{"1 - 2"}%</span>}
                  {g === "3" && <span>{"3 - 10"}%</span>}
                  {g === "11" && <span>{"11 - 50"}%</span>}
                  {g === "51" && <span>{"51 - 100"}%</span>}
                </div>
              );
            })}
          </>
        );
      default:
        return null;
    }
  };

  // Map upper right buttons component
  const renderMapLegend = () => {
    const mapLegends = [
      ["MDR", "Multidrug resistant (MDR)"],
      ["XDR", "Extensively drug resistant (XDR)"],
      ["Azith", "Azithromycin resistant"],
      ["CipI", "Ciprofloxacin nonsusceptible (CipI/R)"],
      ["CipR", "Ciprofloxacin resistant (CipR)"],
      ["Sensitive to all drugs", "Sensitive to all drugs"],
      ["Dominant Genotype", "Dominant Genotype"],
      ["H58 / Non-H58", "H58 genotype"],
      ["No. Samples", "No. Samples"],
    ];
    return (
      <div className="map-legend">
        <FormControl fullWidth className={classes.formControlSelect}>
          <div className="map-legend-formcontrol-div map-legend-formcontrol-div-pad">
            <div className="map-legend-formcontrol-label">Select map view</div>
            <IconTooltip
              title={
                <div className={classes.tooltipTitle}>
                  Percentage frequency data is shown only for countries with
                  N≥20 genomes
                </div>
              }
              placement="top"
            >
              <IconButton className={classes.tooltipButton}>
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  size="xs"
                  className={classes.tooltipIcon}
                />
              </IconButton>
            </IconTooltip>
          </div>
          <Select
            value={mapView}
            onChange={(evt) => setMapView(evt.target.value)}
            fullWidth
            className={classes.select}
          >
            {mapLegends.map((n, i) => {
              return (
                <MenuItem
                  key={i + "mapview"}
                  className={classes.select}
                  value={n[0]}
                >
                  {n[1]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {generateMapLegendOptions()}
      </div>
    );
  };

  // The variables and functions between the two dotted lines below represents the new method for filtering the data on the dashboard
  //-------------------------------------------------------------------------------------------------------------------
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [init, setInit] = useState(false);
  const [allCountryRegions, setAllCountryRegions] = useState({});
  const [loading, setLoading] = useState(false);

  // Get data from the csv file, filter it and set all initial values for the dashboard
  // The CSV is only read ONCE in this function, after that the data passes only through the "filterForComponents" function from the filters.js file
  useEffect(() => {
    axios.get(`${API_ENDPOINT}filters/getDataFromCSV`).then((res) => {
      // console.log('Getting Data');
      setData(res.data);
      setTotalGenomes(res.data.length);

      let [auxTGenotypes, auxYears, auxCountries, auxRegions] = [
        [],
        [],
        [],
        {},
      ];
      let empty = ["", "-"];
      res.data.forEach((x) => {
        if (!auxTGenotypes.includes(x.GENOTYPE)) auxTGenotypes.push(x.GENOTYPE);
        if (!auxYears.includes(x.DATE) && !empty.includes(x.DATE))
          auxYears.push(x.DATE);
        if (
          !auxCountries.includes(x.COUNTRY_ONLY) &&
          !empty.includes(x.COUNTRY_ONLY)
        ) {
          auxCountries.push(x.COUNTRY_ONLY);
          auxRegions[x.COUNTRY_ONLY] = [];
        }
        if (
          !empty.includes(x.COUNTRY_ONLY) &&
          !empty.includes(x.REGION_IN_COUNTRY) &&
          !auxRegions[x.COUNTRY_ONLY].includes(x.REGION_IN_COUNTRY)
        ) {
          auxRegions[x.COUNTRY_ONLY].push(x.REGION_IN_COUNTRY);
        }
      });
      auxYears.sort();
      auxCountries.sort();
      auxCountries.unshift("All");

      setTotalGenotypes(auxTGenotypes.length);
      setTimeInitial(auxYears[0]);
      setActualTimeInitial(auxYears[0]);
      setTimeFinal(auxYears[auxYears.length - 1]);
      setActualTimeFinal(auxYears[auxYears.length - 1]);
      setYears(auxYears);
      setCountriesForFilter(auxCountries);
      setAllCountryRegions(auxRegions);

      // console.log('FINISH');
      setInit(true);
    });
  }, []);

  // Update regions after country changes.
  // This was made apart from the normal filters because we already have all regions from all countries and it is not necessary
  // to loop through all the data again.
  useEffect(() => {
    if (init) {
      setActualRegion("All");
      if (actualCountry !== "All") {
        const auxRegions = allCountryRegions[actualCountry];
        auxRegions.sort();
        auxRegions.unshift("All");
        setRegionsForFilter(auxRegions);
      }
    }
  }, [init, actualCountry, allCountryRegions]);

  // This function checks for changes on any of the filters and changes the loading status of the apge to TRUE.
  // This triggers the function below this one (filterForComponents) and updates the data shown on the page
  useEffect(() => {
    if (init) {
      // console.log('Something changed');
      setLoading(true);
    }
  }, [
    init,
    dataset,
    actualTimeInitial,
    actualTimeFinal,
    actualCountry,
    actualRegion,
  ]);

  // Watcher from changes from filter on the dashboard, this way data is passed through the filters.js file and returns
  useEffect(() => {
    function update() {
      if (init && loading) {
        // console.log('Updating...');
        const aux = filterForComponents({
          data: data,
          dataset: dataset,
          country: actualCountry,
          minYear: actualTimeInitial,
          maxYear: actualTimeFinal,
          region: actualRegion,
        });
        setCurrentData(aux[0]);
        setActualGenomes(aux[0].length);
        setActualGenotypes(aux[1]);
        setWorldMapSamplesData(aux[2]);
        setWorldMapComplementaryData(aux[3]);
        setWorldMapGenotypesData(aux[4]);
        setWorldMapH58Data(aux[5]);
        setWorldMapSTADData(aux[6]);
        setWorldMapMDRData(aux[7]);
        setWorldMapXDRData(aux[8]);
        setWorldMapAZITHData(aux[9]);
        setWorldMapCIPRData(aux[10]);
        setWorldMapCIPIData(aux[11]);
        setCountryPMID(aux[12]);
        setDrugsAndGenotypesChartData(aux[13]);
        setDrugTrendsChartData(aux[14]);
        setAmrClassChartData(aux[15]);
        setPopulationStructureChartData(aux[16]);
        setAppLoading(false);
        setLoading(false);
      }
    }
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  //-------------------------------------------------------------------------------------------------------------------

  return (
    <div className="dashboard" style={{ height: "100vh" }}>
      {/* Mobile toolbar */}
      <div className="menu-bar-mobile">
        <img
          className="logoImageMenu-mobile"
          src={typhinetLogoImg}
          alt="TyphiNET"
        />
      </div>
      <div
        style={{
          padding:
            dimensions.width > 770 ? "16px 16px 0px 16px" : "16x 0px 0px 0px",
          display: appLoading ? "none" : "",
          backgroundColor: "#E5E5E5",
        }}
      >
        {/* Logo and information on genotypes and genomes */}
        <div className="info-wrapper">
          {dimensions.width > desktop && (
            <>
              <div className="typhinet-logo">
                <img
                  className="typhinet-logo-image"
                  src={typhinetLogoImg}
                  alt="TyphiNET"
                />
              </div>
            </>
          )}
          <div className="card card-padding">
            <span>Total Genomes</span>
            {totalGenomes === actualGenomes ? (
              <span className="value">{totalGenomes}</span>
            ) : (
              <span className="value">
                {actualGenomes}
                <span className="value-total">/{totalGenomes}</span>
              </span>
            )}
          </div>
          <div className="card">
            <span>Total Genotypes</span>
            {totalGenotypes === actualGenotypes ? (
              <span className="value">{totalGenotypes}</span>
            ) : (
              <span className="value">
                {actualGenotypes}
                <span className="value-total">/{totalGenotypes}</span>
              </span>
            )}
          </div>
        </div>
        {/* Map Wrapper*/}
        <div className="map-filters-wrapper">
          <h2>
            Global Overview of <i>Salmonella</i> Typhi
          </h2>
          <div
            className="map-filters-wrapper-inside"
            style={{
              flexDirection: dimensions.width > desktop ? "row" : "column",
            }}
          >
            {/* Map -> all map views and information */}
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
                  <Geographies geography={geography}>
                    {({ geographies }) => {
                      return geographies.map((geo) => {
                        const sample = worldMapSamplesData.find(
                          (s) =>
                            s.displayName === geo.properties.NAME
                          // && (actualContinent === "All" ||
                          //   geo.properties.CONTINENT === actualContinent)
                        );

                        const d =
                          worldMapComplementaryData[geo.properties.NAME];
                        let country;

                        let fill = "lightgrey";
                        let darkGray = "#727272";
                        let zeroPercentColor = "#A20F17";

                        switch (mapView) {
                          case "No. Samples":
                            if (sample && sample.count !== 0) {
                              fill = mapSamplesColorScale(sample.count);
                            } else if (sample && sample.count === 0) {
                              fill = "#F5F4F6";
                            }
                            break;
                          case "Dominant Genotype":
                            country = worldMapGenotypesData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              const temp = country.genotypes;
                              temp.sort((a, b) =>
                                a.count <= b.count ? 1 : -1
                              );
                              if (sample) {
                                fill = getColorForGenotype(temp[0].lineage);
                              }
                            }
                            break;
                          case "H58 / Non-H58":
                            country = worldMapH58Data.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              let countH58 = 0;
                              const isH58 = country.genotypes.find(
                                (g) => g.type === "H58"
                              );
                              if (isH58 !== undefined) {
                                countH58 = isH58.count;
                              }

                              if (country.total >= 20 && countH58 > 0) {
                                fill = mapRedColorScale(isH58.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray;
                              }
                            }
                            break;
                          case "MDR":
                            country = worldMapMDRData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray;
                              }
                            }
                            break;
                          case "Sensitive to all drugs":
                            country = worldMapSTADData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScaleForSensitive(
                                  country.percentage
                                );
                              } else if (country.total >= 20) {
                                fill = zeroPercentColor;
                              }
                            }
                            break;
                          case "XDR":
                            country = worldMapXDRData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray;
                              }
                            }
                            break;
                          case "Azith":
                            country = worldMapAZITHData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray;
                              }
                            }
                            break;
                          case "CipI":
                            country = worldMapCIPIData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray;
                              }
                            }
                            break;
                          case "CipR":
                            country = worldMapCIPRData.find(
                              (s) =>
                                s.displayName === geo.properties.NAME
                              // && (actualContinent === "All" ||
                              //   geo.properties.CONTINENT === actualContinent)
                            );
                            if (country !== undefined) {
                              if (country.total >= 20 && country.count > 0) {
                                fill = mapRedColorScale(country.percentage);
                              } else if (country.total >= 20) {
                                fill = darkGray;
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
                              if (d !== undefined && sample !== undefined) {
                                setActualCountry(sample.name);
                              }
                            }}
                            onMouseLeave={() => {
                              setTooltipContent(null);
                            }}
                            onMouseEnter={() => {
                              const { NAME } = geo.properties;
                              switch (mapView) {
                                case "No. Samples":
                                  if (sample !== undefined && d !== undefined) {
                                    setTooltipContent({
                                      name: NAME,
                                      additionalInfo: {
                                        samples: sample.count,
                                        genotypes: d.GENOTYPES.TOTAL,
                                        H58:
                                          Math.round(d.H58) !== d.H58
                                            ? d.H58.toFixed(2)
                                            : d.H58,
                                        MDR:
                                          Math.round(d.MDR) !== d.MDR
                                            ? d.MDR.toFixed(2)
                                            : d.MDR,
                                        XDR:
                                          Math.round(d.XDR) !== d.XDR
                                            ? d.XDR.toFixed(2)
                                            : d.XDR,
                                        // DCS:
                                        //   Math.round(d.DCS) !== d.DCS
                                        //     ? d.DCS.toFixed(2)
                                        //     : d.DCS,
                                        CipI:
                                          Math.round(d.CipI) !== d.CipI
                                            ? d.CipI.toFixed(2)
                                            : d.CipI,
                                        CipR:
                                          Math.round(d.CipR) !== d.CipR
                                            ? d.CipR.toFixed(2)
                                            : d.CipR,
                                        CipI_R:
                                          Math.round(d.CipI_R) !== d.CipI_R
                                            ? d.CipI_R.toFixed(2)
                                            : d.CipI_R,
                                        AzithR:
                                          Math.round(d.AzithR) !== d.AzithR
                                            ? d.AzithR.toFixed(2)
                                            : d.AzithR,
                                        STAD:
                                          Math.round(d.STAD) !== d.STAD
                                            ? d.STAD.toFixed(2)
                                            : d.STAD,
                                      },
                                    });
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "Dominant Genotype":
                                  if (country !== undefined) {
                                    let temp = country.genotypes;
                                    temp.sort((a, b) =>
                                      a.count <= b.count ? 1 : -1
                                    );
                                    setTooltipContent({
                                      name: NAME,
                                      genotypeInfo: temp,
                                    });
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "H58 / Non-H58":
                                  if (
                                    country !== undefined &&
                                    country.genotypes.length > 0
                                  ) {
                                    let countH58 = 0;
                                    const isH58 = country.genotypes.find(
                                      (g) => g.type === "H58"
                                    );
                                    if (isH58 !== undefined) {
                                      countH58 = isH58.count;
                                    }

                                    if (country.total >= 20 && countH58 > 0) {
                                      setTooltipContent({
                                        name: NAME,
                                        simpleGenotypeInfo: country.genotypes,
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }

                                  break;
                                case "MDR":
                                  if (
                                    country !== undefined &&
                                    country.MDRs.length > 0
                                  ) {
                                    if (
                                      country.total >= 20 &&
                                      country.count > 0
                                    ) {
                                      setTooltipContent({
                                        name: NAME,
                                        mdrInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        },
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "Sensitive to all drugs":
                                  if (
                                    country !== undefined &&
                                    country.STADs.length > 0
                                  ) {
                                    if (
                                      country.total >= 20 &&
                                      country.count > 0
                                    ) {
                                      setTooltipContent({
                                        name: NAME,
                                        stadInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        },
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "XDR":
                                  if (
                                    country !== undefined &&
                                    country.XDRs.length > 0
                                  ) {
                                    if (
                                      country.total >= 20 &&
                                      country.count > 0
                                    ) {
                                      setTooltipContent({
                                        name: NAME,
                                        xdrInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        },
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "Azith":
                                  if (
                                    country !== undefined &&
                                    country.AZs.length > 0
                                  ) {
                                    if (
                                      country.total >= 20 &&
                                      country.count > 0
                                    ) {
                                      setTooltipContent({
                                        name: NAME,
                                        azInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        },
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "CipI":
                                  if (
                                    country !== undefined &&
                                    country.CipIs.length > 0
                                  ) {
                                    if (
                                      country.total >= 20 &&
                                      country.count > 0
                                    ) {
                                      let cipI = country.CipIs.filter(
                                        (x) => x.type === "CipI"
                                      );
                                      if (cipI.length) {
                                        cipI = cipI[0];
                                        if (
                                          Math.round(cipI.percentage) !==
                                          cipI.percentage
                                        )
                                          cipI.percentage =
                                            cipI.percentage.toFixed(2);
                                        cipI.percentage = parseFloat(
                                          cipI.percentage
                                        );
                                      } else {
                                        cipI = {
                                          count: 0,
                                          percentage: 0,
                                        };
                                      }
                                      let cipR = country.CipIs.filter(
                                        (x) => x.type === "CipR"
                                      );
                                      if (cipR.length) {
                                        cipR = cipR[0];
                                        if (
                                          Math.round(cipR.percentage) !==
                                          cipR.percentage
                                        )
                                          cipR.percentage =
                                            cipR.percentage.toFixed(2);
                                        cipR.percentage = parseFloat(
                                          cipR.percentage
                                        );
                                      } else {
                                        cipR = {
                                          count: 0,
                                          percentage: 0,
                                        };
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
                                        },
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
                                  }
                                  break;
                                case "CipR":
                                  if (
                                    country !== undefined &&
                                    country.CipRs.length > 0
                                  ) {
                                    if (
                                      country.total >= 20 &&
                                      country.count > 0
                                    ) {
                                      setTooltipContent({
                                        name: NAME,
                                        cipRInfo: {
                                          count: country.count,
                                          percentage: country.percentage,
                                        },
                                      });
                                    } else if (country.total >= 20) {
                                      setTooltipContent({
                                        name: NAME,
                                        smallerThan20: true,
                                      });
                                    } else {
                                      setTooltipContent({
                                        name: NAME,
                                      });
                                    }
                                  } else {
                                    setTooltipContent({
                                      name: NAME,
                                    });
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
                              },
                            }}
                          />
                        );
                      })
                    }

                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              {/* Map legend */}
              {dimensions.width > desktop && (
                <div className="map-upper-right-buttons">
                  {renderMapLegend()}
                </div>
              )}
              {dimensions.width > desktop && (
                // Dataset Filter
                <div className="map-upper-left-buttons ">
                  <div
                    className="map-filters"
                    style={{
                      width:
                        dimensions.width > desktop
                          ? 200
                          : "-webkit-fill-available",
                    }}
                  >
                    <span
                      className="map-filters-label"
                      style={{
                        marginBottom: dimensions.width > desktop ? 20 : 10,
                      }}
                    >
                      Filters
                    </span>
                    <div
                      style={{
                        marginBottom: dimensions.width > desktop ? 16 : 8,
                      }}
                    >
                      <Typography className={classes.typography}>
                        Select dataset
                      </Typography>
                      <ToggleButtonGroup
                        value={dataset}
                        exclusive
                        size="small"
                        className={classes.tbg}
                        onChange={(evt, newDataset) => {
                          if (newDataset !== null) setDataset(newDataset);
                        }}
                      >
                        <CustomToggleButton value="All">All</CustomToggleButton>
                        <CustomToggleButton value="Local">
                          Local
                        </CustomToggleButton>
                        <CustomToggleButton value="Travel">
                          Travel
                        </CustomToggleButton>
                      </ToggleButtonGroup>
                    </div>
                    <div className="margin-div">
                      {years.length > 2 && (
                        <div className="my-year-range">
                          <div>
                            <Typography
                              gutterBottom
                              className={classes.typography}
                            >
                              Start year
                            </Typography>
                            <Select
                              value={actualTimeInitial}
                              onChange={(evt, value) =>
                                setActualTimeInitial(value.props.value)
                              }
                              className={classes.selectYear}
                              fullWidth
                            >
                              {years
                                ?.filter((x) => x <= actualTimeFinal)
                                .map((n, i) => {
                                  return (
                                    <MenuItem
                                      key={i + "timeperiod"}
                                      className={classes.select}
                                      value={n}
                                    >
                                      {n}
                                    </MenuItem>
                                  );
                                })}
                            </Select>
                          </div>
                          <div className="my-divider"></div>
                          <div className="my-year-range-row">
                            <Typography
                              gutterBottom
                              className={classes.typographyEndYear}
                            >
                              End year
                            </Typography>
                            <Select
                              value={actualTimeFinal}
                              onChange={(evt, value) =>
                                setActualTimeFinal(value.props.value)
                              }
                              className={classes.selectYear}
                              fullWidth
                            >
                              {years
                                ?.filter((x) => x >= actualTimeInitial)
                                .map((n, i) => {
                                  return (
                                    <MenuItem
                                      key={i + "timeperiod2"}
                                      className={classes.select}
                                      value={n}
                                    >
                                      {n}
                                    </MenuItem>
                                  );
                                })}
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Map controllers */}
              <div className="map-lower-left-buttons">
                <Zoom
                  in={
                    controlMapPosition.zoom !== 1 ||
                    controlMapPosition.coordinates.some((c) => c !== 0)
                  }
                >
                  <TooltipMaterialUI
                    title={<span className="my-font">Recenter Map</span>}
                    placement="right"
                  >
                    <div
                      className="button"
                      onClick={() =>
                        setControlMapPosition({ coordinates: [0, 0], zoom: 1 })
                      }
                    >
                      <FontAwesomeIcon icon={faCrosshairs} />
                    </div>
                  </TooltipMaterialUI>
                </Zoom>
                <TooltipMaterialUI
                  title={<span className="my-font">Zoom In</span>}
                  placement="right"
                >
                  <div
                    className="button"
                    onClick={() => {
                      if (controlMapPosition.zoom >= 4) return;
                      setControlMapPosition((pos) => ({
                        ...pos,
                        zoom: pos.zoom * 2,
                      }));
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </div>
                </TooltipMaterialUI>
                <TooltipMaterialUI
                  title={<span className="my-font">Zoom Out</span>}
                  placement="right"
                >
                  <div
                    className="button"
                    onClick={() => {
                      if (controlMapPosition.zoom <= 1) return;
                      if (controlMapPosition.zoom / 2 === 1) {
                        setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
                      } else {
                        setControlMapPosition((pos) => ({
                          ...pos,
                          zoom: pos.zoom / 2,
                        }));
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </div>
                </TooltipMaterialUI>
              </div>
              {/* Download map button */}
              <div className="map-lower-right-buttons">
                <TooltipMaterialUI
                  title={<span className="my-font">Download Map as PNG</span>}
                  placement="left"
                >
                  <div
                    className={`button ${captureControlMapInProgress && "disabled"
                      }`}
                    onClick={() => {
                      if (!captureControlMapInProgress)
                        capturePicture("control-map", 0, {
                          mapView: mapView,
                          dataset: dataset,
                          actualTimePeriodRange: [
                            actualTimeInitial,
                            actualTimeFinal,
                          ],
                        });
                    }}
                  >
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                </TooltipMaterialUI>
                {captureControlMapInProgress && (
                  <CustomCircularProgress
                    size={54}
                    thickness={4}
                    style={{ top: 5, left: -7 }}
                  />
                )}
              </div>
            </div>
            {/* Map filters and legends for mobile */}
            {!(dimensions.width > desktop) && (
              <div className="wrapper-map-legend">
                {/* Legend */}
                {renderMapLegend()}
                {/* Filters */}
                <div>
                  <div
                    className="map-filters-mobile"
                    style={{
                      width:
                        dimensions.width > desktop
                          ? 200
                          : "-webkit-fill-available",
                    }}
                  >
                    <span
                      className="map-filters-label"
                      style={{
                        marginBottom: dimensions.width > desktop ? 20 : 10,
                      }}
                    >
                      Filters
                    </span>
                    {/* Dataset Filter */}
                    <div
                      style={{
                        marginBottom: dimensions.width > desktop ? 16 : 8,
                      }}
                    >
                      <Typography className={classes.typography}>
                        Select dataset
                      </Typography>
                      <ToggleButtonGroup
                        value={dataset}
                        exclusive
                        size="small"
                        className={classes.tbg}
                        onChange={(evt, newDataset) => {
                          if (newDataset !== null) setDataset(newDataset);
                        }}
                      >
                        <CustomToggleButton value="All">All</CustomToggleButton>
                        <CustomToggleButton value="Local">
                          Local
                        </CustomToggleButton>
                        <CustomToggleButton value="Travel">
                          Travel
                        </CustomToggleButton>
                      </ToggleButtonGroup>
                    </div>
                    {/* Year Filter */}
                    <div className="margin-div">
                      <div className="my-year-range">
                        <div className="my-year-range-row">
                          <Typography
                            gutterBottom
                            className={classes.typography}
                          >
                            Start year
                          </Typography>
                          <Select
                            value={actualTimeInitial}
                            onChange={(evt, value) =>
                              setActualTimeInitial(value.props.value)
                            }
                            className={classes.select}
                            fullWidth
                          >
                            {years.map((n, i) => {
                              return (
                                <MenuItem
                                  key={i + "year"}
                                  className={classes.select}
                                  value={n}
                                >
                                  {n}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </div>
                        <div className="my-divider"></div>
                        <div className="my-year-range-row">
                          <Typography
                            gutterBottom
                            className={classes.typographyEndYear}
                          >
                            End year
                          </Typography>
                          <Select
                            value={actualTimeFinal}
                            onChange={(evt, value) =>
                              setActualTimeFinal(value.props.value)
                            }
                            className={classes.select}
                            fullWidth
                          >
                            {years.map((n, i) => {
                              return (
                                <MenuItem
                                  key={i + "year2"}
                                  className={classes.select}
                                  value={n}
                                >
                                  {n}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Map Tooltips */}
            <ReactTooltip>
              {tooltipContent && (
                <div className="tooltip-map">
                  <span className="country">{tooltipContent.name}</span>
                  {tooltipContent.additionalInfo && (
                    <div className="additional-info">
                      <span>
                        Samples: {tooltipContent.additionalInfo.samples}
                      </span>
                      <span>
                        Genotypes: {tooltipContent.additionalInfo.genotypes}
                      </span>
                      <span>H58: {tooltipContent.additionalInfo.H58}%</span>
                      <span>MDR: {tooltipContent.additionalInfo.MDR}%</span>
                      <span>XDR: {tooltipContent.additionalInfo.XDR}%</span>
                      {/* <span>DCS: {tooltipContent.additionalInfo.DCS}%</span> */}
                      <span>
                        AzithR: {tooltipContent.additionalInfo.AzithR}%
                      </span>
                      <span>CipI: {tooltipContent.additionalInfo.CipI}%</span>
                      <span>CipR: {tooltipContent.additionalInfo.CipR}%</span>
                      <span>
                        CipI/R: {tooltipContent.additionalInfo.CipI_R}%
                      </span>
                      <span>
                        Susceptible: {tooltipContent.additionalInfo.STAD}%
                      </span>
                    </div>
                  )}
                  {tooltipContent.genotypeInfo && (
                    <div className="additional-info margin-div">
                      {tooltipContent.genotypeInfo.map((genotype, index) => {
                        if (index < 5) {
                          return (
                            <div
                              key={index + "genotypeInfo"}
                              className="genotype"
                            >
                              <div
                                className="color"
                                style={{
                                  backgroundColor: getColorForGenotype(
                                    genotype.lineage
                                  ),
                                }}
                              />
                              <span>
                                {genotype.lineage}: {genotype.count}
                              </span>
                            </div>
                          );
                        } else return null;
                      })}
                    </div>
                  )}
                  {tooltipContent.simpleGenotypeInfo && (
                    <div className="additional-info margin-div">
                      {tooltipContent.simpleGenotypeInfo[0].type === "H58" ? (
                        <span>
                          {tooltipContent.simpleGenotypeInfo[0].type}:{" "}
                          {tooltipContent.simpleGenotypeInfo[0].count} (
                          {tooltipContent.simpleGenotypeInfo[0].percentage}%)
                        </span>
                      ) : tooltipContent.simpleGenotypeInfo.length > 1 &&
                        tooltipContent.simpleGenotypeInfo[1].type === "H58" ? (
                        <span>
                          {tooltipContent.simpleGenotypeInfo[1].type}:{" "}
                          {tooltipContent.simpleGenotypeInfo[1].count} (
                          {tooltipContent.simpleGenotypeInfo[1].percentage}%)
                        </span>
                      ) : (
                        <span>H58: 0 (0%)</span>
                      )}
                    </div>
                  )}
                  {tooltipContent.mdrInfo && (
                    <div className="additional-info">
                      <span>
                        MDR: {tooltipContent.mdrInfo.count} (
                        {tooltipContent.mdrInfo.percentage}%)
                      </span>
                    </div>
                  )}
                  {tooltipContent.stadInfo && (
                    <div className="additional-info">
                      <span>
                        Susceptible: {tooltipContent.stadInfo.count} (
                        {tooltipContent.stadInfo.percentage}%)
                      </span>
                    </div>
                  )}
                  {tooltipContent.xdrInfo && (
                    <div className="additional-info">
                      <span>
                        XDR: {tooltipContent.xdrInfo.count} (
                        {tooltipContent.xdrInfo.percentage}%)
                      </span>
                    </div>
                  )}
                  {tooltipContent.azInfo && (
                    <div className="additional-info">
                      <span>
                        AzithR: {tooltipContent.azInfo.count} (
                        {tooltipContent.azInfo.percentage}%)
                      </span>
                    </div>
                  )}
                  {tooltipContent.cipIInfo && (
                    <div className="additional-info">
                      <span>
                        CipI/R: {tooltipContent.cipIRInfo.count} (
                        {tooltipContent.cipIRInfo.percentage}%)
                      </span>
                    </div>
                  )}
                  {tooltipContent.cipRInfo && (
                    <div className="additional-info">
                      <span>
                        CipR: {tooltipContent.cipRInfo.count} (
                        {tooltipContent.cipRInfo.percentage}%)
                      </span>
                    </div>
                  )}
                  {!tooltipContent.xdrInfo &&
                    !tooltipContent.mdrInfo &&
                    !tooltipContent.stadInfo &&
                    !tooltipContent.azInfo &&
                    !tooltipContent.cipIInfo &&
                    !tooltipContent.cipRInfo &&
                    !tooltipContent.simpleGenotypeInfo &&
                    !tooltipContent.genotypeInfo &&
                    !tooltipContent.additionalInfo && (
                      <div className="additional-info">
                        <span>
                          {tooltipContent.smallerThan20
                            ? "0%"
                            : "Insufficient data"}
                        </span>
                      </div>
                    )}
                </div>
              )}
            </ReactTooltip>
          </div>
        </div>
        {/* Chart Wrapper */}
        <div className="chart-wrapper">
          <h2 className="showing-data">
            Now showing: {dataset} data from{" "}
            {actualCountry === "All" ? "all countries" : actualCountry} from{" "}
            {actualTimeInitial} to {actualTimeFinal}
          </h2>
          <div
            className="country-region-div"
            style={{ flexDirection: dimensions.width > 560 ? "row" : "column" }}
          >
            {/* Select country dropdown */}
            <FormControl className={classes.formControlSelectCountryRegion}>
              <label className="select-country-label">
                Select country (or click map)
              </label>
              <Select
                value={actualCountry}
                onChange={(evt) => {
                  setActualCountry(evt.target.value);
                }}
                fullWidth
                className={classes.selectCountry}
              >
                {countriesForFilter.map((country, index) => {
                  return (
                    <MenuItem
                      key={index + "countriesFilter"}
                      className={classes.selectCountryValues}
                      value={country}
                    >
                      {country}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {dimensions.width > 560 && (
              <div className="country-region-spacer"></div>
            )}
            {/* Select region dropdown */}
            {/* <FormControl className={`${classes.formControlSelectCountryRegion}`}>
              <label className="select-country-label">Select region</label>
              <Select
                value={actualRegion}
                onChange={evt => { setActualRegion(evt.target.value) }}
                fullWidth
                className={classes.selectCountry}
              >
                {regionsForFilter.map((region, index) => {
                  return (
                    <MenuItem key={index + "regionFilter"} className={classes.selectCountryValues} value={region}>
                      {region}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl> */}
          </div>
          {/* Charts */}
          <div className="chart-wrapper-div">
            <div
              className="chart-wrapper-div2"
              style={{
                flexDirection: dimensions.width > desktop ? "row" : "column",
                paddingBottom: dimensions.width > desktop ? 20 : 0,
              }}
            >
              <div
                className="chart-wrapper-div3"
                style={{ paddingRight: dimensions.width < mobile ? 0 : 10 }}
              >
                {/* Resistance frequencies within genotypes CHART */}
                <div className="chart-wrapper-RFWA">
                  <div className="chart-wrapper-RFWA-div">
                    <span className="chart-title chart-wrapper-RFWA-title">
                      Resistance frequencies within genotypes
                    </span>
                    {/* Download chart */}
                    <div className="chart-wrapper-RFWA-download">
                      <TooltipMaterialUI
                        title={
                          <span className="my-font">Download Chart as PNG</span>
                        }
                        placement="right"
                      >
                        <div
                          className={`button ${captureControlChartRFWGInProgress && "disabled"
                            }`}
                          onClick={() => {
                            if (!captureControlChartRFWGInProgress)
                              capturePicture("RFWG", 1, {
                                mapView: mapView,
                                dataset: dataset,
                                actualTimePeriodRange: [
                                  actualTimeInitial,
                                  actualTimeFinal,
                                ],
                                country: actualCountry,
                                region: actualRegion,
                                RFWGCount: RFWGValues.length,
                              });
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartRFWGInProgress && (
                        <CustomCircularProgress size={44} thickness={4} />
                      )}
                    </div>
                  </div>
                  {/* Labels */}
                  <span className="chart-title chart-wrapper-RFWA-top">
                    Top Genotypes (up to {RFWGValues.length})
                  </span>
                  <div
                    className="chart-wrapper-RFWA-view"
                    style={{ width: dimensions.width > 790 ? "71%" : "260px" }}
                  >
                    <div className="chart-wrapper-DRT-view-drugs">
                      <div className="chart-wrapper-DRT-view-drugs-label">
                        Data view
                      </div>
                      <IconTooltip
                        title={
                          <div className={classes.tooltipTitle}>
                            Select up to 7 genotypes
                          </div>
                        }
                        placement="top"
                      >
                        <IconButton className={classes.tooltipButton}>
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            size="xs"
                            className={classes.tooltipIcon}
                          />
                        </IconButton>
                      </IconTooltip>
                    </div>
                    {/* Data view dropdown */}
                    <FormControl
                      fullWidth
                      className={classes.formControlSelect}
                    >
                      <DropDownSelect
                        options={RFWGFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[
                          {
                            value: RFWGFilterOptions[RFWGFilter - 1].value,
                            id: RFWGFilter,
                          },
                        ]}
                        onChange={(evt) => {
                          setRFWGFilter(evt[0].id);
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                    {/* Genotypes select dropdown */}
                    <FormControl
                      id="DDS2"
                      fullWidth
                      className={classes.formControlSelect}
                    >
                      <DropDownSelect
                        options={RFWGDropdownOptions}
                        multi={true}
                        searchable={false}
                        clearable={true}
                        separator={true}
                        labelField={"label"}
                        values={RFWGDropdownOptions.slice(0, 5)}
                        className="dropdown-select"
                        contentRenderer={({ props, state }) => {
                          return (
                            <div className="chart-wrapper-DRT-view-drugs-select">
                              {state.values.length} of {props.options.length}{" "}
                              Selected
                            </div>
                          );
                        }}
                        itemRenderer={({
                          item,
                          itemIndex,
                          props,
                          state,
                          methods,
                        }) => {
                          return (
                            <div
                              key={item[props.valueField]}
                              onClick={() => {
                                if (RFWGValues.length >= 7) {
                                  if (methods.isSelected(item)) {
                                    methods.addItem(item);
                                  }
                                } else {
                                  methods.addItem(item);
                                }
                              }}
                            >
                              <div className="chart-wrapper-DRT-view-drugs-select-options">
                                <input
                                  type="checkbox"
                                  checked={methods.isSelected(item)}
                                  onChange={() => { }}
                                />
                                &nbsp;&nbsp;&nbsp;{item[props.labelField]}
                              </div>
                            </div>
                          );
                        }}
                        clearRenderer={({ props, state, methods }) => {
                          return (
                            <Buttons>
                              {state.values.length > 0 ? (
                                <ButtonClearSelect
                                  id="DSButton2"
                                  className="clear"
                                  onClick={methods.clearAll}
                                  checked={false}
                                >
                                  Clear all
                                </ButtonClearSelect>
                              ) : (
                                <ButtonClearSelect
                                  id="DSButton2"
                                  onClick={() => {
                                    methods.selectAll(
                                      RFWGDropdownOptions.slice(0, 5)
                                    );
                                  }}
                                  checked={true}
                                >
                                  Reset
                                </ButtonClearSelect>
                              )}
                            </Buttons>
                          );
                        }}
                        onChange={(values) => {
                          setRFWGValues(values);
                        }}
                      />
                    </FormControl>
                  </div>
                  <div id="RFWG">{plotDrugsAndGenotypesChart}</div>
                </div>
                {/* Resistance determinants within genotypes CHART */}
                <div className="chart-wrapper-RDWAG">
                  <div className="chart-wrapper-RDWAG-div">
                    <span className="chart-title chart-wrapper-RDWAG-title">
                      Resistance determinants within genotypes
                    </span>
                    {/* Download chart */}
                    <div className="chart-wrapper-RDWAG-download">
                      <TooltipMaterialUI
                        title={
                          <span className="my-font">Download Chart as PNG</span>
                        }
                        placement="right"
                      >
                        <div
                          className={`button ${captureControlChartRFWAGInProgress && "disabled"
                            }`}
                          onClick={() => {
                            if (!captureControlChartRFWAGInProgress)
                              capturePicture("RFWAG", 4, {
                                mapView: mapView,
                                dataset: dataset,
                                actualTimePeriodRange: [
                                  actualTimeInitial,
                                  actualTimeFinal,
                                ],
                                country: actualCountry,
                                amrClassFilter: amrClassFilter,
                                region: actualRegion,
                              });
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartRFWAGInProgress && (
                        <CustomCircularProgress size={44} thickness={4} />
                      )}
                    </div>
                  </div>
                  {/* Labels */}
                  <span className="chart-title chart-wrapper-RDWAG-top">
                    Top Genotypes (up to 10)
                  </span>
                  <div
                    className="chart-wrapper-RDWAG-view"
                    style={{
                      width: dimensions.width > desktop ? "71%" : "90%",
                    }}
                  >
                    <InputLabel className={classes.inputLabel}>
                      Select Drug Class
                    </InputLabel>
                    {/* Drug class dropdown */}
                    <FormControl
                      fullWidth
                      className={classes.formControlSelect}
                    >
                      <DropDownSelect
                        options={amrClassFilterforFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[
                          {
                            value: amrClassFilter,
                            id: amrClassFilterforFilterOptions.find(
                              (o) => o.value === amrClassFilter
                            ).id,
                          },
                        ]}
                        onChange={(evt) => {
                          setAmrClassFilter(evt[0].value);
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                    <InputLabel className={classes.inputLabel}>
                      Data view
                    </InputLabel>
                    {/* Data view dropdown */}
                    <FormControl
                      fullWidth
                      className={classes.formControlSelect}
                    >
                      <DropDownSelect
                        options={amrClassFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[
                          {
                            value:
                              amrClassFilterOptions[RDWAGDataviewFilter - 1]
                                .value,
                            id: RDWAGDataviewFilter,
                          },
                        ]}
                        onChange={(evt) => {
                          setRDWAGDataviewFilter(evt[0].id);
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                  </div>
                  <div id="RFWAG">{plotAmrClassChart}</div>
                </div>
              </div>
              <div
                className="chart-wrapper-div3"
                style={{
                  paddingLeft: dimensions.width < mobile ? 0 : 10,
                  marginTop: dimensions.width < desktop ? 50 : 0,
                }}
              >
                {/* Drug resistance trends CHART */}
                <div className="chart-wrapper-DRT">
                  <div className="chart-wrapper-DRT-div">
                    <span className="chart-title chart-wrapper-DRT-title">
                      Drug resistance trends
                    </span>
                    {/* Download button */}
                    <div className="chart-wrapper-DRT-download">
                      <TooltipMaterialUI
                        title={
                          <span className="my-font">Download Chart as PNG</span>
                        }
                        placement="right"
                      >
                        <div
                          className={`button ${captureControlChartDRTInProgress && "disabled"
                            }`}
                          onClick={() => {
                            if (!captureControlChartDRTInProgress)
                              capturePicture("DRT", 2, {
                                mapView: mapView,
                                dataset: dataset,
                                actualTimePeriodRange: [
                                  actualTimeInitial,
                                  actualTimeFinal,
                                ],
                                country: actualCountry,
                                drugs: trendValues,
                                region: actualRegion,
                              });
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartDRTInProgress && (
                        <CustomCircularProgress size={44} thickness={4} />
                      )}
                    </div>
                  </div>
                  {/* Labels */}
                  <span className="chart-title chart-wrapper-RFWA-top">
                    Data are plotted for years with N ≥ 10 genomes
                  </span>
                  {dimensions.width > desktop && (
                    <span className="chart-title"></span>
                  )}
                  <div
                    className="chart-wrapper-DRT-view"
                    style={{ width: dimensions.width > 790 ? "71%" : "260px" }}
                  >
                    <div className="chart-wrapper-DRT-view-drugs">
                      <div className="chart-wrapper-DRT-view-drugs-label">
                        Drugs view
                      </div>
                    </div>
                    {/* Drugs dropdown */}
                    <FormControl
                      id="DDS"
                      fullWidth
                      className={classes.formControlSelect}
                    >
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
                              {state.values.length} of {props.options.length}{" "}
                              Selected
                            </div>
                          );
                        }}
                        itemRenderer={({
                          item,
                          itemIndex,
                          props,
                          state,
                          methods,
                        }) => (
                          <div
                            key={item[props.valueField]}
                            onClick={() => methods.addItem(item)}
                          >
                            <div className="chart-wrapper-DRT-view-drugs-select-options">
                              <input
                                type="checkbox"
                                checked={methods.isSelected(item)}
                                onChange={() => { }}
                              />
                              &nbsp;&nbsp;&nbsp;{item[props.labelField]}
                            </div>
                          </div>
                        )}
                        clearRenderer={({ props, state, methods }) => {
                          return (
                            <Buttons>
                              {methods.areAllSelected() ? (
                                <ButtonClearSelect
                                  id="DSButton"
                                  className="clear"
                                  onClick={methods.clearAll}
                                  checked={false}
                                >
                                  Clear all
                                </ButtonClearSelect>
                              ) : (
                                <ButtonClearSelect
                                  id="DSButton"
                                  onClick={methods.selectAll}
                                  checked={true}
                                >
                                  Select all
                                </ButtonClearSelect>
                              )}
                            </Buttons>
                          );
                        }}
                        onChange={(values) => {
                          const doc = document.getElementById("DRT");
                          const lines =
                            doc.getElementsByClassName("recharts-line");
                          for (let index = 0; index < lines.length; index++) {
                            const isValue = values.some((e) => e.id === index);
                            lines[index].style.display = isValue
                              ? "block"
                              : "none";
                          }
                          setTrendValues(values);
                        }}
                      />
                    </FormControl>
                  </div>
                  <div id="DRT">{plotDrugTrendsChart}</div>
                </div>
                {/* Genotype distribution CHART */}
                <div className="chart-wrapper-GD">
                  <div className="chart-wrapper-GD-div">
                    <span className="chart-title chart-wrapper-GD-title">
                      Genotype distribution
                    </span>
                    {/* Download chart */}
                    <div className="chart-wrapper-GD-download">
                      <TooltipMaterialUI
                        title={
                          <span className="my-font">Download Chart as PNG</span>
                        }
                        placement="right"
                      >
                        <div
                          className={`button ${captureControlChartGDInProgress && "disabled"
                            }`}
                          onClick={() => {
                            if (!captureControlChartGDInProgress)
                              capturePicture("GD", 3, {
                                mapView: mapView,
                                dataset: dataset,
                                actualTimePeriodRange: [
                                  actualTimeInitial,
                                  actualTimeFinal,
                                ],
                                country: actualCountry,
                                region: actualRegion,
                              });
                          }}
                        >
                          <FontAwesomeIcon icon={faCamera} size="sm" />
                        </div>
                      </TooltipMaterialUI>
                      {captureControlChartGDInProgress && (
                        <CustomCircularProgress size={44} thickness={4} />
                      )}
                    </div>
                  </div>
                  {dimensions.width > desktop && (
                    <span className="chart-title chart-wrapper-GD-space"></span>
                  )}
                  <div
                    className="chart-wrapper-GD-view"
                    style={{
                      paddingTop: dimensions.width > desktop ? "67px" : "",
                      width: dimensions.width > desktop ? "71%" : "90%",
                    }}
                  >
                    <InputLabel className={classes.inputLabel}>
                      Data view
                    </InputLabel>
                    {/* Data view dropdown */}
                    <FormControl
                      fullWidth
                      className={classes.formControlSelect}
                    >
                      <DropDownSelect
                        options={populationStructureFilterOptions}
                        searchable={false}
                        labelField={"value"}
                        values={[
                          {
                            value:
                              populationStructureFilterOptions[
                                populationStructureFilter - 1
                              ].value,
                            id: populationStructureFilter,
                          },
                        ]}
                        onChange={(evt) => {
                          setPopulationStructureFilter(evt[0].id);
                        }}
                        className="dropdown-select"
                      />
                    </FormControl>
                  </div>
                  <div id="GD">{plotPopulationStructureChart}</div>
                </div>
              </div>
            </div>
            {/* Download spreadsheet and report wrappper */}
            <div
              className="wrapper-download-sheet-button"
              style={{
                flexDirection: dimensions.width > desktop ? "row" : "column",
                padding:
                  dimensions.width < desktop
                    ? "0px 12px 12px 12px"
                    : "50px 12px 12px 12px",
                width: "-webkit-fill-available",
              }}
            >
              {/* Download spreadsheet */}
              <TooltipMaterialUI
                title={
                  <span className="my-font">
                    Genome line list - including source information,
                    genome-derived AMR and genotype information, and citations
                    for each genome; pulled from Pathogenwatch.
                  </span>
                }
                placement="top"
              >
                <div
                  className="download-sheet-button"
                  onClick={() => dowloadBaseSpreadsheet()}
                >
                  <FontAwesomeIcon icon={faTable} style={{ marginRight: 8 }} />
                  <span>Download database (CSV format, 7.2MB)</span>
                </div>
              </TooltipMaterialUI>
              {/* Download report */}
              <div
                style={{
                  marginTop: dimensions.width > desktop ? 0 : 20,
                  marginLeft: dimensions.width > desktop ? 20 : 0,
                }}
                className={`download-sheet-button`}
                onClick={() => {
                  if (!captureReportInProgress) {
                    setCaptureReportInProgress(true);
                    capturePicture("", 5, {
                      mapView: mapView,
                      dataset: dataset,
                      actualTimePeriodRange: [
                        actualTimeInitial,
                        actualTimeFinal,
                      ],
                      country: actualCountry,
                      region: actualRegion,
                      amrClassFilter: amrClassFilter,
                      actualGenomes: actualGenomes,
                      drugs: trendValues,
                      dimensions: dimensions,
                      desktop: desktop,
                      RFWGCount: RFWGValues.length,
                      PMID: countryPMID,
                    });
                  }
                }}
              >
                <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: 8 }} />
                <span>Download report from current view</span>
                {captureReportInProgress && (
                  <div
                    style={{
                      position: "absolute",
                      paddingBottom: 32,
                      paddingRight: 20,
                    }}
                  >
                    <CustomCircularProgress
                      size={44}
                      thickness={4}
                      style={{
                        position: "absolute",
                        top: -5,
                        left: -6,
                        color: "white",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* About info */}
        <div className="about-wrapper">
          <h2>About TyphiNET</h2>
          <p>
            The TyphiNET dashboard collates antimicrobial resistance (AMR) and
            genotype (lineage) information extracted from whole genome sequence
            (WGS) data from the bacterial pathogen <i> Salmonella</i> Typhi, the
            agent of typhoid fever.
          </p>
          <p>
            AMR determinants identified in the genome assemblies using
            Pathogenwatch are used to define drug resistance variables as
            follows.Multidrug resistance(MDR): resistance determinants for
            chloramphenicol (<i>catA1</i> or <i>cmlA</i>), ampicillin (
            <i>bla</i>TEM-1D, <i>bla</i>OXA-7), and co-trimoxazole (at least one{" "}
            <i>dfrA</i> gene and at least one <i>sul</i> gene). Ciprofloxacin
            non-susceptible (CipI/R): one or more of the quinolone resistance
            determining region(QRDR) mutations at <i>gyrA</i>-83, <i>gyrA</i>
            -87, <i>parC</i>-80, <i>parC</i>-84, <i>gyrB</i>-464 or presence of
            a plasmid - mediated quinolone resistance(PMQR) gene(<i>qnrB</i>,{" "}
            <i>qnrD</i> , <i>qnrS</i>). Ciprofloxacin resistant (CipR): QRDR
            triple mutant (<i>gyrA</i>-83 and <i>gyrA</i>-87, together with
            either <i>parC</i>-80 or <i>parC</i>-84), or plasmid - mediated
            quinolone resistance(PMQR) together with <i>gyrA</i>-83, <i>gyrA</i>
            -87 and/or <i>gyrB</i>-464. Third - generation cephalosporin
            resistance (3 GCR): presence of an extended - spectrum
            beta-lactamase(ESBL) (<i>bla</i>CTX-M-12, <i>bla</i>CTX-M-15,{" "}
            <i>bla</i>CTX-M-23, <i>bla</i>CTX-M-55, <i>bla</i>SHV-12) or{" "}
            <i>ampC</i> gene.Extreme drug resistance(XDR): MDR plus CipR plus 3
            GCR. Azithromycin resistance(AziR): mutation at <i>acrB</i>-717
            and/or gene <i>ereA</i>. See{" "}
            <a
              href="https://www.nature.com/articles/s41467-021-23091-2"
              target="_blank"
              rel="noreferrer"
            >
              Argimon et al, 2021
            </a>{" "}
            for details.
          </p>
          <p>
            <b>Data:</b> Data are sourced regularly from Typhi{" "}
            <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>
            , and filtered to include only genomes from unbiased sampling frames
            (e.g. routine or project - based enteric fever surveillance, as
            opposed to AMR - focused sampling), based on curation by the {" "}
            <a href="https://www.typhoidgenomics.org/" target="_blank" rel="noreferrer">
              Global Typhoid Genomics Consortium
            </a>. 
            The database can be downloaded using the button below.
            <p>
            <b>Documentation:</b> Full documentation for the dashboard is available {" "}
            <a href="https://github.com/zadyson/TyphiNET/wiki" target="_blank" rel="noreferrer">
              here
            </a>.
            </p>
            Information on genotype definitions can be found in{" "}
            <a
              href="https://academic.oup.com/jid/article/224/Supplement_7/S775/6358992?login=true"
              target="_blank"
              rel="noreferrer"
            >
              Dyson & Holt, 2021
            </a>
            .
          </p>
          <p>
            <b>Team:</b> The TyphiNET dashboard is coordinated by {" "}
            <a href="https://scholar.google.com.au/citations?hl=en&user=klhFnE0AAAAJ" target="_blank" rel="noreferrer">
              Dr Zoe Dyson
            </a>
            , {" "}
            <a href="https://scholar.google.com.au/citations?hl=en&user=O2dcz5MAAAAJ" target="_blank" rel="noreferrer">
              Dr Louise Cerdeira
            </a>
             &amp; {" "}
            <a href="https://holtlab.net/" target="_blank" rel="noreferrer">
              Prof Kat Holt
            </a>
             , with support from  the Wellcome Trust (Open Research Fund, 219692/Z/19/Z),
             the European Union's Horizon 2020 research and innovation programme under the Marie
            Sklodowska-Curie grant agreement No 845681.
            <img
              className="euFlagImage"
              src={euFlagImg}
              alt="EU_FLAG"
              height="20"
            />
            , the{" "}
            <a href="https://www.lshtm.ac.uk/" target="_blank" rel="noreferrer">
              London School of Hygiene and Tropical Medicine
            </a>{" "}
            &amp;{" "}
            <a href="https://www.monash.edu/" target="_blank" rel="noreferrer">
              Monash University
            </a>
            .
          </p>
        </div>
        {/* Footer */}
        <div className="footer-buttons-wrapper">
          {/* Contact Button */}
          <div
            className="flex-button"
            onClick={() => {
              window.open("mailto:dashboard@typhi.net", "_blank");
            }}
          >
            <FontAwesomeIcon icon={faEnvelope} className="fontawesome-icon" />
            <span>Contact</span>
          </div>
          {/* Documentation Button */}
          <div
            className="flex-button"
            onClick={() => {
              window.open("https://github.com/zadyson/TyphiNET/wiki", "_blank");
            }}
          >
            <FontAwesomeIcon icon={faGithub} className="fontawesome-icon" />
            <span>Documentation</span>
          </div>
          {/* Github Button */}
          <div
            className="flex-button"
            onClick={() => {
              window.open("https://github.com/zadyson/TyphiNET", "_blank");
            }}
          >
            <FontAwesomeIcon icon={faGithub} className="fontawesome-icon" />
            <span>GitHub</span>
          </div>
          {/* Twitter Button */}
          <div
            className="flex-button"
            onClick={() => {
              window.open("https://twitter.com/typhinet", "_blank");
            }}
          >
            <FontAwesomeIcon icon={faTwitter} className="fontawesome-icon" />
            <span>Twitter</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="footer">
          <span>
            Data obtained from:{" "}
            <a href="https://pathogen.watch" rel="noreferrer" target="_blank">
              pathogen watch project
            </a>{" "}
            on 21/02/2023.{" "}
            <a href="https://holtlab.net" rel="noreferrer" target="_blank">
              Holt Lab
            </a>
          </span>
        </div>
        {/* FAB reset filters */}
        <div
          className="fab-button"
          style={{ width: dimensions.width < mobile ? "48px" : "56px" }}
        >
          <TooltipMaterialUI
            title={<span className="my-font">Reset Configurations</span>}
            placement="left"
          >
            <Fab
              color="primary"
              aria-label="add"
              size={dimensions.width < mobile ? "medium" : "large"}
              onClick={() => {
                setDataset("All");
                setActualTimeInitial(timeInitial);
                setActualTimeFinal(timeFinal);
                setActualCountry("All");
                setActualRegion("All");
                setMapView("CipI");
                setControlMapPosition({ coordinates: [0, 0], zoom: 1 });
                setPopulationStructureFilter(1);
                setAmrClassFilter(amrClassesForFilter[5]);
                setRDWAGDataviewFilter(2);
                setRFWGFilter(2);
                // setActualContinent("All");
                const text = document.getElementById("DSButton");
                if (text.innerText === "SELECT ALL") {
                  text.click();
                }
                const text2 = document.getElementById("DSButton2");
                if (text2.innerText === "RESET") {
                  text2.click();
                }
              }}
            >
              <FontAwesomeIcon icon={faUndoAlt} size="lg" color="white" />
            </Fab>
          </TooltipMaterialUI>
        </div>
        {/* Loading */}
        {loading && <div className="loading-2">Loading...</div>}
      </div>
      {/* Loading Screen */}
      {appLoading && (
        <div className="loading">
          {dimensions.width > desktop && (
            <img
              className="logoImageMenu-loading"
              src={typhinetLogoImg}
              alt="TyphiNET"
            />
          )}
          <Loader
            className="my-loader"
            type="Circles"
            color="#D91E45"
            height={70}
            width={70}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
