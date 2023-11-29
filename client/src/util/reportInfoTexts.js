export function getSalmonellaTexts(date) {
  return [
    `This report was generated at ${date}, using TyphiNET (https://typhi.net), a data visualisation platform that draws genome-derived data on antimicrobial resistance and genotypes from Typhi Pathogenwatch (https://pathogen.watch).`,
    'TyphiNET data were last updated on September 12 2023. For code and further details please see: (https://github.com/typhoidgenomics/TyphiNET).',
    'The genotypes reported here are defined in Dyson & Holt (2021), J. Infect. Dis., please see: (https://academic.oup.com/jid/article/224/Supplement_7/S775/6358992?login=true).',
    'Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper, Argimón et al. 2021, Nat. Commun., please see: (https://www.nature.com/articles/s41467-021-23091-2).',
    'Travel-associated cases are attributed to the country of travel, not the country of isolation, Ingle et al. 2019, PLoS NTDs., please see: (https://journals.plos.org/plosntds/article?id=10.1371/journal.pntd.0007620).',
    'TyphiNET presents data aggregated from >100 studies. Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the TyphiNET website (https://typhi.net).',
    "This project has received funding from the the Wellcome Trust (Open Research Fund, 219692/Z/19/Z) and the  European Union's Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681."
  ];
}
