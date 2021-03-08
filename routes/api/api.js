import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';

router.get('/drugTrendsChart/:country/:minYear/:maxYear/', function (req, res, next) {
    let params = req.params;
    let resultsJson = [];
    let read_file = Tools.path_clean_db || Tools.path_clean;

    fs.createReadStream(read_file)
        .pipe(csv())
        .on('data', (data_full) => resultsJson.push(data_full))
        .on('end', () => {
            let rawTrendArray = [];
            for (let data of resultsJson) {
                if (params.minYear <= data["DATE"] && data["DATE"] <= params.maxYear) {
                    let drugs = []

                    if (data["azith_pred_pheno"] == "AzithR")
                        drugs.push("Azithromycin")

                    if (data["dcs_category"] == "DCS")
                        drugs.push("Fluoroquinolones (DCS)")

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

                    const rawTrendObject = {
                        YEAR: data["DATE"],
                        GENOTYPE: data["GENOTYPE"],
                        DRUGS: drugs
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
                    })
                })
            })
            res.json(response);
        })
})

//Rota para a filtragens relacionadas ao amrClassChart
//Primeiro parâmetro trata-se do país
//Segundo e terceiro parâmetro são datas limites, sendo o segundo o ano mínimo e o terceiro o ano máximo
//por último, o amr_class que deseja verificar
router.get('/amrClassChart/:country/:min_year/:max_year/:amr_class', function (req, res, next) {
    let params = req.params
    let results_json = [];
    let results = [];
    //Essa variável verifica se o arquivo clean_db.csv está criado, se tiver o path dele será passado para a 
    //variável read_file, e então os dados que serão enviados ao front serão desse arquivo.
    //Se não, o path será do clean.csv
    let read_file = Tools.path_clean_db || Tools.path_clean
    //Passo o path para o ReadStream, insiro os dados no vetor results_json
    fs.createReadStream(read_file)
        .pipe(csv())
        .on('data', (data_full) => results_json.push(data_full))
        .on('end', () => {
            //Objeto que conterá os dados a serem enviados pro front
            let data_to_send = {}
            const TOTAL_VALUES = results_json.length
            //utilizo um for para percorrer todos os dados e verificar se as condições que foram requisitadas são atendidas
            //O primeiro if eu verifico se o parâmetro passado para country é all, se for, ele irá fazer a verificação em todos os países
            //Se não, ele irá apenas filtrar pelo país escolhido
            for (let data of results_json) {
                let country = params.country == "all" ? data["COUNTRY_ONLY"] : params.country
                if ((data["COUNTRY_ONLY"] == country) && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year))
                    data_to_send = {
                        "GENOTYPE": data["GENOTYPE"]
                    }

                if (params.amr_class == "AMR Profiles") {
                    data_to_send["GENE"] = data["amr_category"]
                    results.push(data_to_send)
                }

                if (params.amr_class == "Azithromycin" && data["azith_pred_pheno"] == "AzithR") {
                    if (data["ereA"] == "1")
                        data_to_send["GENE"] = "ereA"
                    else
                        data_to_send["GENE"] = "acrB_R717Q"

                    results.push(data_to_send)
                }

                if (params.amr_class == "Fluoroquinolones (DCS)" && data["dcs_category"] == "DCS") {
                    data_to_send["GENE"] = data["dcs_mechanisms"]
                    results.push(data_to_send)
                }

                if (params.amr_class == "ESBL" && data["ESBL_category"] == "ESBL") {
                    // data_to_send["ESBL"] = data["ESBL_category"]
                    //data_to_send["ESBL TOTAL"] = data_to_send["ESBL TOTAL"]==undefined ? 1:data_to_send["ESBL TOTAL"]++
                    //data_to_send["ESBL %"] = data_to_send["ESBL TOTAL"]==undefined ? 0:data_to_send["ESBL TOTAL"] / TOTAL_VALUES * 100
                    let genes = []

                    if (data["blaCTX-M-15_23"] == "1")
                        genes.push("blaCTX-M-15_23")

                    if (data["blaOXA-7"] == "1")
                        genes.push("blaOXA-7")

                    if (data["blaSHV-12"] == "1")
                        genes.push("blaSHV-12")

                    for (let gene of genes) {
                        results.push({
                            ...data_to_send,
                            GENE: gene
                        })
                    }
                }

                if (params.amr_class == "Chloramphenicol" && data["chloramphenicol_category"] == "ChlR") {
                    let genes = []

                    if (data["catA1"] == "1")
                        genes.push("catA1")

                    if (data["cmlA"] == "1")
                        genes.push("cmlA")

                    for (let gene of genes) {
                        results.push({
                            ...data_to_send,
                            GENE: gene
                        })
                    }
                }

                if (params.amr_class == "Ampicillin" && data["blaTEM-1D"] == "1") {
                    data_to_send["GENE"] = "blaTEM-1D"
                    results.push(data_to_send)
                }

                if (params.amr_class == "Co-trimoxazole" && data["co_trim"] == "1") {
                    let genes = []

                    if (data["sul1"] == "1")
                        genes.push("sul1")

                    if (data["sul2"] == "1")
                        genes.push("sul2")

                    if (data["dfrA1"] == "1")
                        genes.push("dfrA1")

                    if (data["dfrA14"] == "1")
                        genes.push("dfrA14")

                    if (data["dfrA15"] == "1")
                        genes.push("dfrA15")

                    if (data["dfrA17"] == "1")
                        genes.push("dfrA17")

                    if (data["dfrA18"] == "1")
                        genes.push("dfrA18")

                    if (data["dfrA5"] == "1")
                        genes.push("dfrA5")

                    if (data["dfrA7"] == "1")
                        genes.push("dfrA7")

                    for (let gene of genes) {
                        results.push({
                            ...data_to_send,
                            GENE: gene
                        })
                    }
                }

                if (params.amr_class == "Sulphonamides" && data["sul_any"] == "1") {
                    let genes = []

                    if (data["sul1"] == "1")
                        genes.push("sul1")

                    if (data["sul2"] == "1")
                        genes.push("sul2")

                    for (let gene of genes) {
                        results.push({
                            ...data_to_send,
                            GENE: gene
                        })
                    }
                }

                if (params.amr_class == "Trimethoprim" && data["dfra_any"] == "1") {
                    let genes = []

                    if (data["dfrA1"] == "1")
                        genes.push("dfrA1")

                    if (data["dfrA14"] == "1")
                        genes.push("dfrA14")

                    if (data["dfrA15"] == "1")
                        genes.push("dfrA15")

                    if (data["dfrA17"] == "1")
                        genes.push("dfrA17")

                    if (data["dfrA18"] == "1")
                        genes.push("dfrA18")

                    if (data["dfrA5"] == "1")
                        genes.push("dfrA5")

                    if (data["dfrA7"] == "1")
                        genes.push("dfrA7")

                    for (let gene of genes) {
                        results.push({
                            ...data_to_send,
                            GENE: gene
                        })
                    }
                }

                if (params.amr_class == "Tetracyclines" && data["tetracycline_category"] == "TetR") {
                    let genes = []

                    if (data["tetA(A)"] == "1")
                        genes.push("tetA(A)")

                    if (data["tetA(B)"] == "1")
                        genes.push("tetA(B)")

                    if (data["tetA(C)"] == "1")
                        genes.push("tetA(C)")

                    if (data["tetA(D)"] == "1")
                        genes.push("tetA(D)")

                    for (let gene of genes) {
                        results.push({
                            ...data_to_send,
                            GENE: gene
                        })
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
    let read_file = Tools.path_clean_db || Tools.path_clean
    fs.createReadStream(read_file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            min = results[0].DATE
            max = results[0].DATE
            for (let data of results) {
                if (!isNaN(data.DATE)) {
                    min = (data.DATE < min) ? data.DATE : min
                    max = (data.DATE > max) ? data.DATE : max
                }
            }
            return res.json({
                min: parseInt(min),
                max: parseInt(max)
            });
        })
})

//Filtra por 1 número que representa o tipo de dado a ser retornado
//Também filtra pelo valor da coluna Travel, podendo retornar todos os dados
//Apenas os que possuem o valor Travel ou os que estão unknown/local
router.get('/:filter1/:country/:min_year/:max_year/:travel', function (req, res, next) {
    let params = req.params
    let results_json = [];
    let results = [];
    let read_file = Tools.path_clean_db || Tools.path_clean

    fs.createReadStream(read_file)
        .pipe(csv())
        .on('data', (data) => results_json.push(data))
        .on('end', () => {
            let travel = params.travel
            let data_travel = false

            for (let data of results_json) {
                if (travel == "full") {
                    data_travel = true
                } else {
                    if (travel == "global") {
                        if (data["TRAVEL"] == "unknown" || data["TRAVEL"] == "local") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                    if (travel == "local") {
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

                /* DRUGS */
                let drugs = []

                if (data["azith_pred_pheno"] == "AzithR")
                    drugs.push("Azithromycin")

                if (data["dcs_category"] == "DCS")
                    drugs.push("Fluoroquinolones (DCS)")

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

                filter_value["DRUGS"] = drugs
                /* DRUG */

                if ((data["COUNTRY_ONLY"] == params.country) && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel == true) {
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
                } else if ((params.country == "all") && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel == true) {
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

//Retorna as colunas que contém os valores de H58, MDR, DCS e AzithR, retorna a porcentagem desses dados
router.get('/:country/:min_year/:max_year/:travel', function (req, res, next) {
    let params = req.params
    let country_unique_genotype = {}
    let results = []
    let read_file = Tools.path_clean_db || Tools.path_clean
    fs.createReadStream(read_file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            let travel = params.travel
            let data_travel = false
            for (let data of results) {
                if (travel == "full") {
                    data_travel = true
                } else {
                    if (travel == "global") {
                        if (data["TRAVEL"] == "unknown") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                    if (travel == "local") {
                        if (data["TRAVEL"] == "travel") {
                            data_travel = true
                        } else {
                            data_travel = false
                        }
                    }
                }
                if (params.country != "all") {
                    if (country_unique_genotype[params.country] == undefined) {
                        country_unique_genotype[params.country] = {
                            "GENOTYPES": {
                                "GENOTYPES_LIST": [],
                                "TOTAL": 0
                            },
                            "H58": 0,
                            "MDR": 0,
                            "DCS": 0,
                            "AzithR": 0,
                            "TOTAL_OCCURRENCE": 0
                        }
                    }

                    if ((data["COUNTRY_ONLY"] == params.country) && (params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel) {
                        if (country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) == -1) {
                            country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"])
                        }
                        country_unique_genotype[params.country]["TOTAL_OCCURRENCE"]++
                        if (data["GENOTYPE_SIMPLE"] == "H58") {
                            country_unique_genotype[params.country]["H58"]++
                        }
                        if (data["amr_category"] == "MDR") {
                            country_unique_genotype[params.country]["MDR"]++
                        }
                        if (data["amr_category"] == "DCS") {
                            country_unique_genotype[params.country]["DCS"]++
                        }
                        if (data["azith_pred_pheno"] == "AzithR") {
                            country_unique_genotype[params.country]["AzithR"]++
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
                            "DCS": 0,
                            "AzithR": 0,
                            "TOTAL_OCCURRENCE": 0
                        }
                    }
                    if ((params.min_year <= data["DATE"] && data["DATE"] <= params.max_year) && data_travel) {
                        if (country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) == -1) {
                            country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"])
                            country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["TOTAL"]++
                        }
                        country_unique_genotype[data["COUNTRY_ONLY"]]["TOTAL_OCCURRENCE"]++
                        if (data["GENOTYPE_SIMPLE"] == "H58") {
                            country_unique_genotype[data["COUNTRY_ONLY"]]["H58"]++
                        }
                        if (data["amr_category"] == "MDR") {
                            country_unique_genotype[data["COUNTRY_ONLY"]]["MDR"]++
                        }
                        if (data["amr_category"] == "DCS") {
                            country_unique_genotype[data["COUNTRY_ONLY"]]["DCS"]++
                        }
                        if (data["azith_pred_pheno"] == "AzithR") {
                            country_unique_genotype[data["COUNTRY_ONLY"]]["AzithR"]++
                        }
                    }
                }

            }
            for (let data in country_unique_genotype) {
                country_unique_genotype[data]["H58"] = (country_unique_genotype[data]["H58"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["MDR"] = (country_unique_genotype[data]["MDR"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["DCS"] = (country_unique_genotype[data]["DCS"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
                country_unique_genotype[data]["AzithR"] = (country_unique_genotype[data]["AzithR"] / country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
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