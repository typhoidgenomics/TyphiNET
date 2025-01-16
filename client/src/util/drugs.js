// List of Salmonella drugs
export const drugs = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Chloramphenicol',
  // 'Co-trimoxazole',
  'Trimethoprim-sulfamethoxazole',
  // 'ESBL',
  'Ceftriaxone',
  // 'Fluoroquinolones (CipNS)',
  'Ciprofloxacin NS',
  // 'Fluoroquinolones (CipR)',
  'Ciprofloxacin R',
  'Sulphonamides',
  'Susceptible',
  'Tetracyclines',
  'Trimethoprim'
].sort((a, b) => a.localeCompare(b));

export const drugsForDrugResistanceGraph = [...drugs, 'XDR', 'MDR'].sort((a, b) => a.localeCompare(b));

export const defaultDrugsForDrugResistanceGraph = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'MDR',
  'Susceptible',
  'Trimethoprim-sulfamethoxazole',
  'XDR'
];

// List of Salmonella drug classes
export const drugClasses = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Chloramphenicol',
  // 'Co-trimoxazole',
  'Trimethoprim-sulfamethoxazole',
  // 'ESBL',
  'Ceftriaxone',
  // 'Fluoroquinolones (CipNS)',
  'Ciprofloxacin NS',
  'Sulphonamides',
  'Tetracyclines',
  'Trimethoprim',
  'MDR',
  'XDR',
  'Susceptible'
];
