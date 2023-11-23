/* eslint-disable react-hooks/exhaustive-deps */
import { Card, CardContent, Typography, useMediaQuery } from '@mui/material';
import { ComposableMap, Geographies, Geography, Graticule, Sphere, ZoomableGroup } from 'react-simple-maps';
import { useStyles } from './MapMUI';
import geography from '../../../assets/world-50m.json';
import { darkGrey, getColorForGenotype, lightGrey, zeroCountColor, zeroPercentColor } from '../../../util/colorHelper';
import { redColorScale, samplesColorScale, sensitiveColorScale, redColorScale2 } from './mapColorHelper';
import ReactTooltip from 'react-tooltip';
import { BottomLeftControls } from './BottomLeftControls';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPosition, setTooltipContent } from '../../../stores/slices/mapSlice.ts';
import { setCountriesForFilter } from '../../../stores/slices/graphSlice.ts';
import { TopRightControls } from './TopRightControls';
import { setActualCountry } from '../../../stores/slices/dashboardSlice.ts';
import { TopLeftControls } from './TopLeftControls';
import { BottomRightControls } from './BottomRightControls';
import { TopRightControls2 } from './TopRightControls2';
import countries from '../../../util/countries';


const statKey = {
  MDR: 'MDR',
  'H58 / Non-H58': 'H58',
  XDR: 'XDR',
  AzithR: 'AzithR',
  CipNS: 'CipNS',
  CipR: 'CipR',
  // Sensitive to all drugs': 'Susceptible'
  'Susceptible to all drugs': 'Susceptible'
};

export const Map = () => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');

  const dispatch = useAppDispatch();
  const position = useAppSelector((state) => state.map.position);
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapView = useAppSelector((state) => state.map.mapView);
  const tooltipContent = useAppSelector((state) => state.map.tooltipContent);
  const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  // const frequenciesGraphSelectedGenotypes = useAppSelector((state) => state.graph.frequenciesGraphSelectedGenotypes);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const ifCustom = useAppSelector((state) => state.map.ifCustom);


  function handleOnClick(NAME) {
    if (NAME !== undefined) {
      dispatch(setActualCountry(NAME));
    }
  }

  function handleOnMouseLeave() {
    dispatch(setTooltipContent(null));
  }

  function handleOnMouseEnter({ geo, countryStats, countryData, smallerThan20 = false, showTooltip = false }) {
    const { NAME } = geo.properties;
    const tooltip = {
      name: NAME,
      content: {},
      smallerThan20
    };
   
    if (countryData !== undefined) {
      switch (mapView) {
        case 'No. Samples':
          const combinedPercentage = ((countryStats[statKey["CipR"]].percentage || 0) + (countryStats[statKey["CipNS"]].percentage || 0));
          Object.assign(tooltip, {
            content: {
              Samples: countryData.count,
              Genotypes: countryStats.GENOTYPE.count,
              H58: `${countryStats.H58.percentage}%`,
              MDR: `${countryStats.MDR.percentage}%`,
              XDR: `${countryStats.XDR.percentage}%`,
              AzithR: `${countryStats.AzithR.percentage}%`,
              CipR: `${countryStats.CipR.percentage}%`,
              // CipNS: `${countryStats.CipNS.percentage}%`,
              CipNS: `${combinedPercentage}%`,
              Susceptible: `${countryStats.Susceptible.percentage}%`
            }
          });
          break;
        case 'Dominant Genotype':
          const genotypes = countryStats.GENOTYPE.items.slice(0, 5);
          genotypes.forEach((genotype) => {
            tooltip.content[genotype.name] = genotype.count;
          });
          break;
        case 'H58 / Non-H58':
        case 'MDR':
        case 'Susceptible to all drugs': // case 'Sensitive to all drugs':
        case 'XDR':
        case 'AzithR':
        case 'CipR':
          if (showTooltip) {
            tooltip.content[statKey[mapView]] = {
              count: countryStats[statKey[mapView]].count,
              percentage: `${countryStats[statKey[mapView]].percentage}%`
            };
          }
          break;
        case 'CipNS':
          if (showTooltip) {
            const combinedCount = (countryStats[statKey["CipR"]].count || 0) + (countryStats[statKey["CipNS"]].count || 0);
            const combinedPercentage = (
              (countryStats[statKey["CipR"]].percentage || 0) + (countryStats[statKey["CipNS"]].percentage || 0));
            tooltip.content['CipNS'] = {
              count: combinedCount,
              percentage: `${combinedPercentage.toFixed(2)}%`
            };
          }

          break;
        case 'Genotype prevalence':
            let percentCounter = 0;        
            const genotypes1 = countryStats.GENOTYPE.items;
            let genotypes2 = [];
            genotypes1.forEach((genotype) => {
               if (customDropdownMapView.includes(genotype.name)){
                  genotypes2.push(genotype);}
                percentCounter += genotype.count;
            });
            genotypes1.forEach((genotype) => {
               if (customDropdownMapView.includes(genotype.name))
                tooltip.content[genotype.name] = `${genotype.count} (${((genotype.count/percentCounter)*100).toFixed(2)} %)`;
            });
            if (genotypes2.length > 0) {
              let sumCount = 0;
              for (const genotype of genotypes2) {
                sumCount += genotype.count;
              }
              if(countryData.count>=20 && genotypes2.length > 1 )
                tooltip.content['All selected genotypes'] = `${sumCount} (${((sumCount/percentCounter)*100).toFixed(2)} %)`;

            }
          break;

        default:
          break;
      }
    }

    dispatch(setTooltipContent(tooltip));
  }

  function handleOnMoveEnd(value) {
    dispatch(setPosition(value));
  }

  function showPercentage() {
    return !['Dominant Genotype','Genotype prevalence','No. Samples'].includes(mapView);
  }

  return (
    <Card className={classes.card} elevation={2}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" fontWeight={'bold'}>
          Global Overview{' '}
          <span>
            of <i>{globalOverviewLabel.italicLabel}</i> {globalOverviewLabel.label}
          </span>
        </Typography>
        <div className={classes.mapWrapper}>
          <ComposableMap
            className={classes.composableMap}
            id="global-overview-map"
            data-tip=""
            projectionConfig={{
              rotate: [-10, 0, 0],
              scale: 210
            }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={(value) => {
                handleOnMoveEnd(value);
              }}
            >
              <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
              <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
              <Geographies geography={geography}>
                {({ geographies }) => {
                  return geographies.map((geo) => {
                    const countryData = mapData.find((item) => item.name === geo.properties.NAME);
                    const countryStats = countryData?.stats;
                    let fillColor = lightGrey;
                    let smallerThan20 = false;
                    let showTooltip = false;

                    if (countryData) {
                      let count = 0;

                      switch (mapView) {
                        case 'No. Samples':
                          if (countryData.count > 0) {
                            fillColor = samplesColorScale(countryData.count);
                          } else {
                            fillColor = zeroCountColor;
                          }
                          break;
                        case 'Dominant Genotype':
                          const genotypes = countryStats.GENOTYPE.items;
                          fillColor = getColorForGenotype(genotypes[0].name);
                          break;
                        case 'Genotype prevalence':
                          let percentCounter = 0;        
                          const genotypes1 = countryStats.GENOTYPE.items;
                          let genotypes2 = [];
                          genotypes1.forEach((genotype) => {
                            if (customDropdownMapView.includes(genotype.name))
                                genotypes2.push(genotype);
                              percentCounter += genotype.count;
                          });
                
                          let sumCount = 0;

                          if (genotypes2.length > 0 ) {
                            for (const genotype of genotypes2) {
                              sumCount += genotype.count;

                            }
                          }
                          if (countryData.count >= 20 && genotypes2.length > 0) {
                            if (genotypes2 !== undefined) {
                              fillColor = redColorScale2(((sumCount/percentCounter)*100).toFixed(2));
                            }
                          }
                          else if (countryData.count>=20) {
                            fillColor = darkGrey;
                            smallerThan20 = true;
                          }

                          break;

                        case 'Susceptible to all drugs': // case 'Sensitive to all drugs':
                        case 'H58 / Non-H58':
                        case 'MDR':
                        case 'XDR':
                        case 'AzithR':
                        case 'CipR':
                          count = countryStats[statKey[mapView]]?.count;
                          if (countryData.count >= 20 && count > 0) {
                            if (mapView === 'Susceptible to all drugs') {
                              fillColor = sensitiveColorScale(countryStats[statKey[mapView]].percentage);
                            } else {
                              fillColor = redColorScale(countryStats[statKey[mapView]].percentage);
                            }
                            showTooltip = true;
                          } else if (countryData.count >= 20) {
                            if (mapView === 'Susceptible to all drugs') {
                              fillColor = zeroPercentColor;
                            } else {
                              fillColor = darkGrey;
                            }
                            smallerThan20 = true;
                          }
                          break;
                        case 'CipNS':
                          let countCipR = countryStats[statKey["CipR"]]?.count;
                          let countCipNS = countryStats[statKey["CipNS"]]?.count;
                          count = countCipR + countCipNS;
                          // count = countryStats[statKey[mapView]]?.count;
                          let per = countryStats[statKey["CipNS"]].percentage + countryStats[statKey["CipR"]].percentage;
                          if (countryData.count >= 20 && count > 0) {
                            if (mapView === 'Susceptible to all drugs') {
                              fillColor = sensitiveColorScale(per);
                            } else {
                              fillColor = redColorScale(per);
                            }
                            showTooltip = true;
                          } else if (countryData.count >= 20) {
                            if (mapView === 'Susceptible to all drugs') {
                              fillColor = zeroPercentColor;
                            } else {
                              fillColor = darkGrey;
                            }
                            smallerThan20 = true;
                          }
                          break;
                        default:
                          break;
                      }
                    }

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        cursor="pointer"
                        fill={fillColor}
                        onClick={() => handleOnClick(geo.properties.NAME)}
                        onMouseLeave={handleOnMouseLeave}
                        onMouseEnter={() =>
                          handleOnMouseEnter({
                            geo,
                            countryStats,
                            countryData,
                            smallerThan20,
                            showTooltip
                          })
                        }
                        style={{
                          default: {
                            outline: 'none'
                          },
                          hover: {
                            stroke: '#607D8B',
                            strokeWidth: 1,
                            outline: 'none'
                          },
                          pressed: {
                            fill: '#FF5722',
                            stroke: '#607D8B',
                            strokeWidth: 1,
                            outline: 'none'
                          }
                        }}
                      />
                    );
                  });
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          {!matches && (
            <>
              <TopLeftControls />
              <TopRightControls />
              {ifCustom ? <TopRightControls2/> : null}
            </>
          )}
          <BottomLeftControls />
          <BottomRightControls />
        </div>
        {matches && (
          <div className={classes.topControls}>
            <TopRightControls />
            {ifCustom ? <TopRightControls2/> : null}
            <TopLeftControls />
          </div>
        )}
        <ReactTooltip>
          {tooltipContent && (
            <div className={classes.tooltipMap}>
              <span className={classes.country}>{tooltipContent.name}</span>
              <div className={classes.tooltipInfo}>
                {Object.keys(tooltipContent.content).map((key, index) => {
                  return (
                    <div key={`tooltip-${index}`} className={classes.info}>
                      {mapView === 'Dominant Genotype' && (
                        <div
                          className={classes.color}
                          style={{
                            backgroundColor: getColorForGenotype(key)
                          }}
                        />
                      )}
                      <span key={`info-${index}`}>
                        <span>{key}:</span>
                        {showPercentage() ? (
                          <span>{` ${tooltipContent.content[key].count} (${tooltipContent.content[key].percentage})`}</span>
                        ) : (
                          <span>{` ${tooltipContent.content[key]}`}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
                {Object.keys(tooltipContent.content).length === 0 && (
                  <span>{tooltipContent.smallerThan20 ? '0%' : 'Insufficient data'}</span>
                )}
              </div>
            </div>
          )}
        </ReactTooltip>
      </CardContent>
    </Card>
  );
};
