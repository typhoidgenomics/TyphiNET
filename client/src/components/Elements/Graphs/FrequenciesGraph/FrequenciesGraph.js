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
  useMediaQuery,
  InputAdornment
} from '@mui/material';
import { useStyles } from './FrequenciesGraphMUI';
import { InfoOutlined } from '@mui/icons-material';
import SearchIcon from "@mui/icons-material/Search";
import TextField from '@mui/material/TextField';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Label,
  Legend,
  Brush
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setFrequenciesGraphSelectedGenotypes, setFrequenciesGraphView } from '../../../../stores/slices/graphSlice';
import { useEffect, useState } from 'react';
import { hoverColor } from '../../../../util/colorHelper';
import { getColorForDrug } from '../graphColorHelper';
import { drugs } from '../../../../util/drugs';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage within genotype', value: 'percentage' }
];

export const FrequenciesGraph = () => {
  const classes = useStyles();
  const [plotChart, setPlotChart] = useState(() => {});
  const [searchValue2, setSearchValue2] = useState("")
  const matches500 = useMediaQuery('(max-width:500px)');

  const dispatch = useAppDispatch();
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const frequenciesGraphView = useAppSelector((state) => state.graph.frequenciesGraphView);
  const frequenciesGraphSelectedGenotypes = useAppSelector((state) => state.graph.frequenciesGraphSelectedGenotypes);

  let data = genotypesDrugsData;

  useEffect(()=>{
  dispatch(setFrequenciesGraphSelectedGenotypes(genotypesDrugsData.slice(0, 5).map((x) => x.name)));
  },[genotypesDrugsData ])

    
 
  function getSelectGenotypeLabel(genotype) {
    const percentage = Number(((genotype.Susceptible / genotype.totalCount) * 100).toFixed(2));
    return `${genotype.name} (total N=${genotype.totalCount===0 ? 0:`${genotype.totalCount},${percentage}% Susceptible`})`;

  }

  function getDomain() {
    return frequenciesGraphView === 'number' ? undefined : [0, 100];
  }

  function getData() {
    data = data.filter((genotype) => frequenciesGraphSelectedGenotypes.includes(genotype.name));
    console.log("getData",data)

    if (frequenciesGraphView === 'number') {
      return data;
    }

    const exclusions = ['name', 'totalCount', 'resistantCount'];
    let genotypeDataPercentage = structuredClone(data);
    genotypeDataPercentage = genotypeDataPercentage.map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));

      keys.forEach((key) => {
        item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
      });

      return item;
    });

    return genotypeDataPercentage;
  }

  function handleChangeDataView(event) {
    dispatch(setFrequenciesGraphView(event.target.value));
  }

  function getTooltipData(label, payload) {
    const data = genotypesDrugsData.find((item) => item.name === label);

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

      tooltipData.sort((a, b) => b.count - a.count);
      return tooltipData;
    }
  }

  function handleChangeSelectedGenotypes({ event = null, all = false }) {
    if (all) {
      dispatch(setFrequenciesGraphSelectedGenotypes([]));
      return;
    }

    const {
      target: { value }
    } = event;

    if (frequenciesGraphSelectedGenotypes.length === 7 && value.length > 7) {
      return;
    }
console.log("frequenciesGraphSelectedGenotypes", frequenciesGraphSelectedGenotypes);
    dispatch(setFrequenciesGraphSelectedGenotypes(value));
  }

    function setSearchValue(event){
    event.preventDefault()
    setSearchValue2(event.target.value)
  }

  const filteredData = data.filter((genotype) =>
    genotype.name.includes(searchValue2.toLowerCase()) || genotype.name.includes(searchValue2.toUpperCase())
  );

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart data={getData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={getDomain()} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptions.find((option) => option.value === frequenciesGraphView).label}
                </Label>
              </YAxis>
              {genotypesDrugsData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry;
                        return (
                          <div key={`frequencies-legend-${index}`} className={classes.legendItemWrapper}>
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
                cursor={frequenciesGraphSelectedGenotypes!=0?{ fill: hoverColor }:false}
                wrapperStyle={{ outline: 'none', zIndex: 1 }}
                content={({ payload, active, label }) => {
                  if (payload !== null && active) {
                    const data = getTooltipData(label, payload);

                    return (
                      <div className={classes.tooltip}>
                        <div className={classes.tooltipTitle}>
                          <Typography variant="h5" fontWeight="600">
                            {label}
                          </Typography>
                          <Typography variant="subtitle1">{`N = ${payload[0].payload.totalCount}`}</Typography>
                        </div>
                        {payload[0].payload.totalCount > 0?
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
                        </div>: null}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {drugs.map((option, index) => (
                <Bar key={`frequencies-bar-${index}`} dataKey={option} fill={getColorForDrug(option)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesDrugsData, frequenciesGraphView, frequenciesGraphSelectedGenotypes, matches500]);

  return (
    <CardContent className={classes.frequenciesGraph}>
      <div className={classes.selectsWrapper}>
        <div className={classes.labelWrapper}>
          <Typography variant="caption">Data view</Typography>
          <Tooltip title="Select up to 7 genotypes" placement="top">
            <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
          </Tooltip>
        </div>
        <div className={classes.selectWrapper}>
          <Select
            className={classes.select}
            value={frequenciesGraphView}
            onChange={handleChangeDataView}
            inputProps={{ className: classes.dataViewSelectInput }}
            MenuProps={{ classes: { list: classes.dataViewSelectMenu } }}
          >
            {dataViewOptions.map((option, index) => {
              return (
                <MenuItem key={index + 'frequencies-dataview'} value={option.value}>
                  {option.label}
                </MenuItem>
              );
            })}
          </Select>
          <Select
            className={classes.select}
            multiple
            value={frequenciesGraphSelectedGenotypes}
            onChange={(event) => handleChangeSelectedGenotypes({ event })}
            displayEmpty
            // endAdornment={
            //   <Button
            //     variant="outlined"
            //     className={classes.genotypesSelectButton}
            //     onClick={() => handleChangeSelectedGenotypes({ all: true })}
            //     disabled={frequenciesGraphSelectedGenotypes.length === 0}
            //     color="error"
            //   >
            //     Clear All
            //   </Button>
            // }
            inputProps={{ className: classes.genotypesSelectInput }}
            MenuProps={{ classes: { paper: classes.genotypesMenuPaper, list: classes.genotypesSelectMenu } }}
            renderValue={(selected) => (<div>{`Select genotypes (currently showing ${selected.length} )`}</div>)}
          >
            <TextField 
                size="small"
                autoFocus
                placeholder="Type to search..."
                label="Search genotype" 
                variant="standard" 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="outlined"
                        className={classes.genotypesSelectButton}
                        onClick={() => handleChangeSelectedGenotypes({ all: true })}
                        disabled={frequenciesGraphSelectedGenotypes.length === 0}
                        color="error"
                      >
                        Clear All
                      </Button>
                    </InputAdornment>
                  )
                }}
                sx={{ width:'98%', margin:'0% 1%'}}
                onChange={e => setSearchValue(e)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            {filteredData.map((genotype, index) => (
              <MenuItem key={`frequencies-option-${index}`} value={genotype.name}>
                <Checkbox checked={frequenciesGraphSelectedGenotypes.indexOf(genotype.name) > -1} />
                <ListItemText primary={getSelectGenotypeLabel(genotype)} />
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="RFWG">
          {plotChart}
        </div>
      </div>
    </CardContent>
  );
};
