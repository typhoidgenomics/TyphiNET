import {
  Alert,
  Card,
  CardActions,
  CircularProgress,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useStyles } from './GraphsMUI';
import { useAppSelector } from '../../../stores/hooks';
import { CameraAlt } from '@mui/icons-material';
import { DeterminantsGraph } from './DeterminantsGraph';
import { FrequenciesGraph } from './FrequenciesGraph';
import { DrugResistanceGraph } from './DrugResistanceGraph';
import { DistributionGraph } from './DistributionGraph';
import { useState } from 'react';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import domtoimage from 'dom-to-image';
import LogoImg from '../../../assets/img/logo-typhinet-prod.png';
import download from 'downloadjs';
import { drugs, drugsForDrugResistanceAndFrequencyGraph } from '../../../util/drugs';
import { getColorForDrug } from './graphColorHelper';
import { colorForDrugClasses, getColorForGenotype } from '../../../util/colorHelper';
import { graphCards } from '../../../util/graphCards';
import { SelectCountry } from '../SelectCountry';
import { DownloadData } from '../DownloadData';

export const Graphs = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [showAlert, setShowAlert] = useState(false);
  const [chartLoadings, setChartLoadings] = useState({
    RFWG: false,
    DRT: false,
    RDWG: false,
    GD: false
  });

  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const drugResistanceGraphView = useAppSelector((state) => state.graph.drugResistanceGraphView);
  const captureDRT = useAppSelector((state) => state.dashboard.captureDRT);
  const captureRFWG = useAppSelector((state) => state.dashboard.captureRFWG);
  const captureRDWG = useAppSelector((state) => state.dashboard.captureRDWG);
  const captureGD = useAppSelector((state) => state.dashboard.captureGD);
  const endtimeGD = useAppSelector((state) => state.graph.endtimeGD);
  const starttimeGD = useAppSelector((state) => state.graph.starttimeGD);
  const endtimeDRT = useAppSelector((state) => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector((state) => state.graph.starttimeDRT);
  const actualGenomesGD = useAppSelector((state) => state.graph.actualGenomesGD);
  const actualGenomesDRT = useAppSelector((state) => state.graph.actualGenomesDRT);
  // const starttimeRD = useAppSelector((state) => state.graph.starttimeRD);
  // const starttimeF = useAppSelector((state) => state.graph.starttimeF);
  const genotypesForFilterSelected = useAppSelector((state) => state.graph.genotypesForFilterSelected);

  function drawLegend({
    legendData,
    context,
    factor,
    mobileFactor,
    yPosition,
    isGenotype = false,
    isDrug = false,
    xSpace
  }) {
    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 24;
      const xFactor = Math.floor(i / factor) * xSpace;

      context.fillStyle = isGenotype ? getColorForGenotype(legend) : isDrug ? getColorForDrug(legend) : legend.color;
      context.beginPath();
      context.arc(172 + xFactor, yPosition - mobileFactor + yFactor, 5, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
      context.fillStyle = 'black';
      context.fillText(
        isGenotype || isDrug ? legend : legend.name,
        181 + xFactor,
        yPosition + 4 - mobileFactor + yFactor
      );
    });
  }

  async function handleClickDownload(event, card) {
    event.stopPropagation();
    handleLoading(card.id, true);
    if ((card.id === 'DRT' && drugResistanceGraphView.length === 0) || (card.id === 'DRT' && captureDRT === false)) {
      handleLoading(card.id, false);
      alert('No drugs/classes selected to download or no data to download');
      return;
    }
    if (card.id === 'RFWG' && captureRFWG === false) {
      handleLoading(card.id, false);
      alert('No genotype selected to download or no data to download');
      return;
    }
    if ((card.id === 'RDWG' && captureRDWG === false) || (card.id === 'GD' && captureGD === false)) {
      handleLoading(card.id, false);
      alert('No data to download');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const graph = document.getElementById(card.id);
      const graphImg = document.createElement('img');
      const graphImgPromise = imgOnLoadPromise(graphImg);

      graphImg.src = await domtoimage.toPng(graph, { quality: 0.1, bgcolor: 'white' });
      await graphImgPromise;

      let heightFactor = 0,
        drugClassesBars,
        drugClassesFactor,
        genotypesFactor;

      if (['RFWG'].includes(card.id)) {
        heightFactor = 250;
      }
      if (['DRT'].includes(card.id)  && drugResistanceGraphView.length!==0 ) {
        heightFactor = 250;
      } else{
        (
          <Tooltip title="Extensively drug resistant(XDR): MDR plus CipR plus ESBL." placement="top">
            <span>XDR</span>
            </Tooltip>
        );
      }
      if (card.id === 'RDWG') {
        drugClassesBars = colorForDrugClasses[determinantsGraphDrugClass];
        drugClassesFactor = Math.ceil(drugClassesBars.length / 4);
        heightFactor += drugClassesFactor * 22;
      }
      if (card.id === 'GD') {
        genotypesFactor = Math.ceil(genotypesForFilter.length / 9);
        heightFactor += genotypesFactor * 22;
      }

      canvas.width = 950;
      canvas.height = graphImg.height + 220 + heightFactor;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const logo = document.createElement('img');
      const logoPromise = imgOnLoadPromise(logo);
      logo.src = LogoImg;
      await logoPromise;

      ctx.drawImage(logo, 10, 10, 155, 65);
      ctx.drawImage(graphImg, canvas.width / 2 - graphImg.width / 2, 220);
     
      ctx.font = 'bold 18px Montserrat';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(card.title, canvas.width / 2, 50);

      ctx.font = '12px Montserrat';
      ctx.fillText(card.description.join(' / '), canvas.width / 2, 72);

      ctx.font = '14px Montserrat';
      // ctx.fillText(`Organism: ${globalOverviewLabel.fullLabel}`, canvas.width / 2, 110);
      ctx.fillText(`Dataset: ${dataset}`, canvas.width / 2, 110);
      // ctx.fillText(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, canvas.width / 2, 132);
      if(card.id === 'GD'){
        ctx.fillText(`Time period: ${starttimeGD} to ${endtimeGD}`, canvas.width / 2, 132);
        ctx.fillText(`Total ${actualGenomesGD} genomes`, canvas.width / 2, 172);
      }else if(card.id === 'DRT'){
        ctx.fillText(`Time period: ${starttimeDRT} to ${endtimeDRT}`, canvas.width / 2, 132);
        ctx.fillText(`Total ${actualGenomesDRT} genomes`, canvas.width / 2, 172);
      }else
        ctx.fillText(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, canvas.width / 2, 132);
      
      ctx.fillText(`Country: ${actualCountry}`, canvas.width / 2, 154);
      if (card.id === 'RDWG'){
        ctx.fillText(`Drug Class: ${determinantsGraphDrugClass}`, canvas.width / 2, 176);
        // ctx.fillText(`Total genotypes: ${starttimeRD}`, canvas.width / 2, 196);
      }
      // if(card.id === 'RFWG') ctx.fillText(`Total select genotypes: ${starttimeF}`, canvas.width / 2, 196);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'start';
      ctx.font = '12px Montserrat';

      const mobileFactor = matches500 ? 100 : 0;
    
      if (['RFWG', 'DRT'].includes(card.id)) {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);
       
        drawLegend({
          legendData: ((['RFWG'].includes(card.id))? drugsForDrugResistanceAndFrequencyGraph: drugResistanceGraphView),
          context: ctx,
          factor: 4,
          mobileFactor,
          yPosition: 670,
          xSpace: 200,
          isDrug: true
        });
      }
      else if (card.id === 'RDWG') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: drugClassesBars,
          context: ctx,
          factor: drugClassesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 208
        });
      } else if (card.id === 'GD') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: genotypesForFilterSelected,
          context: ctx,
          factor: Math.ceil(genotypesForFilterSelected.length / 9),
          mobileFactor,
          yPosition: 670,
          isGenotype: true,
          xSpace: 87
        });
      }

      const base64 = canvas.toDataURL();
      await download(base64, `TyphiNET-${globalOverviewLabel.fullLabel}-${card.title}.png`);
    } catch {
      setShowAlert(true);
    } finally {
      handleLoading(card.id, false);
    }
  }

  function handleLoading(id, value) {
    setChartLoadings({ ...chartLoadings, [id]: value });
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  return (
    <Card className={classes.graphsCard} elevation={2}>
      <SelectCountry />
      {graphCards.map((card, index) => {
        return (
          <Card key={`graph-card-${index}`} className={classes.card} elevation={0}>
            <CardActions disableSpacing className={classes.cardActions}>
              <div className={classes.titleWrapper}>
                <Typography fontSize="18px" fontWeight="500">
                  {card.title}
                </Typography>
                <div className={classes.downloadWrapper}>
                  <Tooltip title="Download Chart as PNG" placement="top">
                    <span>
                      <IconButton color="primary" onClick={(event) => handleClickDownload(event, card)}>
                        {chartLoadings[card.id] ? <CircularProgress color="primary" size={24} /> : <CameraAlt />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
              <Typography fontSize="10px" component="span">
                {card.description.map((d, i) => (
                  <div key={`description-${i}`}>{d}</div>
                ))}
              </Typography>
            </CardActions>
            <div className={classes.cardContent}>
              {card.id === 'RFWG' && <FrequenciesGraph />}
              {card.id === 'DRT' && <DrugResistanceGraph />}
              {card.id === 'RDWG' && <DeterminantsGraph />}
              {card.id === 'GD' && <DistributionGraph />}
            </div>
          </Card>
        );
      })}
      <DownloadData />
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </Card>
  );
};
