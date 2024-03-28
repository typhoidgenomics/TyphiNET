export function getSalmonellaTexts(date = new Date().toLocaleDateString()) {
  return [
      // eslint-disable-next-line no-template-curly-in-string
      `This report was generated at ${date}, using TyphiNET (https://www.typhi.net), a data visualisation platform that draws genome-derived data on antimicrobial resistance and genotypes from Typhi Pathogenwatch (https://pathogen.watch), curated by the Global Typhoid Genomics Consortium (https://www.typhoidgenomics.org).`,
      `Source Data`,
      `TyphiNET data were last updated on 24 March 2024. For code and further details please see: (https://github.com/typhoidgenomics/TyphiNET).`,
      `Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMed ID for citation) can be downloaded as a spreadsheet from the TyphiNET website (https://www.typhi.net).`,
      `Variable definitions`,  
      `The genotypes reported here are defined in Dyson & Holt (2021), J. Infect. Dis. (https://doi.org/10.1093/infdis/jiab414).`,
      `Travel-associated cases are attributed to the country of travel, not the country of isolation, Ingle et al. 2019, PLoS NTDs., (https://doi.org/10.1371/journal.pntd.0007620).`,
      `Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper, Argimon et al. 2021, Nat. Commun., (https://doi.org/10.1038/s41467-021-23091-2).`,
      'Abbreviations',
      `1. MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
      `2. XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
      `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more`, 
      `genes or mutations in`,
      `)`,
      `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
      `Funding`,											
      `Initial development of the TyphiNET dashboard received funding from the Wellcome Trust (Open Research Fund, 219692/Z/19/Z) and the European Union Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681       . Further development of TyphiNET, and expansion to other organisms, is funded by the Wellcome Trust (AMRnet Project, 226432/Z/22/Z).`

    ]
  }

  export function abbrivations() {
  return [
    `1. MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
    `2. XDR, is extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
    `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more qnr genes or mutations in gyrA/parC/gyrB)`,
    `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
  ]
}


