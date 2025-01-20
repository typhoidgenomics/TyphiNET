import { drugClassesRules, drugRules, drugRulesForDrugResistanceGraph } from '../../util/drugClassesRules';

// This filter is called after either dataset, initialYear, finalYear or country changes and if reset button is pressed.
// And it returns the data filtered by the variables said before, also the list of unique genotypes, count of genotypes


// and count of genomes.
export function filterData({ data, dataset, actualTimeInitial, actualTimeFinal, actualCountry }) {
  const checkDataset = (item) => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const checkTime = (item) => {
    return item.DATE >= actualTimeInitial && item.DATE <= actualTimeFinal;
  };

  const newData = data.filter((x) => checkDataset(x) && checkTime(x));
  const genotypes = [...new Set(newData.map((x) => x.GENOTYPE))];
  // genotypes.sort((a, b) => a.localeCompare(b));

  let genomesCount = newData.length;
  let genotypesCount = genotypes.length;
  let listPMID = [];

  if (actualCountry !== 'All') {
    const countryData = newData.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry);
    genomesCount = countryData.length;
    listPMID = [...new Set(countryData.map((x) => x.PMID))];

    const countryGenotypes = [...new Set(countryData.map((x) => x.GENOTYPE))];
    genotypesCount = countryGenotypes.length;
  }
    // let year = [...new Set(newData.map((x) => x.DATE))];
    // console.log("year", year)
    
  return {
    data: newData,
    genotypes,
    genomesCount,
    genotypesCount,
    listPMID,
    // year,
  };
}
export function filterDataBrush({data, dataset,starttimeGD, endtimeGD, starttimeDRT, endtimeDRT}){
  const checkDataset = (item) => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const checkTimeGD = (item) => {
    return item.DATE >= starttimeGD && item.DATE <= endtimeGD;
  };
  const checkTimeDRT = (item) => {
    return item.DATE >= starttimeDRT && item.DATE <= endtimeDRT;
  };

  const newDataGD = data.filter((x) => checkDataset(x) && checkTimeGD(x));
  const newDataDRT = data.filter((x) => checkDataset(x) && checkTimeDRT(x));

  let genomesCountGD = newDataGD.length;
  let genomesCountDRT = newDataDRT.length;

  return {genomesCountGD, genomesCountDRT};
}

// Adjust the country names to its correct name
export function getCountryDisplayName(country) {
  switch (country) {
    case 'Democratic Republic of the Congo':
    case 'Democratic Republic of Congo':
    case 'Congo':
    case 'DRC':
    case 'DR Congo':
    case 'Congo Republic':
      return 'Dem. Rep. Congo';
    case 'Channel Islands':
      return 'Jersey';
    case 'Czech Republic':
      return 'Czechia';
    case 'Central African Republic':
      return 'Central African Rep.';
    case 'Ivory Coast':
    case "Cote d'Ivoire":
      return "Côte d'Ivoire";
    case 'East Timor':
      return 'Timor-Leste';
    case 'State of Palestine':
      return 'Palestine';
    case 'Dominican Republic':
      return 'Dominican Rep.';
    case 'Viet Nam':
      return 'Vietnam';
    case 'Myanmar [Burma]':
      return 'Myanmar';
    case 'French Polynesia':
      return 'Fr. Polynesia';
    case 'The Netherlands':
      return 'Netherlands';
    case 'USA':
    case 'United States':
    case 'United States?':
      return 'United States of America';
    case 'Cape Verde':
      return 'Cabo Verde';
    case 'Turks and Caicos Islands':
      return 'Turks and Caicos Is.';
    case 'United Kingdom (England/Wales/N. Ireland)':
    case 'United Kingdom (Scotland)':
    case 'United Kingdom?':
    case 'Northern Ireland':
    case 'England':
    case 'Scotland':
    case 'Wales':
    case 'UK':
      return 'United Kingdom';
    case 'The Gambia':
      return 'Gambia';
    case 'Canada?':
      return 'Canada';
    case 'Cayman Islands':
      return 'Cayman Is.';
    case 'Madeira':
      return 'Portugal';
    case 'SriLanka':
      return 'Sri Lanka';
    case 'Saint Vincent and the Grenadines':
      return 'St. Vin. and Gren';
    case 'Philipines':
      return 'Philippines';
    case 'Metropolitan France':
      return 'France';
    default:
      return country;
  }
}

// Get specific drug count, percentage and al its types for the map component
function getMapStatsData({ countryData, columnKey, statsKey }) {
  const data = {
    items: [],
    percentage: 0,
    count: 0
  };

  const columnData = [...new Set(countryData.map((x) => x[columnKey]))];
  data.items = columnData.map((name) => {
    const count = countryData.filter((x) => x[columnKey] === name).length;
    const percentage = Number(((count / countryData.length) * 100).toFixed(2));

    if (name === statsKey) {
      data.count = count;
      data.percentage = percentage;
    }
    return { name, count, percentage };
  });

  if (statsKey === '-') {
    data.count = countryData.length - data.count;
    data.percentage = Number(((data.count / countryData.length) * 100).toFixed(2));
  }

  return data;
}

// Get country data for map component, the data includes the name, count and drug stats
export function getMapData({ data, countries }) {
  const mapData = countries.map((country) => {
    const stats = {
      GENOTYPE: {
        items: [],
        count: 0
      }
    };

    const countryData = data.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === country);

    if (countryData.length === 0) {
      return {};
    }

    const genotypes = [...new Set(countryData.map((x) => x.GENOTYPE))];
    stats.GENOTYPE.count = genotypes.length;
    stats.GENOTYPE.items = genotypes.map((genotype) => {
      return {
        name: genotype,
        count: countryData.filter((x) => x.GENOTYPE === genotype).length
      };
    });
    stats.GENOTYPE.items.sort((a, b) => (a.count <= b.count ? 1 : -1));
    stats.Ceftriaxone = getMapStatsData({ countryData, columnKey: 'ESBL_category', statsKey: 'ESBL' });
    stats.H58 = getMapStatsData({ countryData, columnKey: 'GENOTYPE_SIMPLE', statsKey: 'H58' });
    stats.MDR = getMapStatsData({ countryData, columnKey: 'MDR', statsKey: 'MDR' });
    stats.XDR = getMapStatsData({ countryData, columnKey: 'XDR', statsKey: 'XDR' });
    stats.AzithR = getMapStatsData({ countryData, columnKey: 'azith_pred_pheno', statsKey: 'AzithR' });
    stats.Susceptible = getMapStatsData({ countryData, columnKey: 'amr_category', statsKey: 'No AMR detected' });
    stats.CipR = getMapStatsData({ countryData, columnKey: 'cip_pred_pheno', statsKey: 'CipR' });
    stats.CipNS = getMapStatsData({ countryData, columnKey: 'cip_pred_pheno', statsKey: 'CipNS' });

    return {
      name: country,
      count: countryData.length,
      stats
    };
  });

  return mapData;
}

// Get data for distribution and drug resistance graphs
export function getYearsData({ data, years, actualCountry, getUniqueGenotypes = false }) {
  const drugsData = [];
  const genotypesAndDrugsData = {};
  let uniqueGenotypes = [];
  const genotypesAndDrugsDataUniqueGenotypes = {};

  const genotypesData = years.map((year) => {
    const yearData = data.filter((x) => x.DATE === year && (actualCountry === 'All' || getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry)
);
    const response = {
      name: year.toString(),
      count: yearData.length
    };
    let stats = {};

    if (yearData.length > 0) {
      const genotypes = [...new Set(yearData.map((x) => x.GENOTYPE))];

      stats = genotypes.reduce((accumulator, currentValue) => {
        const count = yearData.filter((x) => x.GENOTYPE === currentValue).length;
        accumulator[currentValue] = count;

        return accumulator;
      }, {});

      if (yearData.length >= 10) {
        const drugStats = {};

        drugRules.forEach((rule) => {
          const drugData = yearData.filter((x) => rule.values.includes(x[rule.columnID]));
          drugStats[rule.key] = drugData.length;

          if (rule.key === 'Ciprofloxacin NS') {
            drugStats['Ciprofloxacin R'] = yearData.filter((x) => x[rule.columnID] === 'CipR').length;
            drugStats['Ciprofloxacin NS'] = drugStats['Ciprofloxacin NS'] + drugStats['Ciprofloxacin R'];
          }
        });

        drugRulesForDrugResistanceGraph.forEach((rule) => {
          const drugData = yearData.filter((x) => rule.values.includes(x[rule.columnID]));
          drugStats[rule.key] = drugData.length;
        });
        
        // const susceptible = yearData.filter((x) => x.num_resistance_classes === '0');
        // drugStats['Susceptible'] = susceptible.length;

        drugsData.push({ ...response, ...drugStats });
      }
    }

    return {
      ...response,
      ...stats
    };
  });
  if (getUniqueGenotypes) {
    uniqueGenotypes = [...new Set(uniqueGenotypes.map((x) => x))];
    uniqueGenotypes.sort((a, b) => a - b);
  }

  Object.keys(genotypesAndDrugsDataUniqueGenotypes).forEach((key) => {
    const unique = [...new Set(genotypesAndDrugsDataUniqueGenotypes[key])];

    genotypesAndDrugsData[key].forEach((item) => {
      const keys = Object.keys(item);
      const filtered = unique.filter((x) => !keys.includes(x));
      filtered.forEach((x) => {
        item[x] = 0;
      });
    });
  });

  return { genotypesData: genotypesData.filter((x) => x.count > 0), drugsData };
}

// Get data for frequencies and determinants graphs
export function getGenotypesData({ data, genotypes, actualCountry }) {
  const genotypesDrugClassesData = {};

  drugRules.forEach((drug) => {
    if (drug.key !== 'Susceptible') {
      genotypesDrugClassesData[drug.key] = [];
    }
  });

  const genotypesDrugsData = genotypes.map((genotype) => {
    const genotypeData = data.filter((x) => x.GENOTYPE === genotype && (actualCountry === 'All' || getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry)
    );

    const response = {
      name: genotype,
      totalCount: genotypeData.length,
      resistantCount: 0
    };

    const drugClassResponse = {
      name: genotype,
      totalCount: genotypeData.length,
      resistantCount: 0
    };

    drugRules.forEach((rule) => {
      const drugData = genotypeData.filter((x) => rule.values.includes(x[rule.columnID]));
      response[rule.key] = drugData.length;

      if (rule.key === 'Ciprofloxacin NS') {
        response['Ciprofloxacin R'] = genotypeData.filter((x) => x[rule.columnID] === 'CipR').length;
        response['Ciprofloxacin NS'] = response['Ciprofloxacin NS'] + response['Ciprofloxacin R'];

      }

      if (rule.key !== 'Susceptible') {
        const drugClass = { ...drugClassResponse };

        drugClassesRules[rule.key].forEach((classRule) => {
          const classRuleName = classRule.name;

          drugClass[classRuleName] = genotypeData.filter((x) => {
            return classRule.rules.every((r) => x[r.columnID] === r.value);
          }).length;

          if (classRule.susceptible) {
            drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
          }
        });

        genotypesDrugClassesData[rule.key].push(drugClass);
      }
    });

    response.resistantCount = response.totalCount - response['Susceptible'];
    return response;
  });

  genotypesDrugsData.sort((a, b) => b.resistantCount - a.resistantCount);
  Object.keys(genotypesDrugClassesData).forEach((key) => {
    genotypesDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount);
    genotypesDrugClassesData[key] = genotypesDrugClassesData[key].slice(0, 10);
  });

  return { genotypesDrugsData, genotypesDrugClassesData };
}


//Get Year based on Local and Travel filter
export function getYears({ data, dataset }) {
  // Filter the data based on the dataset parameter
  const filteredData = data.filter(item => {
    if (dataset === 'All') {
      return true;
    } else {
      return item.TRAVEL.toLowerCase() === dataset.toLowerCase();
    }
  });

  // Extract the unique and sorted dates from the filtered data
  const dates = Array.from(
    new Set(filteredData.map(item => item.DATE))
  ).sort();

  return dates;
}
