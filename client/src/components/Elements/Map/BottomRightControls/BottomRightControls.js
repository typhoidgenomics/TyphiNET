import { Alert, CircularProgress, IconButton, Snackbar, Tooltip } from '@mui/material';
import { useStyles } from './BottomRightControlsMUI';
import { CameraAlt } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { useState } from 'react';
import { setPosition } from '../../../../stores/slices/mapSlice';
import { svgAsPngUri } from 'save-svg-as-png';
import { imgOnLoadPromise } from '../../../../util/imgOnLoadPromise';
import download from 'downloadjs';
import LogoImg from '../../../../assets/img/logo-typhinet-prod.png';
import { mapLegends } from '../../../../util/mapLegends';

export const BottomRightControls = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useAppDispatch();
  const mapView = useAppSelector((state) => state.map.mapView);
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);

  async function handleClick() {
    setLoading(true);
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));

    try {
      await svgAsPngUri(document.getElementById('global-overview-map'), {
        scale: 4,
        backgroundColor: 'white',
        width: 1200,
        left: -200
      }).then(async (uri) => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        let mapImg = document.createElement('img');
        let mapImgPromise = imgOnLoadPromise(mapImg);
        mapImg.src = uri;
        await mapImgPromise;

        const cWidth = 3600;
        const cHeight = 1800;
        const textHeight = 250;
        const legendHeight = 350;

        canvas.width = cWidth;
        canvas.height = cHeight + textHeight + legendHeight;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bolder 50px Montserrat';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(`Global Overview of ${globalOverviewLabel.fullLabel}`, canvas.width / 2, 80);
        ctx.font = '35px Montserrat';
        ctx.textAlign = 'center';

        const actualMapView = mapLegends.find((x) => x.value === mapView).label;

        ctx.fillText('Map View: ' + actualMapView, canvas.width / 2, 140);
        ctx.fillText('Dataset: ' + dataset, canvas.width / 2, 190);
        ctx.fillText('Time Period: ' + actualTimeInitial + ' to ' + actualTimeFinal, canvas.width / 2, 240);

        ctx.drawImage(mapImg, 0, textHeight, canvas.width, cHeight);

        const legendImg = document.createElement('img');
        const legendImgPromise = imgOnLoadPromise(legendImg);
        let legendWidth = 439;

        switch (mapView) {
          case 'Dominant Genotype':
            legendWidth = 3085;
            legendImg.src = `legends/MapView_DominantGenotype.png`;
            break;
          case 'No. Samples':
            legendImg.src = 'legends/MapView_NoSamples.png';
            break;
          // case 'Sensitive to all drugs':
          case 'Susceptible to all drugs':
            legendImg.src = 'legends/MapView_Sensitive.png';
            break;
          default:
            legendImg.src = 'legends/MapView_Others.png';
            break;
        }
        if (mapView === 'Dominant Genotype') {
        await legendImgPromise;
        ctx.drawImage(
          legendImg,
          canvas.width / 2 - legendWidth / 2,
          canvas.height - legendHeight - 30,
          legendWidth,
          legendHeight
        );
      } else {
        await legendImgPromise;
        ctx.drawImage(
          legendImg,
          canvas.width - (canvas.width / 6),
          0,
          legendWidth,
          legendHeight
        );
      }
        const typhinetLogo = document.createElement('img');
        const typhinetLogoPromise = imgOnLoadPromise(typhinetLogo);
        typhinetLogo.src = LogoImg;
        await typhinetLogoPromise;
        ctx.drawImage(typhinetLogo, 25, 25, 500, 200);

        const base64 = canvas.toDataURL();
        await download(base64, 'TyphiNET - Global Overview Salmonella Typhi.png');
      });
    } catch (error) {
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  return (
    <div className={classes.bottomRightControls}>
      <Tooltip title="Download Map as PNG" placement="left">
        <span>
          <IconButton color="primary" onClick={handleClick} disabled={loading}>
            {loading ? <CircularProgress color="primary" size={35} /> : <CameraAlt fontSize="large" />}
          </IconButton>
        </span>
      </Tooltip>
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
