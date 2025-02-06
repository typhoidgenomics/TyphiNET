// Drug rules for Salmonella, where the column has to have one of the values to validate the rule. For frequencies and
// drug resistance graphs
export const drugRules = [
  { key: 'Ampicillin/Amoxicillin', columnID: 'blaTEM-1D', values: ['1'] },
  { key: 'Azithromycin', columnID: 'azith_pred_pheno', values: ['AzithR'] },
  { key: 'Chloramphenicol', columnID: 'chloramphenicol_category', values: ['ChlR'] },
  // { key: 'Co-trimoxazole', columnID: 'co_trim', values: ['1'] },
  { key: 'Trimethoprim-sulfamethoxazole', columnID: 'co_trim', values: ['1'] },
  // { key: 'ESBL', columnID: 'ESBL_category', values: ['ESBL'] },
  { key: 'Ceftriaxone', columnID: 'ESBL_category', values: ['ESBL'] },
  // { key: 'Fluoroquinolones (CipNS)', columnID: 'cip_pred_pheno', values: ['CipR', 'CipI'] },
  // { key: 'Ciprofloxacin R', columnID: 'cip_pred_pheno', values: ['CipR'] },
  { key: 'Ciprofloxacin NS', columnID: 'cip_pred_pheno', values: ['CipNS'] },
  { key: 'Sulphonamides', columnID: 'sul_any', values: ['1'] },
  // { key: 'Susceptible', columnID: 'amr_category', values: ['No AMR detected'] },
  { key: 'Pansusceptible', columnID: 'Pansusceptible', values: ['1'] },
  { key: 'Tetracyclines', columnID: 'tetracycline_category', values: ['TetR'] },
  { key: 'Trimethoprim', columnID: 'dfra_any', values: ['1'] },
  { key: 'MDR', columnID: 'MDR', values: ['MDR'] },
  { key: 'XDR', columnID: 'XDR', values: ['XDR'] },
];

export const drugRulesForDrugResistanceGraph = [
  { key: 'MDR', columnID: 'MDR', values: ['MDR'] },
  { key: 'XDR', columnID: 'XDR', values: ['XDR'] }
];

// Salmonella drug classes rules for determinants graph
export const drugClassesRules = {
  "Ampicillin/Amoxicillin": [
    {
      name: 'blaTEM-1D',
      susceptible: false,
      rules: [{ columnID: 'blaTEM-1D', value: '1' }]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'blaTEM-1D', value: '0' }]
    }
  ],
  Azithromycin: [
    {
      name: 'acrB_R717Q + acrB_R717L',
      susceptible: false,
      rules: [
        { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717Q', value: '1' },
        { columnID: 'acrB_R717L', value: '1' }
      ]
    },
    {
      name: 'acrB_R717Q',
      susceptible: false,
      rules: [
        { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717Q', value: '1' },
        { columnID: 'acrB_R717L', value: '0' }
      ]
    },
    {
      name: 'acrB_R717L',
      susceptible: false,
      rules: [
        { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717L', value: '1' },
        { columnID: 'acrB_R717Q', value: '0' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'azith_pred_pheno', value: 'AzithS' }]
    }
  ],
  Chloramphenicol: [
    {
      name: 'catA1 + cmlA',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'catA1', value: '1' },
        { columnID: 'cmlA', value: '1' }
      ]
    },
    {
      name: 'catA1',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'catA1', value: '1' },
        { columnID: 'cmlA', value: '0' }
      ]
    },
    {
      name: 'cmlA',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'cmlA', value: '1' },
        { columnID: 'catA1', value: '0' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'chloramphenicol_category', value: 'ChlS' }]
    }
  ],
  // 'Co-trimoxazole': [
  'Trimethoprim-sulfamethoxazole': [
    {
      name: 'dfrA7 + dfrA14 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA7 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA7 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA7 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA14 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '0' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA14 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '0' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA14 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '0' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA1 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA1 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA5 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA5 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA5 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA15 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA15 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA15 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA17 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA17 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA17 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA18 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'dfrA18 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'dfrA18 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'co_trim', value: '0' }]
    }
  ],
  // ESBL: [
  Ceftriaxone: [
    {
      name: 'blaCTX-M-15',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaCTX-M-15_23', value: '1' }
      ]
    },
    {
      name: 'blaCTX-M-12',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaCTX-M-12', value: '1' }
      ]
    },
    {
      name: 'blaOXA-7',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaOXA-7', value: '1' }
      ]
    },
    {
      name: 'blaSHV-12',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaSHV-12', value: '1' }
      ]
    },
    {
      name: 'blaCTX-M-55',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaCTX-M-55', value: '1' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'ESBL_category', value: 'Non-ESBL' }]
    }
  ],
  // 'Fluoroquinolones (CipNS)': [
  'Ciprofloxacin NS': [
    {
      name: '3_QRDR + qnrS (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '3_QRDR + qnrS' }]
    },
    {
      name: '3_QRDR + qnrB (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '3_QRDR + qnrB' }]
    },
    {
      name: '3_QRDR (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '3_QRDR' }]
    },
    {
      name: '2_QRDR + qnrS (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '2_QRDR + qnrS' }]
    },
    {
      name: '2_QRDR + qnrB (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '2_QRDR + qnrB' }]
    },
    {
      name: '2_QRDR (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '2_QRDR' }]
    },
    {
      name: '1_QRDR + qnrS (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '1_QRDR + qnrS' }]
    },
    {
      name: '1_QRDR + qnrB (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '1_QRDR + qnrB' }]
    },
    {
      name: '1_QRDR (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '1_QRDR' }]
    },
    {
      name: '0_QRDR + qnrS (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR + qnrS' }]
    },
    {
      name: '0_QRDR + qnrB (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR + qnrB' }]
    },
    {
      name: '0_QRDR + qnrS + qnrD (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR + qnrS + qnrD' }]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR' }]
    }
  ],
  Sulphonamides: [
    {
      name: 'sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'sul_any', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' }
      ]
    },
    {
      name: 'sul1',
      susceptible: false,
      rules: [
        { columnID: 'sul_any', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' }
      ]
    },
    {
      name: 'sul2',
      susceptible: false,
      rules: [
        { columnID: 'sul_any', value: '1' },
        { columnID: 'sul2', value: '1' },
        { columnID: 'sul1', value: '0' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'sul_any', value: '0' }]
    }
  ],
  Tetracyclines: [
    {
      name: 'tetA(A)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(A)', value: '1' }
      ]
    },
    {
      name: 'tetA(B)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(B)', value: '1' }
      ]
    },
    {
      name: 'tetA(C)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(C)', value: '1' }
      ]
    },
    {
      name: 'tetA(D)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(D)', value: '1' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'tetracycline_category', value: 'TetS' }]
    }
  ],
  Trimethoprim: [
    {
      name: 'dfrA7 + dfrA14',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '1' }
      ]
    },
    {
      name: 'dfrA7',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' }
      ]
    },
    {
      name: 'dfrA14',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'dfrA7', value: '0' }
      ]
    },
    {
      name: 'dfrA1',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' }
      ]
    },
    {
      name: 'dfrA5',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' }
      ]
    },
    {
      name: 'dfrA15',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' }
      ]
    },
    {
      name: 'dfrA17',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' }
      ]
    },
    {
      name: 'dfrA18',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' }
      ]
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'dfra_any', value: '0' }]
    }
  ],
  MDR:[
    {
      name: 'MDR',
      susceptible: false,
      rules: [{ columnID: 'MDR', value: 'MDR' }],
    },
    {
      name: 'Non-MDR',
      susceptible: true,
      rules: [{ columnID: 'MDR', value: '-' }],
    },

  ],
  XDR:[
    {
      name: 'XDR',
      susceptible: false,
      rules: [{ columnID: 'XDR', value: 'XDR' }],
    },
    {
      name: 'Non-XDR',
      susceptible: true,
      rules: [{ columnID: 'XDR', value: '-' }],
    },
  ],
  'Pansusceptible':[
    {
      name: 'Pansusceptible (no AMR markers)',
      susceptible: true,
      rules: [{ columnID: 'Pansusceptible', value: '1' }]
    },
    {
      name: 'One or more AMR markers',
      susceptible: false,
      rules: [{ columnID: 'Pansusceptible', value: '0' },]
    }
  ]

};
