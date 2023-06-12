import { lightGrey } from '../../../util/colorHelper';

export const getColorForDrug = (drug) => {
  switch (drug) {
    case 'Ampicillin':
    case 'Aminoglycosides':
      return 'rgb(129,178,210)';

    case 'Azithromycin':
    case 'Carbapenems':
      return 'rgb(144,211,199)';

    case 'Chloramphenicol':
    case 'Cephalosporins (3rd gen.)':
      return 'rgb(249,129,117)';

    // case 'Co-trimoxazole':
    case 'Trimethoprim-sulfamethoxazole':
    case 'Cephalosporins (3rd gen.) + β-lactamase inhibitors':
      return 'rgb(252,180,105)';

    // case 'ESBL':
    case 'Ceftriaxone':
    case 'Colistin':
      return '#DB90F0';

    // case 'Fluoroquinolones (CipI)':
    case 'Fosfomycin':
      return '#98fb98';

    // case 'Fluoroquinolones (CipNS)':
    case 'Ciprofloxacin NS':
    case 'Penicillins':
      return 'rgb(255,236,120)';

    // case 'Fluoroquinolones (CipR)':
    case 'Ciprofloxacin R':
    case 'Fluoroquinolones':
      return '#9e9ac8';

    case 'Sulphonamides':
    case 'Sulfonamides':
      return 'rgb(180,221,112)';

    case 'Susceptible':
      return lightGrey;

    case 'Tetracyclines':
    case 'Tetracycline':
      return 'rgb(251,207,229)';

    case 'Trimethoprim':
      return 'rgb(102,102,255)';

    case 'Penicillins + β-lactamase inhibitors':
      return '#F3AAB9';

    case 'Phenicols':
      return '#FBCFBA';

    case 'Tigecycline':
      return '#54C2FF';

    case 'XDR':
      return '#000';

    case 'MDR':
      return '#B80F0F';

    default:
      return '#F5F4F6';
  }
};
