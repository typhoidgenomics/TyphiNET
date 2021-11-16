import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';

router.get('/drugTrendsChart/:country/:minYear/:maxYear/:travel/:region', function (req, res, next) {
    let params = req.params;
    let resultsJson = [];
    let read_file = Tools.path_clean_db || Tools.path_clean;

    const empty = ["-", ""]

    fs.createReadStream(read_file)
        .on('error', (_) => { return res.json([{}, [{}], [{}]]) })
        .pipe(csv())
        .on('data', (data_full) => resultsJson.push(data_full))
        .on('end', () => {
            let rawTrendArray = [];
            let travel = params.travel
            let data_travel = false
            let allDrugs = {}
            let pmid = []

            // let count = 0
            let allCountryDrugs = {}
            for (let data of resultsJson) {

                if (travel == "All") {
                    data_travel = true
                } else {
                    if (travel == "Local") {
                        if (data["TRAVEL"] == "local") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                    if (travel == "Travel") {
                        if (data["TRAVEL"] == "travel") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                }

                //Check if country and date are not empty
                const checkCountry = !empty.includes(data["COUNTRY_ONLY"])
                const checkDate = !empty.includes(data["DATE"])
                const checkRegion = params.region === "all" ? true : data["REGION_IN_COUNTRY"] === params.region ? true : false

                if (checkCountry && checkDate && data["COUNTRY_ONLY"] == params.country) {
                    if (!pmid.includes(data["PMID"])) {
                        pmid.push(data["PMID"])
                    }
                }

                if (checkCountry && checkDate && data["DATE"] >= params.minYear && data["DATE"] <= params.maxYear && data_travel && checkRegion) {
                    let drugs = []

                    if (params.country === "all" || (params.country === data["COUNTRY_ONLY"])) {
                        if (!(data["GENOTYPE"] in allCountryDrugs)) {
                            allCountryDrugs[data["GENOTYPE"]] = {total: 0, totalS: 0}
                            const isAMR = data["amr_category"] != "No AMR detected"
                            allCountryDrugs[data["GENOTYPE"]].total = isAMR ? 1 : 0
                            allCountryDrugs[data["GENOTYPE"]].totalS = 1
                        } else {
                            if (data["amr_category"] != "No AMR detected") {
                                allCountryDrugs[data["GENOTYPE"]].total += 1
                            }
                            allCountryDrugs[data["GENOTYPE"]].totalS += 1
                        }

                        if (!(data["DATE"] in allDrugs)) {
                            allDrugs[data["DATE"]] = 1
                        } else {
                            allDrugs[data["DATE"]] += 1
                        }
                    }


                    if (data["azith_pred_pheno"] == "AzithR") {
                        drugs.push("Azithromycin")
                    }

                    if (data["dcs_category"] == "DCS")
                        drugs.push("Fluoroquinolones (CipI/R)")

                    if (data["ESBL_category"] == "ESBL")
                        drugs.push("ESBL")

                    if (data["chloramphenicol_category"] == "ChlR")
                        drugs.push("Chloramphenicol")

                    if (data["blaTEM-1D"] == "1")
                        drugs.push("Ampicillin")

                    if (data["co_trim"] == "1")
                        drugs.push("Co-trimoxazole")

                    if (data["sul_any"] == "1")
                        drugs.push("Sulphonamides")

                    if (data["dfra_any"] == "1")
                        drugs.push("Trimethoprim")

                    if (data["tetracycline_category"] == "TetR")
                        drugs.push("Tetracyclines")
                    
                    if (data["amr_category"] == "No AMR detected") {
                        drugs.push("Susceptible")
                    }

                    // if (data["cip_pred_pheno"] == "CipI") {
                    //     drugs.push("Fluoroquinolones (CipI)")
                    // }

                    if (data["cip_pred_pheno"] == "CipR") {
                        drugs.push("Fluoroquinolones (CipR)")
                    }

                    const rawTrendObject = {
                        YEAR: data["DATE"],
                        GENOTYPE: data["GENOTYPE"],
                        DRUGS: drugs,
                        COUNTRY: data["COUNTRY_ONLY"]
                    }
                    if (params.country == data.COUNTRY_ONLY) {
                        rawTrendArray.push(rawTrendObject)
                    } else if (params.country == "all") {
                        rawTrendArray.push(rawTrendObject)
                    }
                }
            }

            let response = []
            rawTrendArray.forEach(entry => {
                entry.DRUGS.forEach(drug => {
                    response.push({
                        YEAR: entry.YEAR,
                        GENOTYPE: entry.GENOTYPE,
                        DRUG: drug,
                        COUNTRY: entry.COUNTRY
                    })
                })
            })
            response.push([allDrugs, pmid])
            response.push([allCountryDrugs])
            res.json(response);
        })
})

router.get('/amrClassChart/:country/:min_year/:max_year/:amr_class/:travel/:region', function (req, res, next) {
    let params = req.params
    let results_json = [];
    let results = [];
    let cotrim = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"];
    let numberGenotypes = {};
    let read_file = Tools.path_clean_db || Tools.path_clean

    let fluoroR = ['3_QRDR + qnrS', '3_QRDR + qnrB', '3_QRDR', '2_QRDR + qnrS', '2_QRDR + qnrB', '1_QRDR + qnrS', '1_QRDR + qnrB']
    let fluoroI = ['2_QRDR', '1_QRDR', '0_QRDR + qnrS', '0_QRDR + qnrB']

    const empty = ["-", ""]

    fs.createReadStream(read_file)
        .on('error', (_) => { return res.json([]) })
        .pipe(csv())
        .on('data', (data_full) => results_json.push(data_full))
        .on('end', () => {

            let data_to_send = {}
            const TOTAL_VALUES = results_json.length
            let travel = params.travel
            let data_travel = false

            for (let data of results_json) {
                if (travel == "All") {
                    data_travel = true
                } else {
                    if (travel == "Local") {
                        if (data["TRAVEL"] == "local") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                    if (travel == "Travel") {
                        if (data["TRAVEL"] == "travel") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                }

                let country = params.country == "all" ? data["COUNTRY_ONLY"] : params.country

                //Check if country and date are not empty
                const checkCountry = !empty.includes(data["COUNTRY_ONLY"])
                const checkDate = !empty.includes(data["DATE"])
                const checkRegion = params.region === "all" ? true : data["REGION_IN_COUNTRY"] === params.region ? true : false

                if (checkCountry && checkDate && (data["COUNTRY_ONLY"] == country) && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel && checkRegion) {
                    data_to_send = {
                        "GENOTYPE": data["GENOTYPE"]
                    }
                    if (!(data["GENOTYPE"] in numberGenotypes)) {
                        numberGenotypes[data["GENOTYPE"]] = 1
                    } else {
                        numberGenotypes[data["GENOTYPE"]] += 1
                    }

                    if (params.amr_class == "AMR Profiles") {
                        data_to_send["GENE"] = data["amr_category"]
                        results.push(data_to_send)
                    }

                    if (params.amr_class == "Azithromycin") {

                        let genes = []

                        if (data["azith_pred_pheno"] == "AzithR") {
                            if (data["ereA"] == "1" && data["acrB_R717Q"] == "1" && data["acrB_R717L" == "1"]) {
                                genes.push("ereA + acrB_R717Q + acrB_R717L")
                            } else {
                                if (data["ereA"] == "1" && data["acrB_R717Q"] == "1") {
                                    genes.push("ereA + acrB_R717Q")
                                } else if (data["ereA"] == "1" && data["acrB_R717L"] == "1") {
                                    genes.push("ereA + acrB_R717L")
                                } else if (data["acrB_R717Q"] == "1" && data["acrB_R717L"] == "1") {
                                    genes.push("acrB_R717Q + acrB_R717L")
                                } else if (data["ereA"] == "1") {
                                    genes.push("ereA")
                                } else if (data["acrB_R717Q"] == "1") {
                                    genes.push("acrB_R717Q")
                                } else if (data["acrB_R717L"] == "1") {
                                    genes.push("acrB_R717L")
                                }
                            }
                        } else if (data["azith_pred_pheno"] == "AzithS") {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }

                    if (params.amr_class == "Fluoroquinolones (CipI-R)") {
                        if (data["dcs_mechanisms"] === "0_QRDR") {
                            data_to_send["GENE"] = "None (CipS)"
                        } else if (fluoroR.includes(data["dcs_mechanisms"])){
                            data_to_send["GENE"] = data["dcs_mechanisms"] + " (CipR)"
                        } else if (fluoroI.includes(data["dcs_mechanisms"])) {
                            data_to_send["GENE"] = data["dcs_mechanisms"] + " (CipI)"
                        }
                        results.push(data_to_send)
                    }

                    if (params.amr_class == "ESBL") {
                        let genes = []

                        if (data["ESBL_category"] == "ESBL") {
                            if (data["blaCTX-M-15_23"] == "1")
                                genes.push("blaCTX-M-15")

                            if (data["blaOXA-7"] == "1")
                                genes.push("blaOXA-7")

                            if (data["blaSHV-12"] == "1")
                                genes.push("blaSHV-12")
                            
                            if (data["blaCTX-M-55"] == "1")
                                genes.push("blaCTX-M-55")
                            
                        } else if (data["ESBL_category"] == "Non-ESBL") {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }

                    if (params.amr_class == "Chloramphenicol") {
                        let genes = []

                        if (data["chloramphenicol_category"] == "ChlR") {
                            if (data["catA1"] == "1" && data["cmlA"] == "1") {
                                genes.push("catA1 + cmlA")
                            } else {
                                if (data["catA1"] == "1")
                                    genes.push("catA1")

                                if (data["cmlA"] == "1")
                                    genes.push("cmlA")
                            }
                        } else if (data["chloramphenicol_category"] == "ChlS") {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }

                    if (params.amr_class == "Ampicillin") {
                        let genes = []

                        if (data["blaTEM-1D"] === "1") {
                            genes.push("blaTEM-1D")
                        } else {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }

                    if (params.amr_class == "Co-trimoxazole") {
                        let genes = []

                        if (data["co_trim"] == "1") {
                            for (const index in cotrim) {
                                if (data[cotrim[index]] == "1") {
                                    genes.push(cotrim[index])
                                }
                            }
                            if (data["sul1"] == "1" && data["sul2"] == "1") {
                                genes.push("sul1")
                                genes.push("sul2")
                            } else if (data["sul1"] == "1") {
                                genes.push("sul1")
                            } else if (data["sul2"] == "1") {
                                genes.push("sul2")
                            }
                        } else if (data["co_trim"] == "0") {
                            genes.push("None")
                        }

                        results.push({
                            ...data_to_send,
                            GENE: genes.join(' + ')
                        })
                    }

                    if (params.amr_class == "Sulphonamides") {
                        let genes = []

                        if (data["sul_any"] == "1") {
                            if (data["sul1"] === "1" && data["sul2"] === "1")
                                genes.push("sul1 + sul2")
                            else if (data["sul1"] === "1")
                                genes.push("sul1")
                            else if (data["sul2"] === "1")
                                genes.push("sul2")
                        } else if (data["sul_any"] == "0") {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }

                    if (params.amr_class == "Trimethoprim") {
                        let genes = []

                        if (data["dfra_any"] == "1") {
                            if (data["dfrA7"] == "1" && data["dfrA14"] == "1") {
                                genes.push("dfrA7 + dfrA14")
                            }
                            else if (data["dfrA1"] == "1")
                                genes.push("dfrA1")

                            else if (data["dfrA14"] == "1")
                                genes.push("dfrA14")

                            else if (data["dfrA15"] == "1")
                                genes.push("dfrA15")

                            else if (data["dfrA17"] == "1")
                                genes.push("dfrA17")

                            else if (data["dfrA18"] == "1")
                                genes.push("dfrA18")

                            else if (data["dfrA5"] == "1")
                                genes.push("dfrA5")

                            else if (data["dfrA7"] == "1")
                                genes.push("dfrA7")

                        } else if (data["dfra_any"] == "0") {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }

                    if (params.amr_class == "Tetracyclines") {
                        let genes = []
                        // const tets = ["tetA(A)", "tetA(B)", "tetA(C)", "tetA(D)"]
                        // let finalTet = "TetA("
                        // for (let tet of tets) {
                        //     if (data[tet.toString()] === "1") {
                        //         finalTet = finalTet + tet[tet.length - 2]
                        //     }
                        // }
                        // finalTet = finalTet + ")"
                        // if (finalTet !== "TetA()") {
                        //     genes.push(finalTet.toString())
                        // }

                        if (data["tetracycline_category"] == "TetR") {
                            if (data["tetA(A)"] == "1")
                                genes.push("tetA(A)")

                            if (data["tetA(B)"] == "1")
                                genes.push("tetA(B)")

                            if (data["tetA(C)"] == "1")
                                genes.push("tetA(C)")

                            if (data["tetA(D)"] == "1")
                                genes.push("tetA(D)")
                        } else if (data["tetracycline_category"] == "TetS") {
                            genes.push("None")
                        }

                        for (let gene of genes) {
                            results.push({
                                ...data_to_send,
                                GENE: gene
                            })
                        }
                    }
                }
            }

            return res.json(results);
        });

});

router.get('/getYearLimits', function (req, res, next) {
    let results = []
    let min
    let max
    let countries = []
    let allGenotypes = {}
    let totalGenotypes = []
    let years = []
    let read_file = Tools.path_clean_db || Tools.path_clean

    const empty = ["-", ""]

    fs.createReadStream(read_file)
        .on('error', (_) => {
            return res.json({
                min: 0,
                max: 0,
                countries: [],
                allGenotypes: {},
                totalGenotypes: []
            })
        })
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            min = results[0]?.DATE
            max = results[0]?.DATE

            for (let data of results) {

                if (!totalGenotypes.includes(data.GENOTYPE)) {
                    totalGenotypes.push(data.GENOTYPE)
                }

                //Check if country and date are not empty
                if (!empty.includes(data["COUNTRY_ONLY"]) && !empty.includes(data["DATE"])) {

                    if (!isNaN(data.DATE)) {
                        min = (data.DATE < min) ? data.DATE : min
                        max = (data.DATE > max) ? data.DATE : max
                    }
                    if (!countries.includes(data.COUNTRY_ONLY)) {
                        countries.push(data.COUNTRY_ONLY)
                    }
                    if (!(data["GENOTYPE"] in allGenotypes)) {
                        allGenotypes[data["GENOTYPE"]] = 1
                    } else {
                        allGenotypes[data["GENOTYPE"]] += 1
                    }
                    if (!years.includes(parseInt(data.DATE))) {
                        years.push(parseInt(data.DATE))
                    }
                }
            }
            years.sort()
            return res.json({
                min: parseInt(min),
                max: parseInt(max),
                countries: countries,
                allGenotypes: allGenotypes,
                totalGenotypes: totalGenotypes,
                years: years
            });
        })
})

router.get('/:filter1/:country/:min_year/:max_year/:travel/:region', function (req, res, next) {
    let params = req.params
    let results_json = [];
    let results = [];
    let read_file = Tools.path_clean_db || Tools.path_clean

    const empty = ["-", ""]

    fs.createReadStream(read_file)
        .on('error', (_) => { return res.json([]) })
        .pipe(csv())
        .on('data', (data) => results_json.push(data))
        .on('end', () => {

            let travel = params.travel
            let data_travel = false
            for (let data of results_json) {
                if (travel == "All") {
                    data_travel = true
                } else {
                    if (travel == "Local") {
                        if (data["TRAVEL"] == "local") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                    if (travel == "Travel") {
                        if (data["TRAVEL"] == "travel") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                }

                let filter_value = new Object()
                filter_value["NAME"] = data["NAME"]
                filter_value["COUNTRY_ONLY"] = data["COUNTRY_ONLY"]
                filter_value["YEAR"] = data["DATE"]
                filter_value["GENOTYPE"] = data["GENOTYPE"]

                filter_value["AMR"] = data["amr_category"]
                filter_value["GENOTYPE_SIMPLE"] = data["GENOTYPE_SIMPLE"]
                filter_value["MDR"] = data["MDR"]
                filter_value["XDR"] = data["XDR"]
                filter_value["IncTypes"] = data["Inc Types"]
                filter_value["DCS"] = data["dcs_category"]
                filter_value["Azith"] = data["azith_pred_pheno"]
                filter_value["CipR"] = data["cip_pred_pheno"]
                filter_value["CipI"] = data["cip_pred_pheno"]
                filter_value["STAD"] = data["amr_category"]

                const checkRegion = params.region === "all" ? true : data["REGION_IN_COUNTRY"] === params.region ? true : false

                /* DRUGS */
                let drugs = []

                if (data["azith_pred_pheno"] == "AzithR")
                    drugs.push("Azithromycin")

                if (data["dcs_category"] == "DCS")
                    drugs.push("Fluoroquinolones (CipI/R)")

                if (data["ESBL_category"] == "ESBL")
                    drugs.push("ESBL")

                if (data["chloramphenicol_category"] == "ChlR")
                    drugs.push("Chloramphenicol")

                if (data["blaTEM-1D"] == "1")
                    drugs.push("Ampicillin")

                if (data["co_trim"] == "1")
                    drugs.push("Co-trimoxazole")

                if (data["sul_any"] == "1")
                    drugs.push("Sulphonamides")

                if (data["dfra_any"] == "1")
                    drugs.push("Trimethoprim")

                if (data["tetracycline_category"] == "TetR")
                    drugs.push("Tetracyclines")
                
                if (data["amr_category"] == "No AMR detected")
                    drugs.push("No AMR detected")

                filter_value["DRUGS"] = drugs
                /* DRUG */

                //Check if country and date are not empty
                if (!empty.includes(data["COUNTRY_ONLY"]) && !empty.includes(data["DATE"])) {

                    if ((data["COUNTRY_ONLY"] == params.country) && (data["DATE"] >= params.min_year && data["DATE"] <= params.max_year) && data_travel && checkRegion) {

                        filter_value["REGION_IN_COUNTRY"] = data["REGION_IN_COUNTRY"]

                        if (params.filter1 == "1") {
                            filter_value["blaCTX-M-15_23"] = data["blaCTX-M-15_23"]
                            results.push(filter_value)
                        } else if (params.filter1 == "2") {
                            filter_value["amr_category"] = data["amr_category"]
                            results.push(filter_value)
                        } else if (params.filter1 == "3") {
                            filter_value["amr_category"] = data["amr_category"]
                            filter_value["GENOTYPE_SIMPLE"] = data["GENOTYPE_SIMPLE"]
                            results.push(filter_value)
                        } else if (params.filter1 == "4") {

                            filter_value["Inc Types"] = data["Inc Types"]
                            results.push(filter_value)
                        } else {
                            results.push(filter_value)
                        }
                    } else if ((params.country == "all") && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel == true && checkRegion) {

                        filter_value["REGION_IN_COUNTRY"] = data["REGION_IN_COUNTRY"]

                        if (params.filter1 == "1") {
                            filter_value["blaCTX-M-15_23"] = data["blaCTX-M-15_23"]
                            results.push(filter_value)
                        } else if (params.filter1 == "2") {
                            filter_value["amr_category"] = data["amr_category"]
                            results.push(filter_value)
                        } else if (params.filter1 == "3") {
                            filter_value["amr_category"] = data["amr_category"]
                            filter_value["GENOTYPE_SIMPLE"] = data["GENOTYPE_SIMPLE"]
                            results.push(filter_value)
                        } else if (params.filter1 == "4") {
                            filter_value["Inc Types"] = data["Inc Types"]
                            results.push(filter_value)
                        } else {
                            results.push(filter_value)
                        }
                    }

                }

            }

            results.sort(function order_by_year(a, b) {
                if (a["YEAR"] < b["YEAR"]) {
                    return -1;
                }
                if (b["YEAR"] < a["YEAR"]) {
                    return 1;
                }
                return 0;
            })
            return res.json(results);
        });
});

router.get('/:country/:min_year/:max_year/:travel/:region', function (req, res, next) {
    let params = req.params
    let country_unique_genotype = {}
    let results = []
    let read_file = Tools.path_clean_db || Tools.path_clean

    const empty = ["-", ""]

    fs.createReadStream(read_file)
        .on('error', (_) => { return res.json({}) })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
            let travel = params.travel
            let data_travel = false
            for (let data of results) {
                if (travel == "All") {
                    data_travel = true
                } else {
                    if (travel == "Local") {
                        if (data["TRAVEL"] == "local") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                    if (travel == "Travel") {
                        if (data["TRAVEL"] == "travel") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                }

                const checkRegion = params.region === "all" ? true : data["REGION_IN_COUNTRY"] === params.region ? true : false

                //Check if country and date are not empty
                if (!empty.includes(data["COUNTRY_ONLY"]) && !empty.includes(data["DATE"])) {

                    if (params.country != "all") {
                        if (country_unique_genotype[params.country] == undefined) {
                            country_unique_genotype[params.country] = {
                                "GENOTYPES": {
                                    "GENOTYPES_LIST": [],
                                    "TOTAL": 0
                                },
                                "H58": 0,
                                "MDR": 0,
                                "XDR": 0,
                                "DCS": 0,
                                "AzithR": 0,
                                "CipI": 0,
                                "CipR": 0,
                                "CipI_R": 0,
                                "STAD": 0,
                                "TOTAL_OCCURRENCE": 0
                            }
                        }

                        if ((data["COUNTRY_ONLY"] == params.country) && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel && checkRegion) {
                            if (country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) == -1) {
                                country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"])
                            }
                            country_unique_genotype[params.country]["TOTAL_OCCURRENCE"]++
                            if (data["GENOTYPE_SIMPLE"] == "H58") {
                                country_unique_genotype[params.country]["H58"]++
                            }
                            if (data["MDR"] == "MDR") {
                                country_unique_genotype[params.country]["MDR"]++
                            }
                            if (data["XDR"] == "XDR") {
                                country_unique_genotype[params.country]["XDR"]++
                            }
                            if (data["dcs_category"] == "DCS") {
                                country_unique_genotype[params.country]["DCS"]++
                            }
                            if (data["azith_pred_pheno"] == "AzithR") {
                                country_unique_genotype[params.country]["AzithR"]++
                            }
                            if (data["amr_category"] == "No AMR detected") {
                                country_unique_genotype[params.country]["STAD"]++
                            }
                        }
                    } else {
                        if (country_unique_genotype[data["COUNTRY_ONLY"]] == undefined) {
                            country_unique_genotype[data["COUNTRY_ONLY"]] = {
                                "GENOTYPES": {
                                    "GENOTYPES_LIST": [],
                                    "TOTAL": 0
                                },
                                "H58": 0,
                                "MDR": 0,
                                "XDR": 0,
                                "DCS": 0,
                                "AzithR": 0,
                                "CipI": 0,
                                "CipR": 0,
                                "CipI_R": 0,
                                "STAD": 0,
                                "TOTAL_OCCURRENCE": 0
                            }
                        }

                        if ((data["DATE"] >= params.min_year && data["DATE"] <= params.max_year) && data_travel && checkRegion) {
                            country_unique_genotype[data["COUNTRY_ONLY"]]["TOTAL_OCCURRENCE"]++
                            if (country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) == -1) {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"])
                                country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["TOTAL"]++
                            }
                            if (data["GENOTYPE_SIMPLE"] == "H58") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["H58"]++
                            }
                            if (data["MDR"] == "MDR") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["MDR"]++
                            }
                            if (data["XDR"] == "XDR") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["XDR"]++
                            }
                            if (data["dcs_category"] == "DCS") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["DCS"]++
                            }
                            if (data["azith_pred_pheno"] == "AzithR") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["AzithR"]++
                            }
                            if (data["cip_pred_pheno"] == "CipI") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["CipI"]++
                                country_unique_genotype[data["COUNTRY_ONLY"]]["CipI_R"]++
                            }
                            if (data["cip_pred_pheno"] == "CipR") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["CipR"]++
                                country_unique_genotype[data["COUNTRY_ONLY"]]["CipI_R"]++
                            }
                            if (data["amr_category"] == "No AMR detected") {
                                country_unique_genotype[data["COUNTRY_ONLY"]]["STAD"]++
                            }
                        }

                    }

                }
            }
            for (let data in country_unique_genotype) {
                country_unique_genotype[data]["H58"] = (country_unique_genotype[data]["H58"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["MDR"] = (country_unique_genotype[data]["MDR"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["XDR"] = (country_unique_genotype[data]["XDR"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["DCS"] = (country_unique_genotype[data]["DCS"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["AzithR"] = (country_unique_genotype[data]["AzithR"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["CipI"] = (country_unique_genotype[data]["CipI"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["CipR"] = (country_unique_genotype[data]["CipR"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["CipI_R"] = (country_unique_genotype[data]["CipI_R"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["STAD"] = (country_unique_genotype[data]["STAD"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                delete country_unique_genotype[data].TOTAL_OCCURRENCE
            }
            if (params.country != "all") {
                country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].sort(function order_by_year(a, b) {
                    if (a < b) {
                        return -1;
                    }
                    if (b < a) {
                        return 1;
                    }
                    return 0;
                })
            } else {
                for (let country in country_unique_genotype)
                    country_unique_genotype[country]["GENOTYPES"]["GENOTYPES_LIST"].sort(function order_by_year(a, b) {
                        if (a < b) {
                            return -1;
                        }
                        if (b < a) {
                            return 1;
                        }
                        return 0;
                    })
            }
            return res.json(country_unique_genotype);
        });
});


export default router