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
  'Tetracyclines',
  'Trimethoprim',
].sort((a, b) => a.localeCompare(b));

export const drugsForDrugResistanceAndFrequencyGraph = [...drugs,'Susceptible', 'MDR', 'XDR'];

export const defaultDrugsForDrugResistanceGraph = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'Trimethoprim-sulfamethoxazole',
  'Susceptible',
  'MDR',
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
  'Susceptible',
  'MDR',
  'XDR',
  
];
