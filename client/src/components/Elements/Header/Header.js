import { Card, CardContent, Toolbar, Typography } from '@mui/material';
import { useStyles } from './HeaderMUI';
import LogoImg from '../../../assets/img/logo-typhinet-prod.png';
import { useAppSelector } from '../../../stores/hooks';

const informationCards = [
  {
    id: 'genomes',
    name: 'Total Genomes'
  },
  {
    id: 'genotypes',
    name: 'Total Genotypes'
  }
];

export const Header = () => {
  const classes = useStyles();

  const totalGenomes = useAppSelector((state) => state.dashboard.totalGenomes);
  const actualGenomes = useAppSelector((state) => state.dashboard.actualGenomes);
  const totalGenotypes = useAppSelector((state) => state.dashboard.totalGenotypes);
  const actualGenotypes = useAppSelector((state) => state.dashboard.actualGenotypes);

  return (
    <Toolbar className={classes.toolbar}>
      <div className={classes.logoWrapper}>
        <img src={LogoImg} alt="TyphiNET" className={classes.logo} />
      </div>

      <div className={classes.informationCards}>
        {informationCards.map((card, index) => {
          return (
            <Card key={`information-card-${index}`} elevation={2} className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography variant="body1">{card.name}</Typography>
                <Typography variant="h4" sx={{ fontWeight: '500', fontSize: '32px' }}>
                  {card.id === 'genomes' ? (
                    totalGenomes === actualGenomes ? (
                      <>{totalGenomes}</>
                    ) : (
                      <span className={classes.actualAndTotalValues}>
                        {actualGenomes}
                        <Typography variant="body1" sx={{ fontWeight: '500' }}>
                          /{totalGenomes}
                        </Typography>
                      </span>
                    )
                  ) : totalGenotypes === actualGenotypes ? (
                    <>{totalGenotypes}</>
                  ) : (
                    <span className={classes.actualAndTotalValues}>
                      {actualGenotypes}
                      <Typography variant="body1" sx={{ fontWeight: '500' }}>
                        /{totalGenotypes}
                      </Typography>
                    </span>
                  )}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Toolbar>
  );
};
