import { Card, CardContent, Typography } from '@mui/material';
import { useStyles } from './AboutMUI';
import euFlagImg from '../../assets/img/eu_flag.jpg';

export const About = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card} elevation={2}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" fontWeight={700}>
          About TyphiNET
        </Typography>

        <div className={classes.paragraph}>
          The TyphiNET dashboard collates antimicrobial resistance (AMR) and genotype (lineage) information extracted
          from whole genome sequence (WGS) data from the bacterial pathogen <i> Salmonella</i> Typhi, the agent of
          typhoid fever.
        </div>

        <div className={classes.paragraph}>
          AMR determinants identified in the genome assemblies using Pathogenwatch are used to define drug resistance
          variables as follows.Multidrug resistance(MDR): resistance determinants for chloramphenicol (<i>catA1</i> or{' '}
          <i>cmlA</i>), ampicillin (<i>bla</i>TEM-1D, <i>bla</i>OXA-7), and co-trimoxazole (at least one <i>dfrA</i>{' '}
          gene and at least one <i>sul</i> gene). Ciprofloxacin non-susceptible (CipNS): one or more of the quinolone
          resistance determining region(QRDR) mutations at <i>gyrA</i>-83, <i>gyrA</i>
          -87, <i>parC</i>-80, <i>parC</i>-84, <i>gyrB</i>-464 or presence of a plasmid - mediated quinolone
          resistance(PMQR) gene(<i>qnrB</i>, <i>qnrD</i> , <i>qnrS</i>). Ciprofloxacin resistant (CipR): QRDR triple
          mutant (<i>gyrA</i>-83 and <i>gyrA</i>-87, together with either <i>parC</i>-80 or <i>parC</i>-84), or plasmid
          - mediated quinolone resistance(PMQR) together with <i>gyrA</i>-83, <i>gyrA</i>
          -87 and/or <i>gyrB</i>-464. Third - generation cephalosporin resistance (3 GCR): presence of an extended -
          spectrum beta-lactamase(ESBL) (<i>bla</i>CTX-M-12, <i>bla</i>CTX-M-15, <i>bla</i>CTX-M-55,{' '}
          <i>bla</i>SHV-12) or <i>ampC</i> gene.Extreme drug resistance(XDR): MDR plus CipR plus 3 GCR. Azithromycin
          resistance(AzithR): mutation at <i>acrB</i>-717. See{' '}
          <a href="https://www.nature.com/articles/s41467-021-23091-2" target="_blank" rel="noreferrer">
            Argimon et al, 2021
          </a>{' '}
          for details.
        </div>

        <div className={classes.paragraph}>
          <b>Data:</b> Data are sourced regularly from Typhi{' '}
          <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">
            Pathogenwatch
          </a>
          , and filtered to include only genomes from unbiased sampling frames (e.g. routine or project - based enteric
          fever surveillance, as opposed to AMR - focused sampling), based on curation by the{' '}
          <a href="https://www.typhoidgenomics.org/" target="_blank" rel="noreferrer">
            Global Typhoid Genomics Consortium
          </a>
          . The database can be downloaded using the button below.
          <p>
            <b>Documentation:</b> Full documentation for the dashboard is available{' '}
            <a href="https://github.com/typhoidgenomics/TyphiNET/wiki" target="_blank" rel="noreferrer">
              here
            </a>
            .
          </p>
          Information on genotype definitions can be found in{' '}
          <a
            href="https://academic.oup.com/jid/article/224/Supplement_7/S775/6358992?login=true"
            target="_blank"
            rel="noreferrer"
          >
            Dyson & Holt, 2021
          </a>
          .
        </div>

        <div className={classes.paragraph}>
          <b>Team:</b> The TyphiNET dashboard is coordinated by{' '}
          <a href="https://scholar.google.com.au/citations?hl=en&user=klhFnE0AAAAJ" target="_blank" rel="noreferrer">
            Dr Zoe Dyson
          </a>
          ,{' '}
          <a href="https://scholar.google.com.au/citations?hl=en&user=O2dcz5MAAAAJ" target="_blank" rel="noreferrer">
            Dr Louise Cerdeira
          </a>
          &amp;{' '}
          <a href="https://holtlab.net/" target="_blank" rel="noreferrer">
            Prof Kat Holt
          </a>
          , with support from the Wellcome Trust (Open Research Fund, 219692/Z/19/Z), the European Union's Horizon 2020
          research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681.
          <img className="euFlagImage" src={euFlagImg} alt="EU_FLAG" height="20" />, the{' '}
          <a href="https://www.lshtm.ac.uk/" target="_blank" rel="noreferrer">
            London School of Hygiene and Tropical Medicine
          </a>{' '}
          &amp;{' '}
          <a href="https://www.monash.edu/" target="_blank" rel="noreferrer">
            Monash University
          </a>
          .
        </div>
      </CardContent>
    </Card>
  );
};
