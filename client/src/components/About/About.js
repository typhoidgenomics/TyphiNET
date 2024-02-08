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
          variables as follows.Multidrug resistant (MDR): resistance determinants for chloramphenicol (<i>catA1</i> or{' '}
          <i>cmlA</i>), ampicillin (<i>bla</i>genes), and trimethoprim-sulfamethoxazole (at least one <i>dfrA</i>{' '}
          gene and at least one <i>sul</i> gene). Ciprofloxacin non-susceptible (CipNS): one or more of the quinolone
          resistance determining region(QRDR) mutations at <i>gyrA</i>-83, <i>gyrA</i>
          -87, <i>parC</i>-80, <i>parC</i>-84, <i>gyrB</i>-464 or presence of a plasmid-mediated quinolone
          resistance(PMQR) gene(<i>qnrB</i>, <i>qnrD</i>, <i>qnrS</i>). Ciprofloxacin resistant (CipR): QRDR triple
          mutant (<i>gyrA</i>-83 and <i>gyrA</i>-87, together with either <i>parC</i>-80 or <i>parC</i>-84), or (PMQR gene)
          together with <i>gyrA</i>-83, <i>gyrA</i>-87 and/or <i>gyrB</i>-464. Ceftriaxone resistant: presence of an extended
           - spectrum beta-lactamase(ESBL) gene. Extensively drug resistant(XDR): MDR plus CipR plus ESBL. Azithromycin
          resistant: mutation at <i>acrB</i>-717. See{' '} 
          <a href="https://www.nature.com/articles/s41467-021-23091-2" target="_blank" rel="noreferrer">
            Argimon et al, 2021
          </a> and{' '}
          <a href="https://doi.org/10.7554/eLife.85867" target="_blank" rel="noreferrer">
          Carey et al, 2023 
          </a>{' '}
           for details.
        </div>
        <div>
          Genotypes are defined in the GenoTyphi scheme, details in{' '}
          <a href="https://academic.oup.com/jid/article/224/Supplement_7/S775/6358992?login=true" target="_blank" rel="noreferrer">
          Dyson & Holt, 2021
          </a> and{' '}  
          <a href="https://doi.org/10.7554/eLife.85867" target="_blank" rel="noreferrer">
            Carey et al, 2023
          </a>
          .
        </div>

        <div className={classes.paragraph}>
          <b>Data:</b> Typhi genome and source data are curated by the Global Typhoid Genomics Consortium using Typhi Pathogenwatch,
          as described in{' '}
          <a href="https://doi.org/10.7554/eLife.85867" target="_blank" rel="noreferrer">
          Carey et al, 2023
          </a>
          . Data displayed in the TyphiNET dashboard are filtered to include only genomes from unbiased sampling frames (e.g. routine or project-based enteric
          fever surveillance, as opposed to AMR-focused sampling or outbreak investigations). The TyphiNET database (genome-level line list) can be downloaded
          using the 'Download database' button above. To contribute Typhi genome data, please get in touch with the Global Typhoid Genomics Consortium{' '}
          <a href="https://www.typhoidgenomics.org/" target="_blank" rel="noreferrer">
          Global Typhoid Genomics Consortium
          </a>
          .
          <p>
            <b>Documentation:</b> Full documentation for the dashboard is available{' '}
            <a href="https://github.com/typhoidgenomics/TyphiNET/wiki" target="_blank" rel="noreferrer">
              here
            </a> .
          </p>
        </div>
        <div className={classes.paragraph}>
          <b>Team:</b> The TyphiNET dashboard is coordinated by{' '}
          <a href="https://scholar.google.com.au/citations?hl=en&user=klhFnE0AAAAJ" target="_blank" rel="noreferrer">
            Dr Zoe Dyson
          </a>
          ,{' '}
          <a href="https://scholar.google.com.au/citations?hl=en&user=O2dcz5MAAAAJ" target="_blank" rel="noreferrer">
            Dr Louise Cerdeira
          </a> and{' '}
          <a href="https://holtlab.net/" target="_blank" rel="noreferrer">
            Prof Kat Holt
          </a>
          , with support from the Wellcome Trust (Open Research Fund 219692/Z/19/Z; AMRnet project 226432/Z/22/Z), the European Union's Horizon 2020
          research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681
          <img className="euFlagImage" src={euFlagImg} alt="EU_FLAG" height="20" /> , the{' '}
          <a href="https://www.lshtm.ac.uk/" target="_blank" rel="noreferrer">
            London School of Hygiene & Tropical Medicine
          </a>{' '}
          , and{' '}
          <a href="https://www.monash.edu/" target="_blank" rel="noreferrer">
            Monash University
          </a>
          .
        </div>
      </CardContent>
    </Card>
  );
};
