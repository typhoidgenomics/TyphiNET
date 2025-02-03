import { Box, CardContent, MenuItem, Select, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './DistributionGraphMUI';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Label
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDistributionGraphView, setEndtimeGD, setStarttimeGD, setGenotypesForFilterSelected } from '../../../../stores/slices/graphSlice';
import { getColorForGenotype, hoverColor } from '../../../../util/colorHelper';
import { useEffect, useState } from 'react';
import { SliderSizes } from '../../Slider/SliderSizes';
import { setCaptureDRT, setCaptureRFWG, setCaptureRDWG, setCaptureGD } from '../../../../stores/slices/dashboardSlice';


const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' }
];

export const DistributionGraph = () => {
  const classes = useStyles();
  const [plotChart, setPlotChart] = useState(() => {});
  const [topXGenotypes, setTopXGenotypes] = useState([]);
  const matches500 = useMediaQuery('(max-width:500px)');

  const dispatch = useAppDispatch();
  const distributionGraphView = useAppSelector((state) => state.graph.distributionGraphView);
  const genotypesYearData = useAppSelector((state) => state.graph.genotypesYearData);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const currentSliderValue = useAppSelector((state) => state.graph.currentSliderValue);
  const maxSliderValue = useAppSelector((state) => state.graph.maxSliderValue)

  function getDomain() {
    return distributionGraphView === 'number' ? undefined : [0, 100];
  }

  useEffect(() => {
    let cnt = 0;
    newArray.map((item) => {
      cnt += item.count;
    });

    if (cnt <= 0) {
      dispatch(setCaptureGD(false));
    } else {
      dispatch(setCaptureGD(true));
    }
  }, [genotypesForFilter, genotypesYearData, currentSliderValue]);



  useEffect(() => {
    let mp = new Map(); //mp = total count of a genotype in database(including all years)
    genotypesYearData.forEach((cur) => {
      Object.keys(cur).forEach((it) => {
        if (it !== 'name' && it !== 'count') {
          if (mp.has(it)) {
            mp.set(it, mp.get(it) + cur[it]);
          } else {
            mp.set(it, cur[it]);
          }
        }
      });
    });
    const mapArray = Array.from(mp); //[key, total_count], eg: ['4.3.1.1', 1995]
      const filteredArr = mapArray.filter(item => genotypesForFilter.includes(item[0]));
    // Sort the array based on keys
    filteredArr.sort((a, b) => b[1] - a[1]);
    
    const slicedArray = filteredArr.slice(0, currentSliderValue).map(([key, value]) => key);
    const slicedArrayWithOther = structuredClone(slicedArray);
    const Other = 'Other';
    const insertIndex = slicedArrayWithOther.length; // Index to insert "Other"
    slicedArrayWithOther.splice(insertIndex, insertIndex, Other);
    // console.log("slicedArray", slicedArray)
    dispatch(setGenotypesForFilterSelected(slicedArrayWithOther));
    setTopXGenotypes(slicedArray);
      // dispatch(setColorPallete(generatePalleteForGenotypes(genotypesForFilter)));
  }, [genotypesForFilter, genotypesYearData, currentSliderValue]);

  let newArray = []; //TODO: can be a global value in redux
  let newArrayPercentage = []; //TODO: can be a global value in redux
  const exclusions = ['name', 'count'];
  newArray = genotypesYearData.map((item) => {
    let count = 0;
    for (const key in item) {
      if (!topXGenotypes.includes(key) && !exclusions.includes(key)) {
        count += item[key]; //adding count of all genotypes which are not in topX
      }
    }
    const newItem = { ...item, Other: count };
    return newItem; //return item of genotypesYearData with additional filed 'Other' to newArray
  });
  // console.log("newArray1", newArray)
  let genotypeDataPercentage = structuredClone(newArray);
  newArrayPercentage = genotypeDataPercentage.map((item) => {
    const keys = Object.keys(item).filter((x) => !exclusions.includes(x));
    keys.forEach((key) => {
      item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
    });
    return item;
  });     

  function getData() {
    if (distributionGraphView === 'number') return newArray;
    return newArrayPercentage;
  }
// console.log("newArray", newArray)


  function getTooltipData(label, payload) {

    const data = newArray.find((item) => item.name === label);
    if (data) {
      const tooltipData = [];

      payload.forEach((item) => {
        if (item.value === 0) {
          return;
        }

        const count = data[item.name];
        tooltipData.push({
          name: item.name,
          color: item.color,
          count,
          percentage: Number(((count / data.count) * 100).toFixed(2))
        });
      });
      tooltipData.filter((item) => topXGenotypes.includes(item.label) || item.label === 'Other');
      // setCurrentTooltip(value);
      // dispatch(setResetBool(false));
      return tooltipData;

    }
  }

  function handleChangeDataView(event) {
    dispatch(setDistributionGraphView(event.target.value));
  }

  useEffect(() => {
    if (genotypesYearData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = genotypesYearData[0]?.name; // First value in the data
      const endValue = genotypesYearData[genotypesYearData.length - 1]?.name; // Last value in the data

      dispatch(setStarttimeGD(startValue));
      dispatch(setEndtimeGD(endValue));
    }
  }, [genotypesYearData, dispatch]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart data={getData()} maxBarSize={70}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={getDomain()} allowDataOverflow={true} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptions.find((option) => option.value === distributionGraphView).label}
                </Label>
              </YAxis>
              {genotypesYearData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} onChange={(brushRange) => {
                dispatch(setStarttimeGD((genotypesYearData[brushRange.startIndex]?.name)));
                dispatch(setEndtimeGD((genotypesYearData[brushRange.endIndex]?.name))); // if using state genotypesYearData[start]?.name
              }}/>}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        if(!genotypesYearData.length)
                          return null;
                        const { dataKey, color } = entry;
                        return (
                          <div key={`distribution-legend-${index}`} className={classes.legendItemWrapper}>
                            <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                            <Typography variant="caption">{dataKey}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <ChartTooltip
                position={{ x: matches500 ? 0 : 60, y: matches500 ? 310 : 410 }}
                // eslint-disable-next-line eqeqeq
                cursor={genotypesYearData!=0?{ fill: hoverColor }:false}
                wrapperStyle={{ outline: 'none', zIndex: 1 }}
                content={({ payload, active, label }) => {
                  if (payload.length !== 0 && active) {
                    const data = getTooltipData(label, payload);

                    return (
                      <div className={classes.tooltip}>
                        <div className={classes.tooltipTitle}>
                          <Typography variant="h5" fontWeight="600">
                            {label}
                          </Typography>
                          <Typography variant="subtitle1">{`N = ${payload[0].payload.count}`}</Typography>
                        </div>
                        <div className={classes.tooltipContent}>
                          {data.map((item, index) => {
                            return (
                              <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                                <Box
                                  className={classes.tooltipItemBox}
                                  style={{
                                    backgroundColor: item.color
                                  }}
                                />
                                <div className={classes.tooltipItemStats}>
                                  <Typography variant="body2" fontWeight="500" lineHeight={undefined}>
                                    {item.name}
                                  </Typography>
                                  <Typography
                                    fontSize="12px"
                                    noWrap
                                    lineHeight={undefined}
                                  >{`N = ${item.count}`}</Typography>
                                  <Typography
                                    fontSize="10px"
                                    lineHeight={undefined}
                                  >{`${item.percentage}%`}</Typography>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {topXGenotypes.map((option, index) => (
                <Bar
                  key={`distribution-bar-${index}`}
                  dataKey={option}
                  name={option}
                  stackId={0}
                  fill={getColorForGenotype(option)}
                />
              ))}
              <Bar dataKey={'Other'} stackId={0} fill={getColorForGenotype('Other')} />
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesYearData, distributionGraphView, matches500, currentSliderValue, topXGenotypes]);

  return (
    <CardContent className={classes.distributionGraph}>
      <div className={classes.selectWrapper}>
        {/* <SliderSizes value={'GD'} /> */}
        <Typography variant="caption" className={classes.selectLabel}>
          Data view
        </Typography>
        <Select
          className={classes.select}
          value={distributionGraphView}
          onChange={handleChangeDataView}
          inputProps={{ className: classes.selectInput }}
          MenuProps={{ classes: { list: classes.selectMenu } }}
        >
          {dataViewOptions.map((option, index) => {
            return (
              <MenuItem key={index + 'distribution-dataview'} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="GD">
          {plotChart}
        </div>
      </div>
    </CardContent>
  );
};
