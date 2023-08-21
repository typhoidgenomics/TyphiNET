import { InfoOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, MenuItem, Select, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './TopRightControlsMUI';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setMapView } from '../../../../stores/slices/mapSlice.ts';
import { darkGrey, getColorForGenotype, lightGrey } from '../../../../util/colorHelper';
import { genotypes } from '../../../../util/genotypes';
import { redColorScale, samplesColorScale, sensitiveColorScale } from '../mapColorHelper';
import { mapLegends } from '../../../../util/mapLegends';

const generalSteps = ['>0 and ≤2%', '>2% and ≤10%', '>10% and ≤50%', '>50%'];
const sensitiveSteps = ['0 - 10%', '10 - 20%', '20 - 50%', '50 - 90%', '90 - 100%'];
const noSamplesSteps = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300'];
const mapViewsWithZeroPercentOption = ['CipNS', 'CipR', 'AzithR', 'MDR', 'XDR', 'H58 / Non-H58'];

export const TopRightControls = () => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');

  const dispatch = useAppDispatch();
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapView = useAppSelector((state) => state.map.mapView);

  function handleChangeMapView(event) {
    dispatch(setMapView(event.target.value));
  }

  function hasZeroPercentOption() {
    return mapViewsWithZeroPercentOption.includes(mapView);
  }

  function getSteps() {
    switch (mapView) {
      // case 'Sensitive to all drugs':
      case 'Susceptible to all drugs':
        return sensitiveSteps;
      case 'No. Samples':
        return noSamplesSteps;
      case 'Dominant Genotype':
        return genotypes;
      default:
        return generalSteps;
    }
  }

  function getStepBoxColor(step, index) {
    switch (mapView) {
      // case 'Sensitive to all drugs':
      case 'Susceptible to all drugs':
        const aux = ['10', '20', '50', '90', '100'];
        return sensitiveColorScale(aux[index]);
      case 'No. Samples': {
        const aux = [1, 10, 20, 100, 300];
        return samplesColorScale(aux[index]);
      }
      case 'Dominant Genotype':
        return getColorForGenotype(step);
      default:
        const aux3 = ['0.01', '2.01', '10.01', '50.01'];
        return redColorScale(aux3[index]);
    }
  }

  return (
    <div className={`${classes.topRightControls} ${matches ? classes.bp700 : ''}`}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.cardContent}>
          <div className={classes.label}>
            <Typography variant="caption">Select map view</Typography>
            <Tooltip
              title="Percentage frequency data is shown only for countries with
          N≥20 genomes"
              placement="top"
            >
              <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
            </Tooltip>
          </div>
          <Select
            variant="standard"
            value={mapView}
            onChange={handleChangeMapView}
            inputProps={{ className: classes.selectInput }}
            MenuProps={{ classes: { list: classes.selectMenu } }}
          >
            {mapLegends.map((legend, index) => {
              return (
                <MenuItem key={index + 'mapview'} value={legend.value}>
                  {legend.label}
                </MenuItem>
              );
            })}
          </Select>
          {mapData.length > 0 && (
            <div className={classes.legendWrapper}>
              <div className={classes.legend}>
                <Box className={classes.legendColorBox} style={{ backgroundColor: lightGrey }} />
                <span className={classes.legendText}>Insufficient data</span>
              </div>
              {hasZeroPercentOption() && (
                <div className={classes.legend}>
                  <Box className={classes.legendColorBox} style={{ backgroundColor: darkGrey }} />
                  <span className={classes.legendText}>0%</span>
                </div>
              )}
              {getSteps().map((step, index) => {
                return (
                  <div key={`step-${index}`} className={classes.legend}>
                    <Box className={classes.legendColorBox} style={{ backgroundColor: getStepBoxColor(step, index) }} />
                    <span className={classes.legendText}>{step}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
