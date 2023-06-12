import Loader from 'react-loader-spinner';
import LogoImg from '../../assets/img/logo-typhinet-prod.png';
import { Header } from '../Elements/Header';
import { useStyles } from './MainLayoutUI';
import { useAppSelector } from '../../stores/hooks';

export const MainLayout = ({ children }) => {
  const classes = useStyles();

  const loadingData = useAppSelector((state) => state.dashboard.loadingData);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);

  return (
    <>
      <div className={classes.mainLayout} id="main-layout">
        <div className={classes.childrenWrapper}>
          <div className={classes.children}>
            <Header />
            {children}
          </div>
        </div>
      </div>
      {(loadingData || loadingMap) && (
        <div className={classes.loading}>
          <img className={classes.logo} src={LogoImg} alt="TyphiNET" />
          <Loader type="Circles" color="#D91E45" height={70} width={70} />
        </div>
      )}
    </>
  );
};
