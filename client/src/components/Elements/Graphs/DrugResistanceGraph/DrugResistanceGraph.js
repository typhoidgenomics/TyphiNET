/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  CardContent,
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useStyles } from './DrugResistanceGraphMUI';
import {
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  LineChart,
  Line,
  Label
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDrugResistanceGraphView } from '../../../../stores/slices/graphSlice';
import { drugsForDrugResistanceGraph } from '../../../../util/drugs';
import { useEffect, useState } from 'react';
import { hoverColor } from '../../../../util/colorHelper';
import { getColorForDrug } from '../graphColorHelper';
import { InfoOutlined } from '@mui/icons-material';

export const DrugResistanceGraph = () => {
  const classes = useStyles();
  const [plotChart, setPlotChart] = useState(() => {});
  const matches500 = useMediaQuery('(max-width:500px)');

  const dispatch = useAppDispatch();
  const drugResistanceGraphView = useAppSelector((state) => state.graph.drugResistanceGraphView);
  const drugsYearData = useAppSelector((state) => state.graph.drugsYearData);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);

  function getData() {
    const exclusions = ['name', 'count'];
    let drugDataPercentage = structuredClone(drugsYearData);
    drugDataPercentage = drugDataPercentage.map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));

      keys.forEach((key) => {
        item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
      });

      return item;
    });

    return drugDataPercentage;
  }

  function getTooltipData(label, payload) {
    const data = drugsYearData.find((item) => item.name === label);

    if (data) {
      const tooltipData = [];

      payload.forEach((item) => {
        // if (item.value === 0) {
        //   return;
        // }

        const count = data[item.name];
        tooltipData.push({
          name: item.name,
          color: item.color,
          count,
          percentage: Number(((count / data.count) * 100).toFixed(2))
        });
      });

      tooltipData.sort((a, b) => b.count - a.count);
      return tooltipData;
    }
  }

  function handleChangeDrugsView({ event = null, all = false }) {
    let newValues = [];

    if (all) {
      if (drugResistanceGraphView.length === drugsForDrugResistanceGraph.length) {
        newValues = [];
      } else {
        newValues = drugsForDrugResistanceGraph.slice();
      }
    } else {
      const {
        target: { value }
      } = event;
      newValues = value;
    }

    newValues.sort((a, b) => a.localeCompare(b));
    dispatch(setDrugResistanceGraphView(newValues));
  }

  useEffect(() => {
    if (canGetData) {
      const doc = document.getElementById('DRT');
      const lines = doc.getElementsByClassName('recharts-line');

      for (let index = 0; index < lines.length; index++) {
          const drug = drugResistanceGraphView[index];
          const hasValue = drugsForDrugResistanceGraph.includes(drug);
          lines[index].style.display = hasValue ? 'block' : 'none';
      }

      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <LineChart data={getData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                tickCount={20}
                allowDecimals={false}
                padding={{ left: 20, right: 20 }}
                dataKey="name"
                // domain={['dataMin', 'dataMax']}
                interval={'preserveStartEnd'}
                tick={{ fontSize: 14 }}
              />
              <YAxis tickCount={6} padding={{ top: 20, bottom: 20 }} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  Resistant (%)
                </Label>
              </YAxis>
              {drugsYearData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />}

              <Legend
                  content={(props) => {
                      const { payload } = props;
                      return (
                          <div className={classes.legendWrapper}>
                              {payload.map((entry, index) => {
                                  const { dataKey, color } = entry;
                                  let dataKeyElement;
                                  if (dataKey === "XDR") {
                                      dataKeyElement = (
                                        <Tooltip title="XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)." placement="top">
                                          <span>XDR</span>
                                          </Tooltip>
                                      );
                                  } else if(dataKey === "MDR"){
                                      dataKeyElement = (
                                        <Tooltip title="MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)" placement="top">
                                          <span>MDR</span>
                                          </Tooltip>
                                      );
                                  }else{
                                      dataKeyElement = dataKey;
                                  }
                                  return (
                                      <div key={`drug-resistance-legend-${index}`} className={classes.legendItemWrapper}>
                                          <Box
                                              className={classes.colorCircle}
                                              style={{ backgroundColor: color }}
                                          />
                                          <Typography variant="caption">{dataKeyElement}</Typography>
                                      </div>
                                  );
                              })}
                          </div>
                      );
                  }}
              />



              <ChartTooltip
                position={{ x: matches500 ? 0 : 60, y: matches500 ? 310 : 410 }}
                cursor={{ fill: hoverColor }}
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

              {drugResistanceGraphView.map((option, index) => (
                <Line
                  key={`drug-resistance-bar-${index}`}
                  dataKey={option}
                  strokeWidth={2}
                  stroke={getColorForDrug(option)}
                  connectNulls
                  type="monotone"
                  activeDot={timeInitial === timeFinal ? true : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugsYearData, drugResistanceGraphView, matches500]);

  return (
    <CardContent className={classes.drugResistanceGraph}>
      <div className={classes.selectWrapper}>
        <div className={classes.labelWrapper}>
          <Typography variant="caption">Select drugs/classes to display</Typography>
          <Tooltip
            title="The resistance frequencies are only shown for years with N≥10 genomes. When the data is insufficient per year to calculate annual frequencies, there are no data points to show."
            placement="top"
          >
            <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
          </Tooltip>
        </div>
        <Select
          className={classes.select}
          multiple
          value={drugResistanceGraphView}
          onChange={(event) => handleChangeDrugsView({ event })}
          displayEmpty
          endAdornment={
            <Button
              variant="outlined"
              className={classes.selectButton}
              onClick={() => handleChangeDrugsView({ all: true })}
              color={drugResistanceGraphView.length === drugsForDrugResistanceGraph.length ? 'error' : 'primary'}
            >
              {drugResistanceGraphView.length === drugsForDrugResistanceGraph.length ? 'Clear All' : 'Select All'}
            </Button>
          }
          inputProps={{ className: classes.selectInput }}
          MenuProps={{ classes: { paper: classes.menuPaper, list: classes.selectMenu } }}
          renderValue={(selected) => (
            <div>{`${selected.length} of ${drugsForDrugResistanceGraph.length} selected`}</div>
          )}
        >
          {drugsForDrugResistanceGraph.map((drug, index) => (
            <MenuItem key={`drug-resistance-option-${index}`} value={drug}>
              <Checkbox checked={drugResistanceGraphView.indexOf(drug) > -1} />
              <ListItemText primary={drug} />
            </MenuItem>
          ))}
        </Select>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="DRT">
          {plotChart}
        </div>
      </div>
    </CardContent>
  );
};
