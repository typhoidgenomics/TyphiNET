/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CardContent, MenuItem, Select, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './DeterminantsGraphMUI';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Brush
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDeterminantsGraphDrugClass, setDeterminantsGraphView } from '../../../../stores/slices/graphSlice';
import { drugClasses } from '../../../../util/drugs';
import { useEffect, useState } from 'react';
import { colorForDrugClasses, hoverColor } from '../../../../util/colorHelper';
import { setCaptureDRT, setCaptureRFWG, setCaptureRDWG, setCaptureGD } from '../../../../stores/slices/dashboardSlice';


const dataViewOptions = [
  { label: 'Number of genomes', value: 'number', graphLabel: 'Number of occurrences' },
  { label: 'Percentage per genotype', value: 'percentage', graphLabel: '% Genomes' }
];

export const DeterminantsGraph = () => {
  const classes = useStyles();
  const [plotChart, setPlotChart] = useState(() => {});
  const matches500 = useMediaQuery('(max-width:500px)');

  const dispatch = useAppDispatch();
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const genotypesDrugClassesData = useAppSelector((state) => state.graph.genotypesDrugClassesData);
  const determinantsGraphView = useAppSelector((state) => state.graph.determinantsGraphView);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);

  useEffect(() => {
    let genotypeDrugClassesData = structuredClone(genotypesDrugClassesData[determinantsGraphDrugClass] ?? []);
    let cnt = 0;
    genotypeDrugClassesData.map((item) => {
      cnt += item.totalCount;
    });
    // console.log(" genotypeDrugClassesData.length", genotypeDrugClassesData.length, cnt)
    if (cnt <= 0) {
      dispatch(setCaptureRDWG(false));
    } else {
      dispatch(setCaptureRDWG(true));
    }
  }, [genotypesDrugClassesData, determinantsGraphDrugClass]);


  let data = 0;
  useEffect(()=>{
    if(genotypesDrugClassesData[determinantsGraphDrugClass] !== undefined){
      data = genotypesDrugClassesData[determinantsGraphDrugClass].filter((x)=>x.totalCount>0).length;
    }
  },[genotypesDrugClassesData, determinantsGraphDrugClass])
  function getDomain() {
    return determinantsGraphView === 'number' ? undefined : [0, 100];
  }
  function getData() {
    if (determinantsGraphView === 'number') {
      return genotypesDrugClassesData[determinantsGraphDrugClass].filter((x)=>x.totalCount>0);
    }
    const exclusions = ['name', 'totalCount', 'resistantCount'];
    let genotypeDrugClassesDataPercentage = structuredClone(genotypesDrugClassesData[determinantsGraphDrugClass] ?? []);
    genotypeDrugClassesDataPercentage = genotypeDrugClassesDataPercentage.filter((x)=>x.totalCount>0).map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));

      keys.forEach((key) => {
        if(item.totalCount>0)
          item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
      });

      return item;
    });

    return genotypeDrugClassesDataPercentage;
  }

  function getTooltipData(label, payload) {
    const data = genotypesDrugClassesData[determinantsGraphDrugClass].find((item) => item.name === label);

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
          percentage: Number(((count / data.totalCount) * 100).toFixed(2))
        });
      });

      tooltipData.sort((a, b) => a.name.localeCompare(b.name));
      return tooltipData;
    }
  }

  function handleChangeDataView(event) {
    dispatch(setDeterminantsGraphView(event.target.value));
  }

  function handleChangeDrugClass(event) {
    dispatch(setDeterminantsGraphDrugClass(event.target.value));
  }

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
                  {dataViewOptions.find((option) => option.value === determinantsGraphView).label}
                </Label>
              </YAxis>
              {(genotypesDrugClassesData[determinantsGraphDrugClass] ?? []).length > 0 && (
                <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
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
                cursor={data > 0 ? { fill: hoverColor }:false}
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
                          <Typography variant="subtitle1">{`N = ${payload[0].payload.totalCount}`}</Typography>
                        </div>
                        {/* {payload[0].payload.totalCount > 0? */}
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
                        {/* : null} */}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {colorForDrugClasses[determinantsGraphDrugClass]?.map((option, index) => (
                <Bar
                  key={`determinants-bar-${index}`}
                  dataKey={option.name}
                  name={option.name}
                  stackId={0}
                  fill={option.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesDrugClassesData, determinantsGraphView, determinantsGraphDrugClass, matches500]);

  return (
    <CardContent className={classes.determinantsGraph}>
      <div className={classes.selectsWrapper}>
        <div className={classes.selectWrapper}>
          <Typography variant="caption" className={classes.selectLabel}>
            Select drug/class
          </Typography>
          <Select
            className={classes.select}
            value={determinantsGraphDrugClass}
            onChange={handleChangeDrugClass}
            inputProps={{ className: classes.selectInput }}
            MenuProps={{ classes: { list: classes.selectMenu } }}
          >
            {drugClasses.map((option, index) => {
              return (
                <MenuItem key={index + 'determinants-drug-classes'} value={option}>
                  {option === 'Ciprofloxacin NS' ? 'Ciprofloxacin' : option}
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <div className={classes.selectWrapper}>
          <Typography variant="caption" className={classes.selectLabel}>
            Data view
          </Typography>
          <Select
            className={classes.select}
            value={determinantsGraphView}
            onChange={handleChangeDataView}
            inputProps={{ className: classes.selectInput }}
            MenuProps={{ classes: { list: classes.selectMenu } }}
          >
            {dataViewOptions.map((option, index) => {
              return (
                <MenuItem key={index + 'determinants-dataview'} value={option.value}>
                  {option.label}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="RDWG">
          {plotChart}
        </div>
      </div>
    </CardContent>
  );
};
