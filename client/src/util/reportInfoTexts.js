export function getSalmonellaTexts(date = new Date().toLocaleDateString()) {
  return [
    // eslint-disable-next-line no-template-curly-in-string
    `This report was generated at ${date}, using TyphiNET (https://typhi.net), a data visualisation platform that draws genome-derived data on antimicrobial resistance and genotypes from Typhi Pathogenwatch (https://pathogen.watch), curated by the Global Typhoid Genomics Consortium (https://www.typhoidgenomics.org).`,
    'TyphiNET data were last updated on January 24th 2024. For code and further details please see: (https://github.com/typhoidgenomics/TyphiNET).',
    'The genotypes reported here are defined in Dyson & Holt (2021), J. Infect. Dis., please see: (https://doi.org/10.1093/infdis/jiab414).',
    'Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper, Argimón et al. 2021, Nat. Commun., please see: (https://doi.org/10.1038/s41467-021-23091-2).',
    'Travel-associated cases are attributed to the country of travel, not the country of isolation, Ingle et al. 2019, PLoS NTDs., please see: (https://doi.org/10.1371/journal.pntd.0007620).',
    'TyphiNET presents data aggregated from >100 studies. Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the TyphiNET website (https://typhi.net).',
    'This project has received funding from the Wellcome Trust (Open Research Fund, 219692/Z/19/Z and AMRnet project, 226432/Z/22/Z) and the  European Union Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681.',
  ]
  }

  export function abbrivations() {
  return [
    `* MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
    `* XDR, is extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
    `* Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more qnr genes or mutations in gyrA/parC/gyrB)`,
    `* Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
  ]
}

