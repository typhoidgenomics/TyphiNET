import './index.css';
import React, { useEffect, useState } from "react";
import { csv } from "d3-fetch";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from "react-simple-maps";
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import ReactTooltip from "react-tooltip";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const colorScale = scaleLinear()
  .domain([0, 200])
  .range(["#ffedea", "#ff5233"]);

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
  const [worldMapData, setWorldMapData] = useState([]);
  const [actualCountry, setActualCountry] = useState(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [filter1, setFilter1] = React.useState('blaCTX-M');
  const [filter2, setFilter2] = React.useState('COUNTRY_ONLY');
  const [timelineRange, setTimelineRange] = React.useState([1905, 2017]);

  const [firstChartData, setFirstChartData] = useState([])
  const [secondChartData, setSecondChartData] = useState([])
  const [genotypes, setGenotypes] = useState([])
  const [blaCTXs, setBlaCTXs] = useState([])

  const colorScaleFirstChart = scaleLinear()
    .domain([0, 38])
    .range(["#c9eef5", "#2ca25f"]);

  const colorScaleSecondChart = scaleLinear()
    .domain([0, 1])
    .range(["#fee8c8", "#e34a33"]);

  useEffect(() => {
    csv(`/vulnerability.csv`).then((data) => {
      setWorldMapData(data);
    });
  }, []);

  useEffect(() => {
    // if (filter2 !== 'COUNTRY_ONLY') {
    //   setActualCountry(null)
    // }

    if (actualCountry !== null) {
      console.log(filter1, filter2, timelineRange, actualCountry)

      axios.get(`https://secure-headland-13061.herokuapp.com/api/v1/filters/${filter1}/${filter2}/${actualCountry}/${timelineRange[0]}/${timelineRange[1]}`)
        .then((res) => {
          parseData(res.data)
        })
      return;
    }

    if (actualCountry === null) {
      console.log(filter1, filter2, timelineRange, actualCountry)

      axios.get(`https://secure-headland-13061.herokuapp.com/api/v1/filters/${filter1}/${filter2}/${timelineRange[0]}/${timelineRange[1]}`)
        .then((res) => {
          parseData(res.data)
        })
      return;
    }
  }, [filter1, filter2, timelineRange, actualCountry])

  const parseData = (data) => {
    var finalFirstChartData = []; /* GENOTYPE */
    var finalGenotypes = []; /* GENOTYPE */
    var finalSecondChartData = []; /* blaCTX */
    var finalBlaCTX = []; /* GENOTYPE */
    var finalCountries = []; /* GENOTYPE */

    console.log(data)

    // COUNTRY_ONLY: "China"
    // GENOTYPE: "3.1"
    // NAME: "10593_2_18_ChinE02-5919_2002"
    // YEAR: "2002"
    // blaCTX-M-15_23: "0"

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
        finalGenotypes.push(entry.GENOTYPE)
      } else {
        var year = finalFirstChartData.find(e => e.name === entry.YEAR);
        var yearIndex = finalFirstChartData.findIndex(e => e.name === entry.YEAR);

        if (year[entry.GENOTYPE] === undefined) {
          year[entry.GENOTYPE] = 1
          finalGenotypes.push(entry.GENOTYPE)
        } else {
          year[entry.GENOTYPE] = year[entry.GENOTYPE] + 1
        }
        finalFirstChartData[yearIndex] = year;
      }

      if (filter1 === 'blaCTX-M') {
        if (!finalSecondChartData.some(e => e.name === entry.YEAR)) {
          finalSecondChartData.push({
            name: entry.YEAR,
            [entry['blaCTX-M-15_23']]: 1
          })
          finalBlaCTX.push(entry['blaCTX-M-15_23'])
        } else {
          var year = finalSecondChartData.find(e => e.name === entry.YEAR);
          var yearIndex = finalSecondChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry.GENOTYPE] === undefined) {
            year[entry['blaCTX-M-15_23']] = 1
            finalBlaCTX.push(entry['blaCTX-M-15_23'])
          } else {
            year[entry['blaCTX-M-15_23']] = year[entry['blaCTX-M-15_23']] + 1
          }
          finalSecondChartData[yearIndex] = year;
        }
      }

      if (filter1 === 'arm_category') {
        if (!finalSecondChartData.some(e => e.name === entry.YEAR)) {
          finalSecondChartData.push({
            name: entry.YEAR,
            [entry['arm_category']]: 1
          })
          finalblaCTX.push(entry['arm_category'])
        } else {
          var year = finalSecondChartData.find(e => e.name === entry.YEAR);
          var yearIndex = finalSecondChartData.findIndex(e => e.name === entry.YEAR);

          if (year[entry.GENOTYPE] === undefined) {
            year[entry['arm_category']] = 1
            finalblaCTX.push(entry['arm_category'])
          } else {
            year[entry['arm_category']] = year[entry['arm_category']] + 1
          }
          finalSecondChartData[yearIndex] = year;
        }
      }
    })

    // finalFirstChartData.sort(function (a, b) {
    //   return a.YEAR.localeCompare(b.YEAR);
    // });

    // finalSecondChartData.sort(function (a, b) {
    //   return a.YEAR.localeCompare(b.YEAR);
    // });

    console.log(finalFirstChartData)
    console.log(finalSecondChartData)

    setFirstChartData(finalFirstChartData)
    setSecondChartData(finalSecondChartData)
    setWorldMapData(finalCountries)

    setGenotypes([...finalGenotypes])
    setBlaCTXs([...finalBlaCTX])

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
          <span>Total Genotypes (Sort Unique)</span>
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
                  {/* <Legend /> */}
                  <Bar dataKey={'0.0.2'} fill={colorScaleFirstChart(0)} />
                  <Bar dataKey={'0.0.3'} fill={colorScaleFirstChart(1)} />
                  <Bar dataKey={'2'} fill={colorScaleFirstChart(2)} />
                  <Bar dataKey={'2.0.1'} fill={colorScaleFirstChart(3)} />
                  <Bar dataKey={'2.1'} fill={colorScaleFirstChart(4)} />
                  <Bar dataKey={'2.1.5'} fill={colorScaleFirstChart(4)} />
                  <Bar dataKey={'2.1.6'} fill={colorScaleFirstChart(5)} />
                  <Bar dataKey={'2.1.7'} fill={colorScaleFirstChart(6)} />
                  <Bar dataKey={'2.1.8'} fill={colorScaleFirstChart(7)} />
                  <Bar dataKey={'2.1.9'} fill={colorScaleFirstChart(8)} />
                  <Bar dataKey={'2.2'} fill={colorScaleFirstChart(9)} />
                  <Bar dataKey={'2.2.1'} fill={colorScaleFirstChart(10)} />
                  <Bar dataKey={'2.2.2'} fill={colorScaleFirstChart(11)} />
                  <Bar dataKey={'2.2.3'} fill={colorScaleFirstChart(12)} />
                  <Bar dataKey={'2.2.4'} fill={colorScaleFirstChart(13)} />
                  <Bar dataKey={'2.4'} fill={colorScaleFirstChart(14)} />
                  <Bar dataKey={'2.4'} fill={colorScaleFirstChart(15)} />
                  <Bar dataKey={'2.4.1'} fill={colorScaleFirstChart(16)} />
                  <Bar dataKey={'2.4.1'} fill={colorScaleFirstChart(17)} />
                  <Bar dataKey={'2.5.1'} fill={colorScaleFirstChart(18)} />
                  <Bar dataKey={'3'} fill={colorScaleFirstChart(19)} />
                  <Bar dataKey={'3.1'} fill={colorScaleFirstChart(20)} />
                  <Bar dataKey={'3.1.1'} fill={colorScaleFirstChart(21)} />
                  <Bar dataKey={'3.1.2'} fill={colorScaleFirstChart(22)} />
                  <Bar dataKey={'3.2.1'} fill={colorScaleFirstChart(23)} />
                  <Bar dataKey={'3.3'} fill={colorScaleFirstChart(24)} />
                  <Bar dataKey={'3.3.1'} fill={colorScaleFirstChart(24)} />
                  <Bar dataKey={'3.3.2'} fill={colorScaleFirstChart(25)} />
                  <Bar dataKey={'3.3.2.Bd1'} fill={colorScaleFirstChart(26)} />
                  <Bar dataKey={'3.3.2.Bd1'} fill={colorScaleFirstChart(27)} />
                  <Bar dataKey={'3.4'} fill={colorScaleFirstChart(28)} />
                  <Bar dataKey={'3.4'} fill={colorScaleFirstChart(29)} />
                  <Bar dataKey={'3.5.2'} fill={colorScaleFirstChart(30)} />
                  <Bar dataKey={'3.5.3'} fill={colorScaleFirstChart(31)} />
                  <Bar dataKey={'3.5.3'} fill={colorScaleFirstChart(32)} />
                  <Bar dataKey={'3.5.4'} fill={colorScaleFirstChart(33)} />
                  <Bar dataKey={'4.1'} fill={colorScaleFirstChart(34)} />
                  <Bar dataKey={'4.3.1'} fill={colorScaleFirstChart(35)} />
                  <Bar dataKey={'4.3.1.1'} fill={colorScaleFirstChart(36)} />
                  <Bar dataKey={'4.3.1.2'} fill={colorScaleFirstChart(37)} />
                  <Bar dataKey={'4.3.1.3'} fill={colorScaleFirstChart(38)} />

                  {/* {genotypes.map((genotype, index) => {
                    <Bar dataKey={genotype.toString()} fill={colorScaleFirstChart(index)} />
                  })} */}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: 16 }} />
            <div style={{ width: '50%', height: 300 }}>
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
                  <Legend />
                  // <Bar dataKey={'0'} stackId="a" fill={colorScaleSecondChart(0)} />
                  // <Bar dataKey={'1'} stackId="a" fill={colorScaleSecondChart(1)} />
                  {/* {blaCTXs.map((blaCTX, index) => {
                    <Bar dataKey={blaCTX} stackId="a" fill={colorScaleSecondChart(index)} />
                  })} */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div className="map-wrapper">
        <ComposableMap
          data-tip=""
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 210,
          }}
          style={{ height: 400 }}
        >
          <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
          <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
          {worldMapData.length > 0 && (
            <Geographies
              geography={"https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const d = worldMapData.find((s) => s.name === geo.properties.NAME); /* .NAME || .NAME_LONG */
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      cursor="pointer"
                      fill={d ? colorScale(d["count"]) : "#F5F4F6"}
                      onClick={() => {
                        setActualCountry(geo.properties.NAME)
                      }}
                      onMouseEnter={() => {
                        const { NAME, POP_EST } = geo.properties;
                        if (d !== undefined) {
                          setTooltipContent(`${NAME} - ${d.count} Samples`);
                        } else {
                          setTooltipContent(`${NAME}`);
                        }
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
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
          )}
        </ComposableMap>
        <ReactTooltip>{tooltipContent}</ReactTooltip>
        <div className="filters">
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel style={{ fontWeight: 500, fontFamily: "Montserrat" }}>Filter</InputLabel>
            <Select
              value={filter1}
              fullWidth
              onChange={evt => setFilter1(evt.target.value)}
              style={{ fontWeight: 600, fontFamily: "Montserrat" }}
            >
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={'blaCTX-M'}>
                Genotype and blaCTX-M
            </MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={'arm_category'}>
                Genotype and AMR Profiles
            </MenuItem>
            /MenuItem>
              <MenuItem style={{ fontWeight: 600, fontFamily: "Montserrat" }} value={'GENOTYPE_SIMPLE'}>
                H58 vs. Non-H58
            </MenuItem>
            </Select>
          </FormControl>
          <div style={{ width: 16 }} />

        </div>
        <div style={{ marginLeft: 16, marginRight: 16, marginBottom: 8, marginTop: 8 }}>
          <Typography gutterBottom style={{ fontWeight: 500, fontFamily: "Montserrat", color: "rgb(117,117,117)", fontSize: 13 }}>
            Time Period
          </Typography>
          <Slider
            value={timelineRange}
            max={2017}
            min={1905}
            onChange={(evt, value) => {
              setTimelineRange(value)
            }}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <span>Data obtained from: Pathogen Watch project on 05/11/2020.</span>
        <a href="https://holtlab.net/"><span>Holt Lab</span></a>
      </div>
    </div>
  );
};

export default DashboardPage;