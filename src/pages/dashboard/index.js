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
    var finalFirstChartData = [];
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

      /* FIRST CHART GENERATION */

      if (viewFilter !== 3) {
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
      } else { /* Genotype and AMR Profiles and H58 / Non-H58 */
        if (entry['GENOTYPE_SIMPLE'] === 'H58' || entry['GENOTYPE_SIMPLE'] === 'Non-H58')
          if (!finalFirstChartData.some(e => e.name === entry['GENOTYPE_SIMPLE'])) {
            finalFirstChartData.push({
              name: entry['GENOTYPE_SIMPLE'],
              [entry.GENOTYPE]: 1
            })
          } else {
            var genotypeSimple = finalFirstChartData.find(e => e.name === entry['GENOTYPE_SIMPLE']);
            var genotypeSimpleIndex = finalFirstChartData.findIndex(e => e.name === entry['GENOTYPE_SIMPLE']);

            if (genotypeSimple[entry.GENOTYPE] === undefined) {
              genotypeSimple[entry.GENOTYPE] = 1
            } else {
              genotypeSimple[entry.GENOTYPE] = genotypeSimple[entry.GENOTYPE] + 1
            }
            finalFirstChartData[genotypeSimpleIndex] = genotypeSimple;
          }
      }

      /* SECOND CHART GENERATION */

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

      if (viewFilter === 3) { /* Genotype and AMR Profiles and H58 / Non-H58 */
        if (entry['GENOTYPE_SIMPLE'] === 'H58' || entry['GENOTYPE_SIMPLE'] === 'Non-H58')
          if (!finalSecondChartData.some(e => e.name === entry['GENOTYPE_SIMPLE'])) {
            finalSecondChartData.push({
              name: entry['GENOTYPE_SIMPLE'],
              [entry['amr_category']]: 1
            })
          } else {
            var genotypeSimple = finalSecondChartData.find(e => e.name === entry['GENOTYPE_SIMPLE']);
            var genotypeSimpleIndex = finalSecondChartData.findIndex(e => e.name === entry['GENOTYPE_SIMPLE']);

            if (genotypeSimple[entry['amr_category']] === undefined) {
              genotypeSimple[entry['amr_category']] = 1
            } else {
              genotypeSimple[entry['amr_category']] = genotypeSimple[entry['amr_category']] + 1
            }
            finalSecondChartData[genotypeSimpleIndex] = genotypeSimple;
          }
      }

      if (viewFilter === 4) { /* Inc Types */
        if (!finalSecondChartData.some(e => e.name === entry.YEAR)) {
          finalSecondChartData.push({
            name: entry.YEAR,
            [entry['Inc Types']]: 1
          })
        } else {
          var year = finalSecondChartData.find(e => e.name === entry.YEAR);
          var yearIndex = finalSecondChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry['Inc Types']] === undefined) {
            year[entry['Inc Types']] = 1
          } else {
            year[entry['Inc Types']] = year[entry['Inc Types']] + 1
          }
          finalSecondChartData[yearIndex] = year;
        }
      }
    })

    setFirstChartData(finalFirstChartData)
    setSecondChartData(finalSecondChartData)

    setWorldMapSamplesData(finalCountries)
  }

  const mapColorScale = scaleLinear()
    .domain([0, 600])
    .range(["#ffedea", "#ff5233"]);

  const plotFirstChart = () => {
    switch (viewFilter) {
      case 1:
      case 2:
      case 4:
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              width={500}
              height={300}
              data={firstChartData}
              margin={{
                top: 20, left: -20, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                position={{ y: 300 }}
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload, label }) => {
                  if (payload !== null) {
                    if (active) {
                      return (
                        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                          <div style={{ height: 14 }} />
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 325 }}>
                            {payload.reverse().map((item, index) => {
                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "33.33%", marginBottom: 8 }}>
                                  <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px" }} />
                                  <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
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
              <Bar dataKey={'0.0.1'} stackId="a" fill={"#808080"} />
              <Bar dataKey={'0.0.2'} stackId="a" fill={"#808080"} />
              <Bar dataKey={'0.0.3'} stackId="a" fill={"#808080"} />
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
        )
      case 3: /* Genotype and AMR Profiles and H58 / Non-H58 */
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              width={500}
              height={300}
              data={firstChartData}
              margin={{
                top: 20, left: 20, bottom: 5, right: 0
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type={"number"} />
              <YAxis dataKey="name" type={"category"} />
              <Tooltip
                position={{ y: 300 }}
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload, label }) => {
                  if (payload !== null) {
                    if (active) {
                      return (
                        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                          <div style={{ height: 14 }} />
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 400 }}>
                            {payload.reverse().map((item, index) => {
                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "25%", marginBottom: 8 }}>
                                  <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px" }} />
                                  <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
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
              <Bar dataKey={'0.0.1'} stackId="a" fill={"#808080"} />
              <Bar dataKey={'0.0.2'} stackId="a" fill={"#808080"} />
              <Bar dataKey={'0.0.3'} stackId="a" fill={"#808080"} />
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
        )
    }
  }

  const plotSecondChart = () => {
    switch (viewFilter) {
      case 1: /* blaCTX */
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              width={500}
              height={300}
              data={secondChartData}
              margin={{
                top: 20, left: -20, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                position={{ y: 300 }}
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload, label }) => {
                  if (payload !== null) {
                    if (active) {
                      return (
                        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                          <div style={{ height: 14 }} />
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 325 }}>
                            {payload.reverse().map((item, index) => {
                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "33.33%", marginBottom: 8 }}>
                                  <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px" }} />
                                  <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
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
              <Bar dataKey={'1'} stackId="a" fill={"#e34a33"} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 2: /* AMR */
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              width={500}
              height={300}
              data={secondChartData}
              margin={{
                top: 20, left: -20, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                position={{ y: 300 }}
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload, label }) => {
                  if (payload !== null) {
                    if (active) {
                      return (
                        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                          <div style={{ height: 14 }} />
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 325 }}>
                            {payload.reverse().map((item, index) => {
                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "50%", marginBottom: 8 }}>
                                  <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flexShrink: 0 }} />
                                  <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
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
              <Bar dataKey={'No AMR detected'} stackId="a" fill={"#addd8e"} />
              <Bar dataKey={'MDR_DCS'} stackId="a" fill={"#9e9ac8"} />
              <Bar dataKey={'MDR'} stackId="a" fill={"red"} />
              <Bar dataKey={'DCS'} stackId="a" fill={"#6baed6"} />
              <Bar dataKey={'AzithR_MDR'} stackId="a" fill={"#a50f15"} />
              <Bar dataKey={'AzithR_DCS'} stackId="a" fill={"#7a0177"} />
              <Bar dataKey={'AzithR_DCS_MDR'} stackId="a" fill={"#54278f"} />
              <Bar dataKey={'XDR'} stackId="a" fill={"black"} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 3: /* Genotype and AMR Profiles and H58 / Non-H58 */
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              width={500}
              height={300}
              data={secondChartData}
              margin={{
                top: 20, left: 20, bottom: 5, right: 0
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type={"number"} />
              <YAxis dataKey="name" type={"category"} />
              <Tooltip
                position={{ y: 300 }}
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload, label }) => {
                  if (payload !== null) {
                    if (active) {
                      return (
                        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                          <div style={{ height: 14 }} />
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 325 }}>
                            {payload.reverse().map((item, index) => {
                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "50%", marginBottom: 8 }}>
                                  <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flexShrink: 0 }} />
                                  <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
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
              <Bar dataKey={'No AMR detected'} stackId="a" fill={"#addd8e"} />
              <Bar dataKey={'MDR_DCS'} stackId="a" fill={"#9e9ac8"} />
              <Bar dataKey={'MDR'} stackId="a" fill={"red"} />
              <Bar dataKey={'DCS'} stackId="a" fill={"#6baed6"} />
              <Bar dataKey={'AzithR_MDR'} stackId="a" fill={"#a50f15"} />
              <Bar dataKey={'AzithR_DCS'} stackId="a" fill={"#7a0177"} />
              <Bar dataKey={'AzithR_DCS_MDR'} stackId="a" fill={"#54278f"} />
              <Bar dataKey={'XDR'} stackId="a" fill={"black"} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 4: /* Inc Types */
        return (
          <ResponsiveContainer width="90%">
            <BarChart
              width={500}
              height={300}
              data={secondChartData}
              margin={{
                top: 20, left: -20, bottom: 5, right: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                position={{ y: 300 }}
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload, label }) => {
                  if (payload !== null) {
                    if (active) {
                      return (
                        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "solid rgba(0,0,0,0.25) 1px", padding: 16, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24 }}>{label}</span>
                          <div style={{ height: 14 }} />
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: 325 }}>
                            {payload.reverse().map((item, index) => {
                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 8 }}>
                                  <div style={{ backgroundColor: item.fill, height: 18, width: 18, border: "solid rgb(0,0,0,0.75) 0.5px", flexShrink: 0 }} />
                                  <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                    <span style={{ fontFamily: "Montserrat", color: "rgba(0,0,0,0.75)", fontSize: 12 }}>N = {item.value}</span>
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
              {/* <Bar dataKey={'NA'} stackId="a" fill={"#000000"} /> */}
              <Bar dataKey={'IncX1'} stackId="a" fill={"rgb(174,227,154)"} />
              <Bar dataKey={'IncFIA(HI1)'} stackId="a" fill={"rgb(138,35,139)"} />
              <Bar dataKey={'IncFIB(pHCM2)'} stackId="a" fill={"rgb(163,215,30)"} />
              <Bar dataKey={'IncA/C2'} stackId="a" fill={"rgb(69,51,214)"} />
              <Bar dataKey={'IncP1'} stackId="a" fill={"rgb(223,207,231)"} />
              <Bar dataKey={'IncFIA(HI1)/IncHI1A/IncHI1B(R27)'} stackId="a" fill={"rgb(66,69,94)"} />
              <Bar dataKey={'Col(BS512)'} stackId="a" fill={"rgb(251,172,246)"} />
              <Bar dataKey={'IncHI1A/IncHI1B(R27)'} stackId="a" fill={"rgb(34,151,67)"} />
              <Bar dataKey={'IncN'} stackId="a" fill={"rgb(238,83,190)"} />
              <Bar dataKey={'IncHI1B(R27)'} stackId="a" fill={"rgb(68,242,112)"} />
              <Bar dataKey={'p0111'} stackId="a" fill={"rgb(251,45,76)"} />
              <Bar dataKey={'IncHI1A'} stackId="a" fill={"rgb(101,230,249)"} />
              <Bar dataKey={'IncI1'} stackId="a" fill={"rgb(123,44,49)"} />
              <Bar dataKey={'IncY'} stackId="a" fill={"rgb(231,173,121)"} />
              <Bar dataKey={'IncFIB(AP001918)'} stackId="a" fill={"rgb(32,80,46)"} />
              <Bar dataKey={'IncFIB(K)'} stackId="a" fill={"rgb(53,136,209)"} />
              <Bar dataKey={'IncHI2/IncHI2A'} stackId="a" fill={"rgb(115,140,78)"} />
              <Bar dataKey={'Col440I'} stackId="a" fill={"rgb(159,4,252)"} />
              <Bar dataKey={'Col156'} stackId="a" fill={"rgb(244,212,3)"} />
              <Bar dataKey={'Col440II/Col440II'} stackId="a" fill={"rgb(17,160,170)"} />
              <Bar dataKey={'Col440II/Col440II'} stackId="a" fill={"rgb(209,96,99)"} />
              <Bar dataKey={'IncFIA(HI1)/IncHI1A'} stackId="a" fill={"rgb(251,120,16)"} />
              <Bar dataKey={'ColRNAI'} stackId="a" fill={"rgb(91,67,11)"} />
              <Bar dataKey={'ColpVC'} stackId="a" fill={"rgb(248,117,116)"} />
              <Bar dataKey={'IncX3'} stackId="a" fill={"rgb(190,177,231)"} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  const getFirstChartLabel = () => {
    switch (viewFilter) {
      case 1:
      case 2:
      case 4:
        return <span className="y-axis-label-vertical" style={{ marginRight: 8 }}>Number of genotypes</span>
      case 3:
        return <span className="y-axis-label-horizontal">Number of genotypes</span>
    }
  }

  const getSecondChartLabel = () => {
    switch (viewFilter) {
      case 1:
        return <span className="y-axis-label-vertical">Number of genotypes</span>
      case 2:
        return <span className="y-axis-label-vertical" style={{ marginRight: 8 }}>Number of AMR Categories</span>
      case 3:
        return <span className="y-axis-label-horizontal-second-chart" >Number of AMR Categories</span>
      case 4:
        return <span className="y-axis-label-vertical" style={{ marginRight: 8 }}>Number of Inc Types</span>
    }
  }

  const getFirstChartTitle = () => {
    switch (viewFilter) {
      case 1:
      case 2:
      case 3:
      case 4:
        return 'Genotypes'
    }
  }

  const getSecondChartTitle = () => {
    switch (viewFilter) {
      case 1:
        return <span><i>bla</i><sub>CTX-M-15</sub></span>
      case 2:
      case 3:
        return 'AMR Profiles'
      case 4:
        return 'Incompatible Group Types'
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
          <div style={{ display: "flex", flexDirection: "column", padding: 8, alignItems: "center", width: "-webkit-fill-available" }}>
            <span style={{ fontSize: 10 }}>Showing</span>
            {actualCountry ? (
              <span style={{ fontSize: 20, fontWeight: 500 }}>{actualCountry}</span>
            ) : (
                <span style={{ fontSize: 20, fontWeight: 500 }}>All Countries</span>
              )}
          </div>
          <div style={{ display: "flex", flexDirection: window.innerWidth > 767 ? "row" : "column", justifyContent: "space-between" }}>
            <div style={{ width: window.innerWidth > 767 ? "50%" : "100%", display: "flex", flexDirection: "column" }}>
              <span className="chart-title" style={{ marginRight: viewFilter !== 3 ? -22 : -56, marginBottom: viewFilter !== 3 ? -8 : 16 }}>{getFirstChartTitle()}</span>
              <div style={{ height: 300, minHeight: 300, display: "flex", flexDirection: viewFilter !== 3 ? "row" : "column-reverse", alignItems: "center", marginLeft: viewFilter === 3 ? -22 : 0 }}>
                {getFirstChartLabel()}
                {plotFirstChart()}
              </div>
            </div>
            <div style={{ width: window.innerWidth > 767 ? "50%" : "100%", display: "flex", flexDirection: "column" }}>
              <span className="chart-title" style={{ marginRight: viewFilter !== 3 ? -66 : -94, marginBottom: viewFilter !== 3 ? -8 : 16 }}>{getSecondChartTitle()}</span>
              <div style={{ height: 300, minHeight: 300, display: "flex", flexDirection: viewFilter !== 3 ? "row" : "column-reverse", alignItems: "center", marginRight: window.innerWidth > 767 ? viewFilter === 3 ? -14 : -24 : 0 }}>
                {getSecondChartLabel()}
                {plotSecondChart()}
              </div>
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
            <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Population Structure</InputLabel>
            <Select
              fullWidth
              value={1}
              style={{ fontWeight: 600, fontFamily: "Montserrat" }}
            >
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                Genotype
              </MenuItem>
            </Select>
          </FormControl>
          <div style={{ width: 16 }} />
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>AMR</InputLabel>
            <Select
              value={viewFilter}
              fullWidth
              onChange={evt => setViewFilter(evt.target.value)}
              style={{ fontWeight: 600, fontFamily: "Montserrat" }}
            >
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={1}>
                blaCTX-M
              </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={2}>
                AMR Profiles
              </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={3}>
                AMR Profiles (H58 / Non-H58)
              </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={4}>
                Inc Types
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
        <span>Data obtained from: <a href="https://pathogen.watch" target="_blank">pathogen watch project</a> on 05/11/2020.</span>
        <span><a href="https://holtlab.net" target="_blank">Holt Lab</a></span>
      </div>
    </div>
  );
};

export default DashboardPage;