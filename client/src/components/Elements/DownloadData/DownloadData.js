import { Alert, Snackbar, useMediaQuery } from '@mui/material';
import { useStyles } from './DownloadDataMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import axios from 'axios';
import download from 'downloadjs';
import { API_ENDPOINT } from '../../../constants';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { PictureAsPdf, TableChart } from '@mui/icons-material';
import { setPosition } from '../../../stores/slices/mapSlice';
import jsPDF from 'jspdf';
import LogoImg from '../../../assets/img/logo-typhinet-prod.png';
import EUFlagImg from '../../../assets/img/eu_flag.jpg';
import moment from 'moment';
import { svgAsPngUri } from 'save-svg-as-png';
import { mapLegends } from '../../../util/mapLegends';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import { graphCards } from '../../../util/graphCards';
import domtoimage from 'dom-to-image';
import { drugs, drugsForDrugResistanceAndFrequencyGraph } from '../../../util/drugs';
import { getColorForDrug } from '../Graphs/graphColorHelper';
import { colorForDrugClasses, getColorForGenotype } from '../../../util/colorHelper';
import { getSalmonellaTexts, abbrivations } from '../../../util/reportInfoTexts';

const columnsToRemove = [
  'azith_pred_pheno',
  // 'ACCESSION',
  'PROJECT ACCESSION',
  'COUNTRY_ONLY',
  'REGION_IN_COUNTRY',
  'LOCATION',
  'ACCURACY',
  'LATITUDE',
  'LONGITUDE',
  'REFERENCE',
  'MLST ST (EnteroBase)',
  'MLST PROFILE (EnteroBase)',
  'GENOTYPHI SNPs CALLED',
  'Genome ID',
  'Version',
  'Organism Name',
  'Organism ID',
  'Species Name',
  'Species ID',
  'Genus Name',
  'Genus ID',
  'Reference ID',
  'Matching Hashes',
  'p-Value',
  'Mash Distance',
  'cip_pred_pheno',
  'dcs_category',
  'amr_category',
  'num_qrdr',
  'num_acrb',
  'ESBL_category',
  'chloramphenicol_category',
  'tetracycline_category',
  'cip_pheno_qrdr_gene',
  'dcs_mechanisms',
  'num_amr_genes',
  'dfra_any',
  'sul_any',
  'co_trim',
  'GENOTYPE_SIMPLE',
  'h58_genotypes',
  'COUNTRY OF ORIGIN',
  'AGE',
  'TRAVEL COUNTRY',
  'TRAVEL ASSOCIATED',
  'Inc Types'
];

export const DownloadData = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useAppDispatch();
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const listPIMD = useAppSelector((state) => state.dashboard.listPMID);
  const PIMD = useAppSelector((state) => state.dashboard.PMID);
  // const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  const actualGenomes = useAppSelector((state) => state.dashboard.actualGenomes);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const mapView = useAppSelector((state) => state.map.mapView);
  const dataset = useAppSelector((state) => state.map.dataset);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
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
  const genotypesForFilterSelected = useAppSelector((state) => state.graph.genotypesForFilterSelected);
  // const starttimeRD = useAppSelector((state) => state.graph.starttimeRD);
  // const starttimeF = useAppSelector((state) => state.graph.starttimeF)
  // console.log('GD',starttimeGD ,'DRT', starttimeDRT, 'starttimeF',starttimeF, 'starttimeRD',starttimeRD )  const genotypesForFilterSelected = useAppSelector((state) => state.graph.genotypesForFilterSelected);

  async function handleClickDownloadDatabase() {
    setLoadingCSV(true);
    await axios
      .get(`${API_ENDPOINT}file/download`)
      .then((res) => {
        let indexes = [];
        let csv = res.data.split('\n');
        let lines = [];

        for (let index = 0; index < csv.length; index++) {
          let line = csv[index].split(',');
          lines.push(line);
        }
        lines[0].forEach((curr, index) => {
          if (curr === 'cip_pred_pheno') {
            lines[0][index] = 'Cip';
          } 
          });
        const replacements = {
          'COUNTRY_ONLY': 'Country',
          'cip_pred_pheno': 'Cip',
          'dashboard view': 'Dashboard view'
        };

        lines[0].forEach((curr, index) => {
          lines[0][index] = replacements[curr] || curr;
        });
        
        for (let index = 0; index < columnsToRemove.length; index++) {
          let currentIndex = lines[0].indexOf(columnsToRemove[index]);
          indexes.push(currentIndex);
        }
        indexes.sort();
        indexes.reverse();

        let newLines = [];
        for (let j = 0; j < lines.length; j++) {
          let aux = [];
          for (let i = 0; i < lines[j].length; i++) {
            if (!indexes.includes(i)) {
              aux.push(lines[j][i]);
            }
          }
          newLines.push(aux);
        }

        let newCSV = '';
        for (let i = 0; i < newLines.length; i++) {
          let aux = '';
          for (let index = 0; index < newLines[i].length; index++) {
            aux += newLines[i][index];
            if (index !== newLines[i].length - 1) {
              aux += ',';
            }
          }
          if (i !== newLines.length - 1) {
            aux += '\n';
          }
          newCSV += aux;
        }

        download(newCSV, 'TyphiNET-database.csv');
      })
      .finally(() => {
        setLoadingCSV(false);
      });
  }

  function formatDate(date) {
    return moment(date).format('ddd MMM DD YYYY HH:mm');
  }

  function drawFooter({ document, pageHeight, pageWidth, date, page1=false }) {
    document.setFontSize(10);
 
      document.line(0, pageHeight - 26, pageWidth, pageHeight - 26);
      document.text(`Source: www.typhi.net`, 16, pageHeight - 10, { align: 'left' });
  }

  function drawHeader({ document, pageWidth }) {
    document.setFontSize(8);
    document.line(0, 26, pageWidth, 26);
    document.setFontSize(12);
  }

  function drawLegend({ id = null, legendData, document, factor, rectY, isGenotype = false, isDrug = false, xSpace }) {
    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 10;
      const xFactor = Math.floor(i / factor) * xSpace;

      document.setFillColor(isGenotype ? getColorForGenotype(legend) : isDrug ? getColorForDrug(legend) : legend.color);
      document.circle(50 + xFactor, rectY + 10 + yFactor, 2.5, 'F');

      if (id === 'CERDT' && i < 2) {
        if (i === 0) {
          document.setFont(undefined, 'bold');
        } else {
          document.setFont(undefined, 'normal');
        }
      }
      document.text(
        isGenotype || isDrug ? legend.replaceAll('β', 'B') : legend.name,
        56 + xFactor,
        rectY + 12 + yFactor
      );
    });
  }

  async function handleClickDownloadPDF() {
    setLoadingPDF(true);
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));

    try {
      const doc = new jsPDF({ unit: 'px', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const date = formatDate(new Date());

      // Logo
      const logo = new Image();
      logo.src = LogoImg;
      const logoWidth = 80;
      doc.addImage(logo, 'PNG', 16, 36, logoWidth, 34, undefined,'FAST');

      // Title and Date
      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text("TyphiNET Reoprt for", 173, 54, { align: 'center' });
      doc.setFont(undefined, "bolditalic");
      doc.text("Salmonella", 264, 54, { align: 'center' });
      doc.setFont(undefined, "bold");
      doc.text("Typhi", 315, 54, { align: 'center' });
      
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(date, pageWidth / 2, 78, { align: 'center' });

      let list = PIMD.filter((value)=> value !== "-")
      let pmidSpace, dynamicText;
      if (actualCountry === 'All'){
        pmidSpace = 20;
        dynamicText = `TyphiNET presents data aggregated from >100 studies. Data are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(', ')}.`
      }else{
        list = listPIMD.filter((value)=> value !== "-")
        dynamicText = `TyphiNET presents data aggregated from >100 studies. Data for country ${actualCountry} are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(', ')}.`
        const textWidth = doc.getTextWidth(dynamicText);

        const widthRanges = [815, 1200, 1600, 2000, 2400];
        const pmidSpaces = [-50, -40, -30, -20, -10, 0];

        // Find the appropriate pmidSpace based on textWidth
        pmidSpace = pmidSpaces.find((space, index) => textWidth <= widthRanges[index]) || pmidSpaces[pmidSpaces.length - 1];
      }
      doc.text(dynamicText,16, 205,{ align: 'left', maxWidth: pageWidth - 36 });
      
      const texts = getSalmonellaTexts(date);

      // Info
      doc.text(texts[0], 16, 105, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'bold');
      doc.text(texts[1], 16, 155, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'normal');
      doc.text(texts[2], 16, 175, { align: 'left', maxWidth: pageWidth - 36});
      doc.text(texts[3], 16, 265+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'bold');
      doc.text(texts[4], 16, 305+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'normal');
      doc.text(texts[5], 16, 325+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.text(texts[6], 16, 355+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.text(texts[7], 16, 385+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'bold');
      doc.text(texts[8], 16, 415+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'normal');
      doc.text(texts[9], 16, 435+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.text(texts[10], 16, 465+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.text(texts[11], 16, 485+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, "italic");
      doc.text("qnr", 16, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'normal');
      doc.text(texts[12], 32, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, "italic");
      doc.text("gyrA/parC/gyrB", 122, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'normal');
      doc.text(texts[13], 185, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.text(texts[14], 16, 515+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFontSize(10).setFont(undefined, 'bold');
      doc.text(texts[15], 16, pageHeight-70, { align: 'left', maxWidth: pageWidth - 36 });
      doc.setFont(undefined, 'normal');
      doc.text(texts[16], 16, pageHeight-60, { align: 'left', maxWidth: pageWidth - 36 });
  

      const euFlag = new Image();
      euFlag.src = EUFlagImg;
      doc.addImage(euFlag, 'JPG',173,pageHeight-48, 12, 7, undefined,'FAST');
      drawHeader({ document: doc, pageWidth });
      drawFooter({ document: doc, pageHeight, pageWidth, date, page1: true });

      // Map
      doc.addPage();
      drawFooter({ document: doc, pageHeight, pageWidth, date });

      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text("Global Overview of", 177, 24, { align: 'center' });
      doc.setFont(undefined, "bolditalic");
      doc.text("Salmonella", 264, 24, { align: 'center' });
      doc.setFont(undefined, "bold");
      doc.text("Typhi", 315, 24, { align: 'center' });
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(`Total: ${actualGenomes} genomes`, pageWidth / 2, 40, { align: 'center' });
      doc.text(`Country: ${actualCountry}`, pageWidth / 2, 52, { align: 'center' });
      doc.text(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, pageWidth / 2, 64, { align: 'center' });
      doc.line(16, 76, pageWidth - 16, 76);

      doc.setFont(undefined, 'bold');
      doc.text('Map', 16, 96);
      doc.setFont(undefined, 'normal');
      const actualMapView = mapLegends.find((x) => x.value === mapView).label;
      doc.text(`Map View: ${actualMapView}`, 16, 108);
      doc.text(`Dataset: ${dataset}${dataset === 'All' ? ' (local + travel)' : ''}`, 16, 120);

      // doc.setFontSize(8);
      if(mapView === 'Genotype prevalence'){
        if (customDropdownMapView.length === 1) {
            doc.text('Selected Genotypes: ' + customDropdownMapView, 16, 140);
        } else if (customDropdownMapView.length > 1) {
            const genotypesText = customDropdownMapView.join(', ');
            doc.text('Selected Genotypes: ' + genotypesText, 16, 140);
        }
      }
      // let mapY = 160 + (customDropdownMapView.length*9);
      await svgAsPngUri(document.getElementById('global-overview-map'), {
        // scale: 4,
        backgroundColor: 'white',
        width: 1200,
        left: -200
      }).then(async (uri) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const mapImg = document.createElement('img');
        const mapImgPromise = imgOnLoadPromise(mapImg);
        mapImg.src = uri;
        await mapImgPromise;

        canvas.width = 4800;
        canvas.height = 2400;
        ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

        const img = canvas.toDataURL('image/png');
        doc.addImage(img, 'PNG', 0, 160, pageWidth, 223, undefined,'FAST');
        // doc.addImage(img, 'PNG', 0, mapY, pageWidth, 223);
      });

      const mapLegend = new Image();
      let legendWidth = 58.85;

      switch (mapView) {
        case 'Dominant Genotype':
          legendWidth = 414.21;
          mapLegend.src = 'legends/MapView_DominantGenotype.png';
          break;
        case 'No. Samples':
          mapLegend.src = 'legends/MapView_NoSamples.png';
          break;
        // case 'Sensitive to all drugs':
        case 'Susceptible to all drugs':
          mapLegend.src = 'legends/MapView_Sensitive.png';
          break;
        case 'Genotype prevalence':
          mapLegend.src = 'legends/MapView_prevalence.png';
          break;
        default:
          mapLegend.src = 'legends/MapView_Others.png';
          break;
      }
      if (mapView === 'Dominant Genotype') {
        doc.addImage(mapLegend, 'PNG', pageWidth / 2 - legendWidth / 2, 351, legendWidth, 47, undefined,'FAST');
      } else {
        doc.addImage(mapLegend, 'PNG', pageWidth - pageWidth / 5 , 85, legendWidth, 47, undefined,'FAST');
      }

      // Graphs
      const drugClassesBars = colorForDrugClasses[determinantsGraphDrugClass];
      const drugClassesFactor = Math.ceil(drugClassesBars.length / 3);
      const genotypesFactor = Math.ceil(genotypesForFilter.length / 6);

      for (let index = 0; index < graphCards.length; index++) {
        if (
          (graphCards[index].id === 'DRT' && (drugResistanceGraphView.length === 0 || captureDRT === false)) ||
          (graphCards[index].id === 'RFWG' && captureRFWG === false) ||
          (graphCards[index].id === 'RDWG' && captureRDWG === false) ||
          (graphCards[index].id === 'GD' && captureGD === false)
        ) {
          continue;
        }
        // let initTime = actualTimeInitial, finalTime = actualTimeFinal;
        // if(graphCards[index].id === 'GD'){ console('...',graphCards.id);initTime = starttimeGD ;finalTime = endtimeGD ;}
        // if(graphCards[index].id === 'DRT'){ initTime = starttimeDRT;finalTime = endtimeDRT ;}
          doc.addPage();
          drawFooter({ document: doc, pageHeight, pageWidth, date });
        const title = `${graphCards[index].title}${
          graphCards[index].id === 'RDWG' ? `: ${determinantsGraphDrugClass}` : ''
        }`;
        doc.setFontSize(12).setFont(undefined, 'bold');
        doc.text(title, 16, 24);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(graphCards[index].description.join(' / ').replaceAll('≥', '>='), 16, 36);
        doc.setFontSize(12);
        if(graphCards[index].id === 'GD') doc.text(`Total: ${actualGenomesGD} genomes`, 16, 54);
        else if(graphCards[index].id === 'DRT') doc.text(`Total: ${actualGenomesDRT} genomes`, 16, 54);
        else doc.text(`Total: ${actualGenomes} genomes`, 16, 54);
        doc.text(`Country: ${actualCountry}`, 16, 66);
        // doc.text(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, 16, 78);
        if(graphCards[index].id === 'GD')
          doc.text(`Time period: ${starttimeGD} to ${endtimeGD}`, 16, 78);
        else if(graphCards[index].id === 'DRT')
          doc.text(`Time period: ${starttimeDRT} to ${endtimeDRT}`, 16, 78);
        else
          doc.text(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, 16, 78);
        
        // if (graphCards[index].id === 'RDWG'){
        //   doc.text(`Total genotypes: ${starttimeRD}`, 16, 102);
        // }
        // if(graphCards[index].id === 'RFWG') doc.text(`Total select genotypes: ${starttimeF}`, 16, 102);
        doc.text(`Dataset: ${dataset}${dataset === 'All' ? ' (local + travel)' : ''}`, 16, 90);

        const graphImg = document.createElement('img');
        const graphImgPromise = imgOnLoadPromise(graphImg);
        graphImg.src = await domtoimage.toPng(document.getElementById(graphCards[index].id), { bgcolor: 'white' });
        await graphImgPromise;
        if (graphImg.width <= 741) {
          doc.addImage(graphImg, 'PNG', 16, 110,undefined,undefined, undefined, 'FAST');
        } else {
          doc.addImage(graphImg, 'PNG', 16, 110, pageWidth - 80, 271, undefined, 'FAST');
        }

        doc.setFillColor(255, 255, 255);
        const rectY = matches500 ? 300 : graphImg.width <= 741 ? 360 : 320;
        doc.rect(0, rectY, pageWidth, 200, 'F');
        const drugsForDrugResistanceAndFrequencyGraphPanSusceptible = drugsForDrugResistanceAndFrequencyGraph.map((curr) => curr === 'Susceptible' ? 'Pan-Susceptible' : curr)
        const drugResistanceGraphViewPanSusceptible = drugResistanceGraphView.map((curr) => curr === 'Susceptible' ? 'Pan-Susceptible' : curr)
        
        doc.setFontSize(9);
        if (graphCards[index].id === 'RFWG') {
          drawLegend({
            document: doc,
            legendData: drugsForDrugResistanceAndFrequencyGraphPanSusceptible,
            factor: 4,
            rectY,
            xSpace: 100,
            isDrug: true
          });
        }else if (graphCards[index].id === 'DRT') {
          drawLegend({
            document: doc,
            legendData: drugResistanceGraphViewPanSusceptible,
            factor: 4,
            rectY,
            xSpace: 100,
            isDrug: true
          });
        } else if (graphCards[index].id === 'RDWG') {
          drawLegend({
            document: doc,
            legendData: drugClassesBars,
            factor: drugClassesFactor,
            rectY,
            xSpace: 127
          });
        } else if (graphCards[index].id === 'GD') {
          drawLegend({
            document: doc,
            legendData: genotypesForFilterSelected,
            factor: Math.ceil(genotypesForFilterSelected.length / 6),
            rectY,
            xSpace: 65,
            isGenotype: true
          });
        }
      }

      doc.save('TyphiNET-report.pdf');
      
    } catch (error) {
      setShowAlert(true);
    } finally {
      setLoadingPDF(false);
    }
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  return (
    <div className={classes.downloadDataWrapper}>
      <LoadingButton
        className={classes.button}
        variant="contained"
        onClick={handleClickDownloadDatabase}
        loading={loadingCSV}
        startIcon={<TableChart />}
        loadingPosition="start"
      >
        Download database (CSV format, 3.3MB)
      </LoadingButton>
      <LoadingButton
        className={classes.button}
        variant="contained"
        onClick={handleClickDownloadPDF}
        loading={loadingPDF}
        startIcon={<PictureAsPdf />}
        loadingPosition="start"
      >
        Download report from current view (PDF, 2MB)
      </LoadingButton>
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};

