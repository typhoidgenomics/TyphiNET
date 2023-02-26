const WMCDTemplate = {
  GENOTYPES: {
    GENOTYPES_LIST: [],
    TOTAL: 0,
  },
  H58: 0,
  MDR: 0,
  XDR: 0,
  DCS: 0,
  AzithR: 0,
  CipI: 0,
  CipR: 0,
  CipI_R: 0,
  STAD: 0,
  TOTAL_OCCURRENCE: 0,
};

function WMCDAux(currentData, data) {
  currentData = JSON.parse(currentData);

  currentData["TOTAL_OCCURRENCE"]++;
  if (
    currentData["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) === -1
  ) {
    currentData["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"]);
    currentData["GENOTYPES"]["TOTAL"]++;
  }

  if (data["GENOTYPE_SIMPLE"] === "H58") {
    currentData["H58"]++;
  }
  if (data["MDR"] === "MDR") {
    currentData["MDR"]++;
  }
  if (data["XDR"] === "XDR") {
    currentData["XDR"]++;
  }
  if (data["dcs_category"] === "DCS") {
    currentData["DCS"]++;
  }
  if (data["azith_pred_pheno"] === "AzithR") {
    currentData["AzithR"]++;
  }
  if (data["cip_pred_pheno"] === "CipI") {
    currentData["CipI"]++;
    currentData["CipI_R"]++;
  }
  if (data["cip_pred_pheno"] === "CipR") {
    currentData["CipR"]++;
    currentData["CipI_R"]++;
  }
  if (data["amr_category"] === "No AMR detected") {
    currentData["STAD"]++;
  }

  return currentData;
}

function WMCDResults(worldMapComplementaryResults) {
  worldMapComplementaryResults = JSON.parse(worldMapComplementaryResults);

  for (let data in worldMapComplementaryResults) {
    worldMapComplementaryResults[data]["H58"] =
      (worldMapComplementaryResults[data]["H58"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["MDR"] =
      (worldMapComplementaryResults[data]["MDR"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["XDR"] =
      (worldMapComplementaryResults[data]["XDR"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["DCS"] =
      (worldMapComplementaryResults[data]["DCS"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["AzithR"] =
      (worldMapComplementaryResults[data]["AzithR"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["CipI"] =
      (worldMapComplementaryResults[data]["CipI"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["CipR"] =
      (worldMapComplementaryResults[data]["CipR"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["CipI_R"] =
      (worldMapComplementaryResults[data]["CipI_R"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    worldMapComplementaryResults[data]["STAD"] =
      (worldMapComplementaryResults[data]["STAD"] /
        worldMapComplementaryResults[data]["TOTAL_OCCURRENCE"]) *
      100;
    delete worldMapComplementaryResults[data].TOTAL_OCCURRENCE;
  }
  return worldMapComplementaryResults;
}

function WMCountData(
  currentData,
  data,
  displayName,
  elementToCount,
  parentName,
  childName,
  h58 = false,
  other = "",
  cipI = false
) {
  currentData = JSON.parse(currentData);

  if (!currentData.some((e) => e.name === data.COUNTRY_ONLY)) {
    currentData.push({
      name: data.COUNTRY_ONLY,
      displayName: displayName,
      total: 1,
      [parentName]: [{ [childName]: data[elementToCount], count: 1 }],
    });
    if (elementToCount !== "GENOTYPE")
      currentData[currentData.length - 1].percentage = 0;
    if (!h58 && elementToCount !== "GENOTYPE")
      currentData[currentData.length - 1].count = 0;
  } else {
    const country = currentData.find((e) => e.name === data["COUNTRY_ONLY"]);
    const countryIndex = currentData.findIndex(
      (e) => e.name === data["COUNTRY_ONLY"]
    );

    if (
      !country[parentName].some((e) => e[childName] === data[elementToCount])
    ) {
      country[parentName].push({
        [childName]: data[elementToCount],
        count: 1,
      });
    } else {
      let parent = country[parentName].find(
        (e) => e[childName] === data[elementToCount]
      );
      let index = country[parentName].findIndex(
        (e) => e[childName] === data[elementToCount]
      );
      parent.count = parent.count + 1;
      country[parentName][index] = parent;
    }
    country.total = country.total + 1;

    if (h58) {
      country[parentName].forEach((g, index) => {
        let percentage = (g.count / country.total) * 100;
        if (Math.round(percentage) !== percentage) {
          percentage = percentage.toFixed(2);
        }
        g.percentage = percentage;
      });
    } else if (other !== "") {
      country[parentName].forEach((item, index) => {
        if (item[childName] === other) {
          let percentage = (item.count / country.total) * 100;
          if (Math.round(percentage) !== percentage)
            percentage = percentage.toFixed(2);
          percentage = parseFloat(percentage);
          country.percentage = percentage;
          country.count = item.count;
        }
      });
      if (country.percentage === undefined) {
        country.percentage = parseFloat(0);
      }
      if (country.count === undefined) {
        country.count = 0;
      }
    } else if (cipI) {
      let aux = country.CipIs.filter((x) => x.type === "CipI");
      let aux2 = country.CipIs.filter((x) => x.type === "CipR");
      if (aux.length) {
        aux[0].percentage = (aux[0].count / country.total) * 100;
        aux = aux[0].count;
      } else aux = 0;
      if (aux2.length) {
        aux2[0].percentage = (aux2[0].count / country.total) * 100;
        aux2 = aux2[0].count;
      } else aux2 = 0;

      let percentage = ((aux + aux2) / country.total) * 100;
      if (Math.round(percentage) !== percentage)
        percentage = percentage.toFixed(2);
      percentage = parseFloat(percentage);
      country.percentage = percentage;
      country.count = aux + aux2;
      if (country.percentage === undefined) country.percentage = parseFloat(0);
      if (country.count === undefined) country.count = 0;
    }

    currentData[countryIndex] = country;
  }

  return currentData;
}

function WMCountDataResults(worldMapCurrent, parentName) {
  worldMapCurrent = JSON.parse(worldMapCurrent);
  worldMapCurrent.forEach((country) => {
    country[parentName].sort((a, b) => b.count - a.count);
  });
  worldMapCurrent.sort((a, b) => a.name.localeCompare(b.name));

  return worldMapCurrent;
}

function ChartData(RFWGData, DRTData, data) {
  RFWGData = JSON.parse(RFWGData);
  DRTData = JSON.parse(DRTData);

  let index = RFWGData.findIndex((x) => x.name === data.GENOTYPE);
  if (index === -1) {
    RFWGData.push({ name: data.GENOTYPE, total: 0, totalS: 0 });
    index = RFWGData.length - 1;
  }
  RFWGData[index].totalS += 1;

  let index2 = DRTData.findIndex((x) => x.name === data.DATE);
  if (index2 === -1) {
    DRTData.push({
      name: data.DATE,
      total: 0,
      drugsPercentage: {},
      Azithromycin: 0,
      "Fluoroquinolones (CipI/R)": 0,
      ESBL: 0,
      Chloramphenicol: 0,
      Ampicillin: 0,
      "Co-trimoxazole": 0,
      Sulphonamides: 0,
      Trimethoprim: 0,
      Tetracyclines: 0,
      Susceptible: 0,
      "Fluoroquinolones (CipR)": 0,
    });
    index2 = DRTData.length - 1;
  }
  DRTData[index2].total += 1;

  const currentRFWG = RFWGData[index];
  const currentDRT = DRTData[index2];

  if (data["azith_pred_pheno"] === "AzithR") {
    if (currentRFWG["Azithromycin"] === undefined)
      currentRFWG["Azithromycin"] = 1;
    else currentRFWG["Azithromycin"] += 1;
    currentDRT["Azithromycin"] += 1;
  }
  if (data["cip_pred_pheno"] === "CipR" || data["cip_pred_pheno"] === "CipI") {
    if (currentRFWG["Fluoroquinolones (CipI/R)"] === undefined)
      currentRFWG["Fluoroquinolones (CipI/R)"] = 1;
    else currentRFWG["Fluoroquinolones (CipI/R)"] += 1;
    currentDRT["Fluoroquinolones (CipI/R)"] += 1;
  }
  if (data["ESBL_category"] === "ESBL") {
    if (currentRFWG["ESBL"] === undefined) currentRFWG["ESBL"] = 1;
    else currentRFWG["ESBL"] += 1;
    currentDRT["ESBL"] += 1;
  }
  if (data["chloramphenicol_category"] === "ChlR") {
    if (currentRFWG["Chloramphenicol"] === undefined)
      currentRFWG["Chloramphenicol"] = 1;
    else currentRFWG["Chloramphenicol"] += 1;
    currentDRT["Chloramphenicol"] += 1;
  }
  if (data["blaTEM-1D"] === "1") {
    if (currentRFWG["Ampicillin"] === undefined) currentRFWG["Ampicillin"] = 1;
    else currentRFWG["Ampicillin"] += 1;
    currentDRT["Ampicillin"] += 1;
  }
  if (data["co_trim"] === "1") {
    if (currentRFWG["Co-trimoxazole"] === undefined)
      currentRFWG["Co-trimoxazole"] = 1;
    else currentRFWG["Co-trimoxazole"] += 1;
    currentDRT["Co-trimoxazole"] += 1;
  }
  if (data["sul_any"] === "1") {
    if (currentRFWG["Sulphonamides"] === undefined)
      currentRFWG["Sulphonamides"] = 1;
    else currentRFWG["Sulphonamides"] += 1;
    currentDRT["Sulphonamides"] += 1;
  }
  if (data["dfra_any"] === "1") {
    if (currentRFWG["Trimethoprim"] === undefined)
      currentRFWG["Trimethoprim"] = 1;
    else currentRFWG["Trimethoprim"] += 1;
    currentDRT["Trimethoprim"] += 1;
  }
  if (data["tetracycline_category"] === "TetR") {
    if (currentRFWG["Tetracyclines"] === undefined)
      currentRFWG["Tetracyclines"] = 1;
    else currentRFWG["Tetracyclines"] += 1;
    currentDRT["Tetracyclines"] += 1;
  }
  if (data["amr_category"] === "No AMR detected") {
    if (currentRFWG["Susceptible"] === undefined)
      currentRFWG["Susceptible"] = 1;
    else currentRFWG["Susceptible"] += 1;
    currentDRT["Susceptible"] += 1;
  } else {
    currentRFWG.total += 1;
  }
  if (data["cip_pred_pheno"] === "CipR") {
    if (currentRFWG["Fluoroquinolones (CipR)"] === undefined)
      currentRFWG["Fluoroquinolones (CipR)"] = 1;
    else currentRFWG["Fluoroquinolones (CipR)"] += 1;
    currentDRT["Fluoroquinolones (CipR)"] += 1;
  }

  return [RFWGData, DRTData];
}

function DRTDataResults(DRTData) {
  DRTData = JSON.parse(DRTData);
  DRTData.forEach((element) => {
    const drugsPercentage = {};
    for (const key in element) {
      if (key !== "name" && key !== "total") {
        const aux = (element[key] * 100) / element.total;
        drugsPercentage[key] = element[key];
        element[key] = aux;
      }
    }
    element.drugsPercentage = drugsPercentage;
  });
  return DRTData;
}

function AMRData(currentData, data) {
  currentData = JSON.parse(currentData);
  const fluoroR = [
    "3_QRDR + qnrS",
    "3_QRDR + qnrB",
    "3_QRDR",
    "2_QRDR + qnrS",
    "2_QRDR + qnrB",
    "1_QRDR + qnrS",
    "1_QRDR + qnrB",
  ];
  const fluoroI = ["2_QRDR", "1_QRDR", "0_QRDR + qnrS", "0_QRDR + qnrB"];
  const cotrim = [
    "dfrA1",
    "dfrA5",
    "dfrA7",
    "dfrA14",
    "dfrA15",
    "dfrA17",
    "dfrA18",
  ];
  const trime = [
    "dfrA1",
    "dfrA14",
    "dfrA15",
    "dfrA17",
    "dfrA18",
    "dfrA5",
    "dfrA7",
  ];

  Object.keys(currentData).forEach((key) => {
    let index = currentData[key].findIndex((x) => x.genotype === data.GENOTYPE);
    if (index === -1) {
      currentData[key].push({ genotype: data.GENOTYPE, total: 0, total2: 0 });
      index = currentData[key].length - 1;
    }
    if (key === "Azithromycin") {
      const AZITH = data["azith_pred_pheno"];
      if (AZITH === "AzithR") {
        currentData[key][index].total += 1;
        currentData[key][index].total2 += 1;
        if (
          data["ereA"] === "1" &&
          data["acrB_R717Q"] === "1" &&
          data["acrB_R717L" == "1"]
        ) {
          const name = "ereA + acrB_R717Q + acrB_R717L";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        } else {
          if (data["ereA"] === "1" && data["acrB_R717Q"] === "1") {
            const name = "ereA + acrB_R717Q";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          } else if (data["ereA"] === "1" && data["acrB_R717L"] === "1") {
            const name = "ereA + acrB_R717L";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          } else if (data["acrB_R717Q"] === "1" && data["acrB_R717L"] === "1") {
            const name = "acrB_R717Q + acrB_R717L";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          } else if (data["ereA"] === "1") {
            const name = "ereA";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          } else if (data["acrB_R717Q"] === "1") {
            const name = "acrB_R717Q";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          } else if (data["acrB_R717L"] === "1") {
            const name = "acrB_R717L";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          }
        }
      } else if (AZITH === "AzithS") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Fluoroquinolones (CipI/R)") {
      const DCS = data["dcs_mechanisms"];
      if (DCS === "0_QRDR") {
        currentData[key][index].total2 += 1;
        const name = "None (CipS)";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      } else if (fluoroR.includes(DCS)) {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        const name = DCS + " (CipR)";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      } else if (fluoroI.includes(DCS)) {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        const name = DCS + " (CipI)";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "ESBL") {
      const ESBL = data["ESBL_category"];
      if (ESBL === "ESBL") {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        // if (data["blaCTX-M-12"] === "1") {
        //   const name = "blaCTX-M-12";
        //   if (currentData[key][index][name] === undefined) {
        //     currentData[key][index][name] = 1;
        //   } else {
        //     currentData[key][index][name] += 1;
        //   }
        // }
        if (data["blaCTX-M-15_23"] === "1") {
          const name = "blaCTX-M-15";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
        if (data["blaOXA-7"] === "1") {
          const name = "blaOXA-7";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
        if (data["blaSHV-12"] === "1") {
          const name = "blaSHV-12";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
        if (data["blaCTX-M-55"] === "1") {
          const name = "blaCTX-M-55";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
      } else if (ESBL === "Non-ESBL") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Chloramphenicol") {
      const CHLO = data["chloramphenicol_category"];
      if (CHLO === "ChlR") {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        if (data["catA1"] === "1" && data["cmlA"] === "1") {
          const name = "catA1 + cmlA";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        } else {
          if (data["catA1"] === "1") {
            const name = "catA1";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          }
          if (data["cmlA"] === "1") {
            const name = "cmlA";
            if (currentData[key][index][name] === undefined) {
              currentData[key][index][name] = 1;
            } else {
              currentData[key][index][name] += 1;
            }
          }
        }
      } else if (CHLO === "ChlS") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Ampicillin") {
      currentData[key][index].total2 += 1;
      //   if (data["blaTEM-1D"] === "1" && data["blaOXA-1"] === "1") {
      //     currentData[key][index].total += 1;
      //     const name = "blaTEM-1D + blaOXA-1";
      //     if (currentData[key][index][name] === undefined) {
      //       currentData[key][index][name] = 1;
      //     } else {
      //       currentData[key][index][name] += 1;
      //     }
      //   } else

      if (data["blaTEM-1D"] === "1") {
        currentData[key][index].total += 1;
        const name = "blaTEM-1D";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
      //   else if (data["blaOXA-1"] === "1") {
      //     currentData[key][index].total += 1;
      //     const name = "blaOXA-1";
      //     if (currentData[key][index][name] === undefined) {
      //       currentData[key][index][name] = 1;
      //     } else {
      //       currentData[key][index][name] += 1;
      //     }
      //   }
      else {
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Co-trimoxazole") {
      const COTRIM = data["co_trim"];
      if (COTRIM === "1") {
        const genes = [];
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        for (const i in cotrim) {
          if (data[cotrim[i]] === "1") {
            genes.push(cotrim[i]);
          }
        }
        if (data["sul1"] === "1") {
          genes.push("sul1");
        }
        if (data["sul2"] === "1") {
          genes.push("sul2");
        }
        const name = genes.join(" + ");
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      } else if (COTRIM === "0") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Sulphonamides") {
      const SULPH = data["sul_any"];
      if (SULPH === "1") {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        if (data["sul1"] === "1" && data["sul2"] === "1") {
          const name = "sul1 + sul2";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        } else if (data["sul1"] === "1") {
          const name = "sul1";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        } else if (data["sul2"] === "1") {
          const name = "sul2";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
      } else if (SULPH === "0") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Trimethoprim") {
      const TRIM = data["dfra_any"];
      if (TRIM === "1") {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        if (data["dfrA7"] === "1" && data["dfrA14"] === "1") {
          const name = "dfrA7 + dfrA14";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        } else {
          for (const i in trime) {
            if (data[trime[i]] === "1") {
              const name = trime[i];
              if (currentData[key][index][name] === undefined) {
                currentData[key][index][name] = 1;
              } else {
                currentData[key][index][name] += 1;
              }
              break;
            }
          }
        }
      } else if (TRIM === "0") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    } else if (key === "Tetracyclines") {
      const TETRA = data["tetracycline_category"];
      if (TETRA === "TetR") {
        currentData[key][index].total2 += 1;
        currentData[key][index].total += 1;
        if (data["tetA(A)"] === "1") {
          const name = "tetA(A)";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
        if (data["tetA(B)"] === "1") {
          const name = "tetA(B)";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
        if (data["tetA(C)"] === "1") {
          const name = "tetA(C)";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
        if (data["tetA(D)"] === "1") {
          const name = "tetA(D)";
          if (currentData[key][index][name] === undefined) {
            currentData[key][index][name] = 1;
          } else {
            currentData[key][index][name] += 1;
          }
        }
      } else if (TETRA === "TetS") {
        currentData[key][index].total2 += 1;
        const name = "None";
        if (currentData[key][index][name] === undefined) {
          currentData[key][index][name] = 1;
        } else {
          currentData[key][index][name] += 1;
        }
      }
    }
  });

  return currentData;
}

function AMRDataResults(AMRData) {
  AMRData = JSON.parse(AMRData);

  Object.keys(AMRData).forEach((key) => {
    const data = AMRData[key];

    const top10 = [];
    data.forEach((element) => {
      if (top10.length < 10) {
        top10.push(element);
      } else {
        top10.sort(function (a, b) {
          if (a.total === b.total && a.genotype > b.genotype) return -1;
          return a.total > b.total ? -1 : 1;
        });
        if (element.total === top10[9].total) {
          if (element.genotype > top10[9].genotype) top10[9] = element;
        }
        if (element.total > top10[9].total) top10[9] = element;
      }
    });
    top10.sort(function (a, b) {
      if (a.total === b.total && a.genotype > b.genotype) return -1;
      return a.total > b.total ? -1 : 1;
    });
    top10.push({
      maxSum: data.length === 0 ? 0 : Math.ceil(data[0].total2 / 50) * 50,
    });

    AMRData[key] = top10;
  });

  return AMRData;
}

function GDData(currentData, data) {
  currentData = JSON.parse(currentData);

  const index = currentData.findIndex((x) => x.name === data.DATE);
  if (index === -1) {
    currentData.push({
      name: data.DATE,
      [data.GENOTYPE]: 1,
      total: 1,
    });
  } else {
    currentData[index].total += 1;
    if (currentData[index][data.GENOTYPE] === undefined)
      currentData[index][data.GENOTYPE] = 1;
    else currentData[index][data.GENOTYPE] += 1;
  }

  return currentData;
}

export function filterForComponents({
  country,
  minYear,
  maxYear,
  dataset,
  region,
  data,
  amr,
}) {
  const [results, genotypes, worldMapResults, PMIDResults] = [[], [], [], []];
  let [
    aux,
    auxWM,
    worldMapComplementaryResults,
    worldMapG,
    worldMapH58,
    worldMapSTAD,
    worldMapMDR,
    worldMapXDR,
    worldMapAZITH,
    worldMapCIPR,
    worldMapCIPI,
    RFWGResults,
    DRTResults,
    AMRResults,
    GDResults,
  ] = [null, null, {}, [], [], [], [], [], [], [], [], [], [], {}, []];
  AMRResults = {
    Ampicillin: [],
    Azithromycin: [],
    Chloramphenicol: [],
    "Co-trimoxazole": [],
    ESBL: [],
    "Fluoroquinolones (CipI/R)": [],
    Sulphonamides: [],
    Tetracyclines: [],
    Trimethoprim: [],
  };

  const empty = ["", "-"];
  data.forEach((x) => {
    aux = true;
    auxWM = true; // WM = World Map

    // Validation if row will be used, this will allways happen
    if (country !== "All" && x.COUNTRY_ONLY !== country) auxWM = false;
    if (x.DATE < minYear || x.DATE > maxYear) aux = false;
    if (dataset !== "All" && x.TRAVEL !== dataset.toLowerCase()) aux = false;
    if (
      country !== "All" &&
      region !== "All" &&
      (empty.includes(x.REGION_IN_COUNTRY) || region !== x.REGION_IN_COUNTRY)
    )
      auxWM = false;

    // If this passes than it's data for the map
    if (aux && !empty.includes(x.COUNTRY_ONLY)) {
      let displayName = x.COUNTRY_ONLY;
      if (x.COUNTRY_ONLY === "Democratic Republic of the Congo")
        displayName = "Dem. Rep. Congo";
      else if (x.COUNTRY_ONLY === "Central African Republic")
        displayName = "Central African Rep.";
      else if (
        x.COUNTRY_ONLY === "Ivory Coast" ||
        x.COUNTRY_ONLY === "Cote d'Ivoire"
      )
        displayName = "Côte d'Ivoire";
      else if (x.COUNTRY_ONLY === "East Timor") displayName = "Timor-Leste";
      else if (x.COUNTRY_ONLY === "State of Palestine")
        displayName = "Palestine";
      else if (x.COUNTRY_ONLY === "Dominican Republic")
        displayName = "Dominican Rep.";
      else if (x.COUNTRY_ONLY === "Viet Nam") displayName = "Vietnam";
      else if (x.COUNTRY_ONLY === "USA")
        displayName = "United States of America";
      else if (x.COUNTRY_ONLY === "Cape Verde")
        displayName = "Cabo Verde";
      else if (x.COUNTRY_ONLY === "Turks and Caicos Islands")
        displayName = "Turks and Caicos Is.";

      // WORLD MAP
      if (!worldMapResults.some((e) => e.name === x.COUNTRY_ONLY)) {
        worldMapResults.push({
          name: x.COUNTRY_ONLY,
          displayName: displayName,
          count: 1,
        });
      } else {
        let aux2 = worldMapResults.find((e) => e.name === x.COUNTRY_ONLY);
        let countryIndex = worldMapResults.findIndex(
          (e) => e.name === x.COUNTRY_ONLY
        );
        aux2.count += 1;
        worldMapResults[countryIndex] = aux2;
      }

      // WORLD MAP COMPLEMENTARY DATA FOR WORLD MAP (lines 572-583)
      if (worldMapComplementaryResults[displayName] === undefined)
        worldMapComplementaryResults[displayName] = WMCDTemplate;
      worldMapComplementaryResults[displayName] = WMCDAux(
        JSON.stringify(worldMapComplementaryResults[displayName]),
        x
      );

      // WORLD MAP DATA FOR EACH MAPVIEW
      worldMapG = WMCountData(
        JSON.stringify(worldMapG),
        x,
        displayName,
        "GENOTYPE",
        "genotypes",
        "lineage"
      );
      worldMapH58 = WMCountData(
        JSON.stringify(worldMapH58),
        x,
        displayName,
        "GENOTYPE_SIMPLE",
        "genotypes",
        "type",
        true
      );
      worldMapSTAD = WMCountData(
        JSON.stringify(worldMapSTAD),
        x,
        displayName,
        "amr_category",
        "STADs",
        "type",
        false,
        "No AMR detected"
      );
      worldMapMDR = WMCountData(
        JSON.stringify(worldMapMDR),
        x,
        displayName,
        "MDR",
        "MDRs",
        "type",
        false,
        "MDR"
      );
      worldMapXDR = WMCountData(
        JSON.stringify(worldMapXDR),
        x,
        displayName,
        "XDR",
        "XDRs",
        "type",
        false,
        "XDR"
      );
      worldMapAZITH = WMCountData(
        JSON.stringify(worldMapAZITH),
        x,
        displayName,
        "azith_pred_pheno",
        "AZs",
        "type",
        false,
        "AzithR"
      );
      worldMapCIPR = WMCountData(
        JSON.stringify(worldMapCIPR),
        x,
        displayName,
        "cip_pred_pheno",
        "CipRs",
        "type",
        false,
        "CipR"
      );
      worldMapCIPI = WMCountData(
        JSON.stringify(worldMapCIPI),
        x,
        displayName,
        "cip_pred_pheno",
        "CipIs",
        "type",
        false,
        "",
        true
      );
    }

    // If this passes than it's data for the graphs
    if (aux && auxWM) {
      results.push(x);
      if (!genotypes.includes(x.GENOTYPE)) genotypes.push(x.GENOTYPE);

      let chartData = ChartData(
        JSON.stringify(RFWGResults),
        JSON.stringify(DRTResults),
        x
      );
      RFWGResults = chartData[0];
      DRTResults = chartData[1];
      AMRResults = AMRData(JSON.stringify(AMRResults), x);
      GDResults = GDData(JSON.stringify(GDResults), x);

      if (x.COUNTRY_ONLY === country) {
        if (!PMIDResults.includes(x.PMID)) {
          PMIDResults.push(x.PMID);
        }
      }
    }
  });
  // Here are some ordenations and filters for the information before it is returned to the dashboard. IT IS IMPORTANT FOR THE CODE
  worldMapComplementaryResults = WMCDResults(
    JSON.stringify(worldMapComplementaryResults)
  );
  worldMapG = WMCountDataResults(JSON.stringify(worldMapG), "genotypes");
  worldMapH58 = WMCountDataResults(JSON.stringify(worldMapH58), "genotypes");
  worldMapSTAD = WMCountDataResults(JSON.stringify(worldMapSTAD), "STADs");
  worldMapMDR = WMCountDataResults(JSON.stringify(worldMapMDR), "MDRs");
  worldMapXDR = WMCountDataResults(JSON.stringify(worldMapXDR), "XDRs");
  worldMapAZITH = WMCountDataResults(JSON.stringify(worldMapAZITH), "AZs");
  worldMapCIPR = WMCountDataResults(JSON.stringify(worldMapCIPR), "CipRs");
  worldMapCIPI = WMCountDataResults(JSON.stringify(worldMapCIPI), "CipIs");
  RFWGResults.sort((a, b) => b.total - a.total);
  DRTResults = DRTResults.filter((item) => item.total >= 10);
  DRTResults.sort((a, b) => a.name.localeCompare(b.name));
  DRTResults = DRTDataResults(JSON.stringify(DRTResults));
  AMRResults = AMRDataResults(JSON.stringify(AMRResults));
  GDResults.sort((a, b) => a.name - b.name);

  return [
    results, // ALL ROWS
    genotypes.length, // Number of genotypes
    worldMapResults, // Data for World Map Samples
    worldMapComplementaryResults, // Data for World Map Complementary Data
    worldMapG, // World Map Genotypes data
    worldMapH58, // WM H58 data
    worldMapSTAD, // WM Sensitive to all drugs data
    worldMapMDR, // WM MDR data
    worldMapXDR, // WM XDR data
    worldMapAZITH, // WM AzithR data
    worldMapCIPR, // WM CipR data
    worldMapCIPI, // WM CipI data
    PMIDResults, // PMID data
    RFWGResults, // Data for Resistance frequencies within genotypes graph
    DRTResults, // Data for Drug resistance trends graph
    AMRResults, // Data for Resistance determinants within genotypes graph
    GDResults, // DATA for Genotype distribution graph
  ];
}
