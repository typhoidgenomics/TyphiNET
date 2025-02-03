// Helper for colors

// Color for Salmonella genotypes
export const getColorForGenotype = (genotype) => {
  switch (genotype) {
    case '0':
    case '0.0.1':
    case '0.0.2':
    case '0.0.3':
    case '0.1.0':
    case '0.1':
    case '0.1.1':
    case '0.1.2':
    case '0.1.3':
      return '#808080';
    case '1':
    case '1.1':
    case '1.1.1':
    case '1.1.2':
    case '1.1.3':
    case '1.1.4':
      return '#ffff00';
    case '1.2':
    case '1.2.1':
      return '#ffd700';
    case '2':
    case '2.0.0':
    case '2.0.1':
    case '2.0.2':
      return '#32cd32';
    case '2.1.0':
    case '2.1':
    case '2.1.1':
    case '2.1.2':
    case '2.1.3':
    case '2.1.4':
    case '2.1.5':
    case '2.1.6':
    case '2.1.7':
    case '2.1.8':
    case '2.1.9':
    case '2.1.7.1':
    case '2.1.7.2':
      return '#adff2f';
    case '2.2':
    case '2.2.0':
    case '2.2.1':
    case '2.2.2':
    case '2.2.3':
    case '2.2.4':
      return '#98fb98';
    case '2.3':
    case '2.3.1':
    case '2.3.2':
    case '2.3.3':
    case '2.3.4':
    case '2.3.5':
      return '#6b8e23';
    case '2.4.0':
    case '2.4':
    case '2.4.1':
      return '#2e8b57';
    case '2.5.0':
    case '2.5':
    case '2.5.1':
    case '2.5.2':
      return '#006400';
    case '3.0.0':
    case '3':
    case '3.0.1':
    case '3.0.2':
      return '#0000cd';
    case '3.1.0':
    case '3.1':
    case '3.1.1':
    case '3.1.2':
      return '#4682b4';
    case '3.2.1':
    case '3.2':
    case '3.2.2':
      return '#00bfff';
    case '3.3.0':
    case '3.3':
    case '3.3.1':
    case '3.3.2':
    case '3.3.2.Bd1':
    case '3.3.2.Bd2':
      return '#1e90ff';
    case '3.4':
      return '#6a5acd';
    case '3.5':
    case '3.5.1':
    case '3.5.2':
    case '3.5.3':
    case '3.5.4':
    case '3.5.4.1':
    case '3.5.4.2':
    case '3.5.4.3':
      return '#4b0082';
    case '4':
    case '4.1.0':
    case '4.1':
    case '4.1.1':
      return '#8b0000';
    case '4.2':
    case '4.2.1':
    case '4.2.2':
    case '4.2.3':
      return '#ff6347';
    // case '4.3':
    // case '4.3.0':
    case '4.3.1':
      return '#ff0000';
    case '4.3.1.1':
    case '4.3.1.1.EA1':
      return '#f1b6da';
    case '4.3.1.1.P1':
      return 'black';
    case '4.3.1.2':
    case '4.3.1.2.EA2':
    case '4.3.1.2.EA3':
    case '4.3.1.2.1':
    case '4.3.1.2.1.1':
      return '#c51b7d';
    case '4.3.1.3':
    case '4.3.1.3.Bdq':
      return '#fb8072';
    default:
      return '#E3E3E3';
  }
};

// Colors for Salmonella drug classes genes
export const colorForDrugClasses = {
  Azithromycin: [
    { name: 'acrB_R717L', color: '#FBCFE5' },
    { name: 'acrB_R717Q', color: '#addd8e' },
    { name: 'acrB_R717Q + acrB_R717L', color: '#fd8d3c' },
    { name: 'None', color: '#B9B9B9' }
  ],
  // 'Fluoroquinolones (CipNS)': [
  'Ciprofloxacin NS': [
    { name: '0_QRDR + qnrB (CipNS)', color: '#0066cc' },
    { name: '0_QRDR + qnrS (CipNS)', color: '#009999' },
    // { name: '0_QRDR + qnrD (CipNS)', color: '#54278f' },
    { name: '0_QRDR + qnrS + qnrD (CipNS)', color: '#a8ddb5' },
    { name: '1_QRDR (CipNS)', color: '#ffcc00' },
    { name: '1_QRDR + qnrB (CipNS)', color: '#993399' },
    { name: '1_QRDR + qnrS (CipNS)', color: '#660066' },
    { name: '2_QRDR (CipR)', color: '#ff6600' },
    { name: '2_QRDR + qnrB (CipR)', color: '#ffcccc' },
    { name: '2_QRDR + qnrS (CipR)', color: '#ff6666' },
    { name: '3_QRDR (CipR)', color: '#cc0000' },
    { name: '3_QRDR + qnrB (CipR)', color: '#660000' },
    { name: '3_QRDR + qnrS (CipR)', color: 'black' },
    { name: 'None', color: '#B9B9B9' }
  ],
  Chloramphenicol: [
    { name: 'catA1', color: '#9e9ac8' },
    { name: 'catA1 + cmlA', color: '#FFEC78' },
    { name: 'cmlA', color: '#addd8e' },
    { name: 'None', color: '#B9B9B9' }
  ],
  "Ampicillin/Amoxicillin": [
    { name: 'blaTEM-1D', color: '#addd8e' },
    { name: 'None', color: '#B9B9B9' }
  ],
  Sulphonamides: [
    { name: 'None', color: '#B9B9B9' },
    { name: 'sul1', color: '#fd8d3c' },
    { name: 'sul1 + sul2', color: '#B4DD70' },
    { name: 'sul2', color: '#ffeda0' }
  ],
  Trimethoprim: [
    { name: 'dfrA1', color: '#B4DD70' },
    { name: 'dfrA5', color: '#D7AEF7' },
    { name: 'dfrA7', color: '#FFEC78' },
    { name: 'dfrA7 + dfrA14', color: '#fd8d3c' },
    { name: 'dfrA14', color: '#6baed6' },
    { name: 'dfrA15', color: '#FBCFE5' },
    { name: 'dfrA17', color: '#FCB469' },
    { name: 'dfrA18', color: '#66c2a4' },
    { name: 'None', color: '#B9B9B9' }
  ],
  Tetracyclines: [
    { name: 'tetA(A)', color: 'rgb(174,227,154)' },
    { name: 'tetA(B)', color: '#D7AEF7' },
    { name: 'tetA(C)', color: '#FFEC78' },
    { name: 'tetA(D)', color: '#FCB469' },
    { name: 'None', color: '#B9B9B9' }
  ],
  Ceftriaxone: [
    { name: 'blaCTX-M-12', color: '#fd8d3c' },
    { name: 'blaCTX-M-15', color: '#6baed6' },
    { name: 'blaCTX-M-55', color: '#FBCFE5' },
    { name: 'blaOXA-7', color: '#9e9ac8' },
    { name: 'blaSHV-12', color: '#addd8e' },
    { name: 'None', color: '#B9B9B9' }
  ],
  'Trimethoprim-sulfamethoxazole': [
    { name: 'dfrA1 + sul1', color: '#ffeda0' },
    { name: 'dfrA1 + sul2', color: '#a50f15' },
    { name: 'dfrA1 + sul1 + sul2', color: '#fcc5c0' },
    { name: 'dfrA5 + sul1', color: '#fd8d3c' },
    { name: 'dfrA5 + sul2', color: '#6a5acd' },
    { name: 'dfrA5 + sul1 + sul2', color: '#bcbddc' },
    { name: 'dfrA7 + sul1', color: '#addd8e' },
    { name: 'dfrA7 + sul2', color: '#f1b6da' },
    { name: 'dfrA7 + sul1 + sul2', color: '#fdd0a2' },
    { name: 'dfrA7 + dfrA14 + sul1 + sul2', color: '#F54CEB' },
    { name: 'dfrA14 + sul1', color: '#9e9ac8' },
    { name: 'dfrA14 + sul2', color: '#fb8072' },
    { name: 'dfrA14 + sul1 + sul2', color: '#c994c7' },
    { name: 'dfrA15 + sul1', color: '#4682b4' },
    { name: 'dfrA15 + sul2', color: '#6baed6' },
    { name: 'dfrA15 + sul1 + sul2', color: '#9ecae1' },
    { name: 'dfrA17 + sul1', color: '#7a0177' },
    { name: 'dfrA17 + sul2', color: '#2e8b57' },
    { name: 'dfrA17 + sul1 + sul2', color: '#a8ddb5' },
    { name: 'dfrA18 + sul1', color: '#54278f' },
    { name: 'dfrA18 + sul2', color: '#98fb98' },
    { name: 'dfrA18 + sul1 + sul2', color: '#fc9272' },
    { name: 'None', color: '#B9B9B9' }
  ],
  MDR: [
    { name: 'MDR', color: '#67001f' },
    { name: 'Non-MDR', color: '#B9B9B9' },
  ],
  XDR: [
    { name: 'XDR', color: '#000' },
    { name: 'Non-XDR', color: '#B9B9B9' },
  ],
  Susceptible:[
    { name: 'Susceptible', color: '#000053'},
    { name: 'Non-Susceptible', color: '#b52b24' }
    ]
  };

// Color variables
export const lightGrey = '#D3D3D3';
export const darkGrey = '#727272';
export const zeroPercentColor = '#A20F17';
export const zeroCountColor = '#F5F4F6';
export const hoverColor = '#D2F1F6';
