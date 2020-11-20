import './index.css';
import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from "react-simple-maps";
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import ReactTooltip from "react-tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faGlobeAmericas, faUndo } from '@fortawesome/free-solid-svg-icons'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const DashboardPage = () => {
  const classes = useStyles();
  const [worldMapSamplesData, setWorldMapSamplesData] = useState([]);
  const [worldMapComplementaryData, setWorldMapComplementaryData] = useState({});
  const [mapPosition, setMapPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [actualCountry, setActualCountry] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [viewFilter, setViewFilter] = React.useState(1);
  const [timePeriodRange, setTimePeriodRange] = React.useState([1905, 2017]);

  const [firstChartData, setFirstChartData] = useState([])
  const [secondChartData, setSecondChartData] = useState([])

  useEffect(() => {
    axios.get(`https://secure-headland-13061.herokuapp.com/api/v2/filters/all/${timePeriodRange[0]}/${timePeriodRange[1]}`)
      .then((res) => {
        setWorldMapComplementaryData(res.data)
      })
  }, [])

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      axios.get(`https://secure-headland-13061.herokuapp.com/api/v2/filters/${viewFilter}/${actualCountry === null ? "all" : actualCountry}/${timePeriodRange[0]}/${timePeriodRange[1]}`)
        .then((res) => {
          parseData(res.data)
        })
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [viewFilter, timePeriodRange, actualCountry])

  const parseData = (data) => {
    var finalFirstChartData = []; /* GENOTYPE */
    var finalSecondChartData = [];
    var finalCountries = [];

    data.forEach((entry) => {
      if (!finalCountries.some(e => e.name === entry['COUNTRY_ONLY'])) {
        finalCountries.push({
          name: entry['COUNTRY_ONLY'],
          count: 1
        })
      } else {
        var country = finalCountries.find(e => e.name === entry['COUNTRY_ONLY']);
        var countryIndex = finalCountries.findIndex(e => e.name === entry['COUNTRY_ONLY']);

        country.count = country.count + 1

        finalCountries[countryIndex] = country;
      }

      if (!finalFirstChartData.some(e => e.name === entry.YEAR)) {
        finalFirstChartData.push({
          name: entry.YEAR,
          [entry.GENOTYPE]: 1
        })
      } else {
        var year = finalFirstChartData.find(e => e.name === entry.YEAR);
        var yearIndex = finalFirstChartData.findIndex(e => e.name === entry.YEAR);

        if (year[entry.GENOTYPE] === undefined) {
          year[entry.GENOTYPE] = 1
        } else {
          year[entry.GENOTYPE] = year[entry.GENOTYPE] + 1
        }
        finalFirstChartData[yearIndex] = year;
      }

      if (viewFilter === 1) { /* blaCTX */
        if (!finalSecondChartData.some(e => e.name === entry.YEAR)) {
          finalSecondChartData.push({
            name: entry.YEAR,
            [entry['blaCTX-M-15_23']]: 1
          })
        } else {
          var year = finalSecondChartData.find(e => e.name === entry.YEAR);
          var yearIndex = finalSecondChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry['blaCTX-M-15_23']] === undefined) {
            year[entry['blaCTX-M-15_23']] = 1
          } else {
            year[entry['blaCTX-M-15_23']] = year[entry['blaCTX-M-15_23']] + 1
          }
          finalSecondChartData[yearIndex] = year;
        }
      }

      if (viewFilter === 2) { /* AMR */
        if (!finalSecondChartData.some(e => e.name === entry.YEAR)) {
          finalSecondChartData.push({
            name: entry.YEAR,
            [entry['amr_category']]: 1
          })
        } else {
          var year = finalSecondChartData.find(e => e.name === entry.YEAR);
          var yearIndex = finalSecondChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry['amr_category']] === undefined) {
            year[entry['amr_category']] = 1
          } else {
            year[entry['amr_category']] = year[entry['amr_category']] + 1
          }
          finalSecondChartData[yearIndex] = year;
        }
      }
    })

    console.log(finalSecondChartData)

    setFirstChartData(finalFirstChartData)
    setSecondChartData(finalSecondChartData)

    setWorldMapSamplesData(finalCountries)
  }

  const mapColorScale = scaleLinear()
    .domain([0, 200])
    .range(["#ffedea", "#ff5233"]);

  const renderRightChart = () => {
    switch (viewFilter) {
      case 1: /* blaCTX */
        return (
          <ResponsiveContainer>
            <BarChart
              width={500}
              height={300}
              data={secondChartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {/* <Legend /> */}
              <Bar dataKey={'1'} stackId="a" fill={"#e34a33"} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 2: /* AMR */
        return (
          <ResponsiveContainer>
            <BarChart
              width={500}
              height={300}
              data={secondChartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {/* <Legend /> */}
              <Bar dataKey={'No AMR detected'} stackId="a" fill={"#000000"} />
              <Bar dataKey={'MDR_DCS'} stackId="a" fill={"#6a5acd"} />
              <Bar dataKey={'MDR'} stackId="a" fill={"#ff0000"} />
              <Bar dataKey={'DCS'} stackId="a" fill={"#00bfff"} />
              <Bar dataKey={'AzithR_MDR'} stackId="a" fill={"#98fb98"} />
              <Bar dataKey={'AzithR_DCS'} stackId="a" fill={"#6b8e23"} />
              <Bar dataKey={'AzithR_DCS_MDR'} stackId="a" fill={"#2e8b57"} />
              <Bar dataKey={'XDR'} stackId="a" fill={"#e34a33"} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="dashboard">
      <div className="info-wrapper">
        <div className="card">
          <span>Total Genomes</span>
          <span className="value">4281</span>
        </div>
        <div style={{ width: 16 }} />
        <div className="card">
          <span>Total Genotypes</span>
          <span className="value">72</span>
        </div>
      </div>
      <div className="chart-wrapper">
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {actualCountry ? (
            <div style={{ display: "flex", padding: 8, justifyContent: "center", width: "-webkit-fill-available" }}>
              <span>{actualCountry}</span>
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ width: '50%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  width={500}
                  height={300}
                  data={firstChartData}
                  margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {/* <Brush /> */}
                  {/* <Legend layout="vetical" verticalAlign="middle" align="right"/> */}
                  <Bar dataKey={'0.0.1'} stackId="a" fill={"#000000"} />
                  <Bar dataKey={'0.0.2'} stackId="a" fill={"#000000"} />
                  <Bar dataKey={'0.0.3'} stackId="a" fill={"#000000"} />
                  <Bar dataKey={'0.1.0'} stackId="a" fill={"#808080"} />
                  <Bar dataKey={'0.1'} stackId="a" fill={"#808080"} />
                  <Bar dataKey={'0.1.1'} stackId="a" fill={"#808080"} />
                  <Bar dataKey={'1.1.2'} stackId="a" fill={"#ffff00"} />
                  <Bar dataKey={'1.2.1'} stackId="a" fill={"#ffd700"} />
                  <Bar dataKey={'1.2.1'} stackId="a" fill={"#ffd700"} />
                  <Bar dataKey={'2.0.0'} stackId="a" fill={"#32cd32"} />
                  <Bar dataKey={'2'} stackId="a" fill={"#32cd32"} />
                  <Bar dataKey={'2.0.1'} stackId="a" fill={"#32cd32"} />
                  <Bar dataKey={'2.0.2'} stackId="a" fill={"#32cd32"} />
                  <Bar dataKey={'2.1.0'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.1'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.2'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.3'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.5'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.6'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.7'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.8'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.1.9'} stackId="a" fill={"#adff2f"} />
                  <Bar dataKey={'2.2.0'} stackId="a" fill={"#98fb98"} />
                  <Bar dataKey={'2.2.1'} stackId="a" fill={"#98fb98"} />
                  <Bar dataKey={'2.2.2'} stackId="a" fill={"#98fb98"} />
                  <Bar dataKey={'2.2.3'} stackId="a" fill={"#98fb98"} />
                  <Bar dataKey={'2.2.4'} stackId="a" fill={"#98fb98"} />
                  <Bar dataKey={'2.3.1'} stackId="a" fill={"#6b8e23"} />
                  <Bar dataKey={'2.3.2'} stackId="a" fill={"#6b8e23"} />
                  <Bar dataKey={'2.3.3'} stackId="a" fill={"#6b8e23"} />
                  <Bar dataKey={'2.3.4'} stackId="a" fill={"#6b8e23"} />
                  <Bar dataKey={'2.3.5'} stackId="a" fill={"#6b8e23"} />
                  <Bar dataKey={'2.4.0'} stackId="a" fill={"#2e8b57"} />
                  <Bar dataKey={'2.4'} stackId="a" fill={"#2e8b57"} />
                  <Bar dataKey={'2.4.1'} stackId="a" fill={"#2e8b57"} />
                  <Bar dataKey={'2.5.0'} stackId="a" fill={"#006400"} />
                  <Bar dataKey={'2.5'} stackId="a" fill={"#006400"} />
                  <Bar dataKey={'2.5.1'} stackId="a" fill={"#006400"} />
                  <Bar dataKey={'2.5.2'} stackId="a" fill={"#006400"} />
                  <Bar dataKey={'3.0.0'} stackId="a" fill={"#0000cd"} />
                  <Bar dataKey={'3'} stackId="a" fill={"#0000cd"} />
                  <Bar dataKey={'3.0.1'} stackId="a" fill={"#0000cd"} />
                  <Bar dataKey={'3.0.2'} stackId="a" fill={"#0000cd"} />
                  <Bar dataKey={'3.1.0'} stackId="a" fill={"#4682b4"} />
                  <Bar dataKey={'3.1'} stackId="a" fill={"#4682b4"} />
                  <Bar dataKey={'3.1.1'} stackId="a" fill={"#4682b4"} />
                  <Bar dataKey={'3.1.2'} stackId="a" fill={"#4682b4"} />
                  <Bar dataKey={'3.2.1'} stackId="a" fill={"#00bfff"} />
                  <Bar dataKey={'3.2'} stackId="a" fill={"#00bfff"} />
                  <Bar dataKey={'3.2.2'} stackId="a" fill={"#00bfff"} />
                  <Bar dataKey={'3.3.0'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'3.3'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'3.3.1'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'3.3.2'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'3.3.2.Bd1'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'3.3.2.Bd2'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'3.4.0'} stackId="a" fill={"#6a5acd"} />
                  <Bar dataKey={'3.5.0'} stackId="a" fill={"#4b0082"} />
                  <Bar dataKey={'3.5.1'} stackId="a" fill={"#4b0082"} />
                  <Bar dataKey={'3.5.2'} stackId="a" fill={"#4b0082"} />
                  <Bar dataKey={'3.5.3'} stackId="a" fill={"#4b0082"} />
                  <Bar dataKey={'3.5.4'} stackId="a" fill={"#4b0082"} />
                  <Bar dataKey={'4'} stackId="a" fill={"#8b0000"} />
                  <Bar dataKey={'4.1.0'} stackId="a" fill={"#8b0000"} />
                  <Bar dataKey={'4.1'} stackId="a" fill={"#8b0000"} />
                  <Bar dataKey={'4.1.1'} stackId="a" fill={"#8b0000"} />
                  <Bar dataKey={'4.2.0'} stackId="a" fill={"#ff6347"} />
                  <Bar dataKey={'4.2.1'} stackId="a" fill={"#ff6347"} />
                  <Bar dataKey={'4.2.2'} stackId="a" fill={"#ff6347"} />
                  <Bar dataKey={'4.2.3'} stackId="a" fill={"#ff6347"} />
                  <Bar dataKey={'4.3.0'} stackId="a" fill={"#ff0000"} />
                  <Bar dataKey={'4.3.1'} stackId="a" fill={"#ff0000"} />
                  <Bar dataKey={'4.3.1.1'} stackId="a" fill={"#f1b6da"} />
                  <Bar dataKey={'4.3.1.1.P1'} stackId="a" fill={"#000000"} />
                  <Bar dataKey={'4.3.1.2'} stackId="a" fill={"#c51b7d"} />
                  <Bar dataKey={'4.3.1.3'} stackId="a" fill={"#fb8072"} />
                  <Bar dataKey={'4.3'} stackId="a" fill={"#ff0000"} />
                  <Bar dataKey={'3.3'} stackId="a" fill={"#1e90ff"} />
                  <Bar dataKey={'2.2'} stackId="a" fill={"#98fb98"} />
                  <Bar dataKey={'2.3'} stackId="a" fill={"#6b8e23"} />
                  <Bar dataKey={'2'} stackId="a" fill={"#32cd32"} />
                  <Bar dataKey={'3.2'} stackId="a" fill={"#00bfff"} />
                  <Bar dataKey={'4.1'} stackId="a" fill={"#8b0000"} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: 16 }} />
            <div style={{ width: '50%', height: 300 }}>
              {renderRightChart()}
            </div>
          </div>
        </div>
      </div>
      <div className="map-filters-wrapper">
        <div className="map-wrapper">
          <ComposableMap
            data-tip=""
            projectionConfig={{
              rotate: [-10, 0, 0],
              scale: 210,
            }}
            style={{ height: "100%", width: "100%" }}
          >
            <ZoomableGroup
              zoom={mapPosition.zoom}
              center={mapPosition.coordinates}
              onMoveEnd={(position) => {
                setMapPosition(position);
              }}
            >
              <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
              <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
              <Geographies
                geography={"https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const sample = worldMapSamplesData.find(s => s.name === geo.properties.NAME)
                    const d = worldMapComplementaryData[geo.properties.NAME]; /* .NAME || .NAME_LONG */
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        cursor="pointer"
                        fill={sample ? mapColorScale(sample["count"]) : "#F5F4F6"}
                        onClick={() => {
                          if (d !== undefined && sample !== undefined)
                            setActualCountry(geo.properties.NAME)
                        }}
                        onMouseEnter={() => {
                          const { NAME } = geo.properties;
                          if (sample !== undefined && d !== undefined) {
                            setTooltipContent({
                              name: NAME,
                              additionalInfo: {
                                samples: sample.count,
                                genotypes: d.GENOTYPES.TOTAL,
                                H58: d.H58.toFixed(2),
                                MDR: d.MDR.toFixed(2)
                              }
                            });
                          } else {
                            setTooltipContent({
                              name: NAME
                            })
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
          {actualCountry !== null && (
            <div className="map-upper-buttons">
              <div
                className="button"
                onClick={() => {
                  setActualCountry(null)
                }}
              >
                <FontAwesomeIcon icon={faUndo} />
              </div>
            </div>
          )}
          <div className="map-buttons">
            {mapPosition.zoom !== 1 && (
              <div
                className="button"
                onClick={() => setMapPosition({ coordinates: [0, 0], zoom: 1 })}
              >
                <FontAwesomeIcon icon={faGlobeAmericas} />
              </div>
            )}
            <div
              className="button"
              onClick={() => {
                if (mapPosition.zoom >= 4) return;
                setMapPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div
              className="button"
              onClick={() => {
                if (mapPosition.zoom <= 1) return;
                if (mapPosition.zoom / 2 === 1) {
                  setMapPosition({ coordinates: [0, 0], zoom: 1 });
                } else {
                  setMapPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
                }
              }}
            >
              <FontAwesomeIcon icon={faMinus} />
            </div>
          </div>
        </div>
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
                </div>
              )}
            </div>
          )}
        </ReactTooltip>
        <div className="filters">
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>View</InputLabel>
            <Select
              value={viewFilter}
              fullWidth
              onChange={evt => setViewFilter(evt.target.value)}
              style={{ fontWeight: 600, fontFamily: "Montserrat" }}
            >
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                Genotype and blaCTX-M
              </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                Genotype and AMR Profiles
              </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={3}>
                Genotype and AMR Profiles and H58 / Non-H58
              </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={4}>
                Genotype and Inc Types
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        <div style={{ marginLeft: 16, marginRight: 16, marginBottom: 8, marginTop: 8 }}>
          <Typography gutterBottom style={{ fontWeight: 500, fontFamily: "Montserrat", color: "rgb(117,117,117)", fontSize: 13 }}>
            Time Period
          </Typography>
          <Slider
            value={timePeriodRange}
            step={10}
            min={1905}
            max={2017}
            marks
            onChange={(evt, value) => {
              setTimePeriodRange(value)
            }}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <span>Data obtained from: <a>pathogen watch project</a> on 05/11/2020.</span>
        <span>Holt Lab</span>
      </div>
    </div>
  );
};

export default DashboardPage;