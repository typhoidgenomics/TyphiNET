import express from 'express'
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as Tools from '../../services/services.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router()

//Route GET to create the clean.csv
router.get('/create', function(req, res) {

    //All files that read require to generate the combine.csv
    const read_files = ["pw_metadata.csv", "pw_species-prediction.csv", "pw_typing.csv",
        "pw_amr-genes.csv", "pw_amr-snps.csv", "pw_amr-profile.csv", "pw_stats.csv"
    ]

    //All header fields require related to each pw_file
    const headers_metadata = ["ACCURACY", "STRAIN", "SOURCE", "ACCESSION", "STUDY ACCESSION",
        "SANGER LANE", "PMID", "LATITUDE", "LONGITUDE"
    ]

    const headers_species_prediction = ["Genome ID", "Version", "Organism Name", "Organism ID", "Species Name", "Species ID", "Genus Name", "Genus ID", "Reference ID", "Matching Hashes", "p-Value", "Mash Distance"]

    const headers_typing = ["REFERENCE", "MLST ST (EnteroBase)", "MLST PROFILE (EnteroBase)", "GENOTYPHI SNPs CALLED", "Inc Types"]

    const headers_amr_genes = ["blaCTX-M-15_23", "blaOXA-7", "blaSHV-12", "blaTEM-1D", "catA1", "cmlA", "qnrB", "qnrS", "sul1", "sul2", "dfrA1", "dfrA14", "dfrA15", "dfrA17", "dfrA18", "dfrA5", "dfrA7", "tetA(A)",
        "tetA(B)", "tetA(C)", "tetA(D)", "ereA"
    ]

    const headers_amr_snps = ["gyrA_S83F", "gyrA_S83Y", "gyrA_D87A", "gyrA_D87G", "gyrA_D87N", "gyrA_D87V", "gyrA_D87Y", "gyrB_S464F", "gyrB_S464Y", "parC_S80I", "parC_E84G", "parC_E84K", "acrB_R717Q"]
    const headers_amr_profile = ["PW_AMP", "PW_CEP", "PW_CHL", "PW_CIP", "PW_SMX", "PW_TMP", "PW_SXT", "PW_TCY", "PW_AZM", "PW_CST", "PW_MEM"]

    let obj_parser = {}
    let data_to_write = []

    for (let file of read_files) {

        fs.createReadStream(path.join(__dirname, `../../assets/webscrap/raw_data/${file}`), { start: 0 })
            .pipe(csv())
            .on('data', (data) => {

                let column_names = Object.keys(data)
                let data_name = data["NAME"].toString()
                data_name = data_name.trim()
                obj_parser = data_to_write.filter((x) => { if (x.NAME == data_name) return x })

                let index = data_to_write.indexOf(obj_parser[0])
                let new_obj = true
                if (obj_parser.length == 0) {
                    obj_parser = { "NAME": data_name }
                } else {
                    new_obj = false
                    obj_parser = obj_parser[0]
                }
                let item = 0
                if (file === "pw_metadata.csv") {

                    if (data['DATE'].trim().length == 4) {
                        obj_parser["DATE"] = data['DATE'].trim()
                    } else if (data['DATE'].trim().length > 4) {
                        let date_aux = data['DATE'].split(" ")
                        date_aux = date_aux[date_aux.length - 1]
                        obj_parser["DATE"] = date_aux
                    } else {
                        obj_parser["DATE"] = data['DATE'].trim()
                    }
                    obj_parser["DATE"] = obj_parser["DATE"] != "" ? obj_parser["DATE"] : "-"

                    let COUNTRY = data['COUNTRY']
                    let REGION_IN_COUNTRY
                    let TRAVEL
                    let TRAVEL_LOCATION
                    if (COUNTRY.indexOf("travel") != -1 || COUNTRY.indexOf("Travel") != -1) {
                        TRAVEL = COUNTRY.split("_")
                        obj_parser["COUNTRY_ONLY"] = TRAVEL[0]
                        obj_parser["REGION_IN_COUNTRY"] = "-"
                        obj_parser["TRAVEL"] = TRAVEL[1]
                        obj_parser["COUNTRY_ORIGIN"] = TRAVEL[0]
                        obj_parser["TRAVEL_LOCATION"] = TRAVEL[2]
                        if (TRAVEL[1] == "No Travel Information" || TRAVEL[1] == "No Travel Reported") {
                            obj_parser["TRAVEL"] = TRAVEL[1] == "No Travel Information" ? "unknown" : "local"
                        }
                    } else {
                        const delete_countrys = ["south-east asia", "south america", "western asia", "Africa"]
                        let aux_country = COUNTRY
                        obj_parser["COUNTRY_ONLY"] = COUNTRY.trim()
                        if (aux_country.indexOf("/") != -1) {
                            let country_aux = COUNTRY.split("/")
                            country_aux = country_aux[0] == "kuwait" ? country_aux[0] : country_aux[1]
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        if (aux_country == "SriLanka") {
                            let country_aux = COUNTRY.replace("SriLanka", "Sri Lanka")
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        if (aux_country == "EastTimor") {
                            let country_aux = COUNTRY.replace("EastTimor", "East Timor")
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        if (aux_country.indexOf("(") != -1) {
                            let country_aux = COUNTRY.split(" ")
                            country_aux = country_aux[0]
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                            aux_country = country_aux
                        }
                        if (aux_country.indexOf(",") != -1) {
                            let country_aux = COUNTRY.split(",")
                            country_aux = country_aux[0]
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        if (delete_countrys.indexOf(aux_country.toLowerCase()) != -1) {
                            obj_parser["COUNTRY_ONLY"] = "-"
                        }
                        if (aux_country.toLowerCase() == "unknown") {
                            obj_parser["COUNTRY_ONLY"] = "-"
                        }
                        obj_parser["REGION_IN_COUNTRY"] = "-"
                        obj_parser["TRAVEL"] = "unknown"
                        obj_parser["COUNTRY_ORIGIN"] = obj_parser["COUNTRY_ONLY"]
                        obj_parser["TRAVEL_LOCATION"] = "-"
                    }
                    if (COUNTRY.indexOf(":") != -1) {
                        [COUNTRY, REGION_IN_COUNTRY] = COUNTRY.split(":")
                        obj_parser["COUNTRY_ONLY"] = COUNTRY
                        obj_parser["COUNTRY_ORIGIN"] = COUNTRY
                        REGION_IN_COUNTRY = REGION_IN_COUNTRY.trim()
                        obj_parser["REGION_IN_COUNTRY"] = (REGION_IN_COUNTRY == "None") ? "-" : REGION_IN_COUNTRY
                        if (REGION_IN_COUNTRY.indexOf("travel") != -1 || REGION_IN_COUNTRY.indexOf("Travel") != -1) {
                            TRAVEL = REGION_IN_COUNTRY.split("_")
                            REGION_IN_COUNTRY = TRAVEL[0]
                            const remove_travels = ["No info", "", "Unknown"]
                            const remove_travels2 = ["No travel abroad", "No Travel Information", "No Travel Reported"]
                            if (remove_travels.indexOf(TRAVEL[2]) != -1 || remove_travels2.indexOf(TRAVEL[1]) != -1) {
                                TRAVEL_LOCATION = "-"
                                if (TRAVEL[1] == "No Travel Reported") {
                                    TRAVEL = "local"
                                } else {
                                    TRAVEL = "unknown"
                                }
                            } else {
                                TRAVEL_LOCATION = TRAVEL[2]
                                TRAVEL = TRAVEL[1] == "-" ? "unknown" : TRAVEL[1]
                            }
                            obj_parser["REGION_IN_COUNTRY"] = (REGION_IN_COUNTRY == "None" || REGION_IN_COUNTRY == "Unknown" || REGION_IN_COUNTRY == "") ? "-" : REGION_IN_COUNTRY
                            obj_parser["TRAVEL"] = TRAVEL
                            obj_parser["TRAVEL_LOCATION"] = TRAVEL_LOCATION
                        }
                    }

                    for (let column of headers_metadata) {
                        if (column === "STRAIN" || column === "SANGER LANE" || column === "ACCESSION") {
                            if (data[column] === "NA") {
                                data[column] = ""
                            }
                        }
                        obj_parser[column] = data[column]
                    }
                    obj_parser["LOCATION"] = data['COUNTRY']
                }
                if (column_names.indexOf("Genome ID") != -1) {
                    for (let column of headers_species_prediction) {
                        obj_parser[column] = data[column]
                    }
                }
                if (column_names.indexOf('REFERENCE') != -1) {
                    for (let column of headers_typing) {
                        obj_parser[column] = data[column]
                    }
                }
                if (column_names.indexOf("GENOTYPHI GENOTYPE") != -1) {
                    const h58_genotypes = ["4.3.1", "4.3.1.1", "4.3.1.1.P1", "4.3.1.2", "4.3.1.3"]
                    const curate_223 = ["9953_5_76_LaoLNT1480_2010",
                        "10060_6_13_LaoSV430_2009",
                        "10060_6_20_LaoUI10788_2007",
                        "10060_6_30_LaoUI14598_2009",
                        "10209_5_36_LaoUI2001_2002",
                        "10209_5_60_LaoUI3396_2003"
                    ]
                    if (h58_genotypes.indexOf(data['GENOTYPHI GENOTYPE']) != -1) {
                        obj_parser["h58_genotypes"] = data['GENOTYPHI GENOTYPE']
                        obj_parser["GENOTYPE_SIMPLE"] = "H58"
                    } else {
                        obj_parser["h58_genotypes"] = "-"
                        obj_parser["GENOTYPE_SIMPLE"] = "Non-H58"
                    }
                    if (curate_223.indexOf(data['NAME']) != -1) {
                        obj_parser["GENOTYPE"] = "2.2.3"
                    } else {
                        obj_parser["GENOTYPE"] = data['GENOTYPHI GENOTYPE']
                    }

                }
                if (column_names.indexOf("blaCTX-M-15_23") != -1) {
                    let num_amr_genes = 0
                    let column
                    for (column of headers_amr_genes) {
                        obj_parser[column] = data[column]
                        if (data[column] == "1") {
                            num_amr_genes++
                        }
                    }
                    obj_parser["num_amr_genes"] = num_amr_genes.toString()
                    const dirA = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"]
                    obj_parser["dfra_any"] = "0"
                    for (let d of dirA) {
                        if (data[d] == "1") {
                            obj_parser["dfra_any"] = "1"
                        }
                    }
                    if (data["sul1"] == "0" && data["sul2"] == "0") {
                        obj_parser["sul_any"] = "0"
                    } else {
                        obj_parser["sul_any"] = "1"
                    }
                    if (obj_parser["sul_any"] == "1" && obj_parser["dfra_any"] == "1") {
                        obj_parser["co_trim"] = "1"
                    } else {
                        obj_parser["co_trim"] = "0"
                    }
                    if (data["catA1"] == "1" && data["blaTEM-1D"] == "1" && obj_parser["co_trim"] == "1") {
                        obj_parser["MDR"] = "MDR"
                    } else {
                        obj_parser["MDR"] = "-"
                    }
                    if (obj_parser["MDR"] == "MDR" && data['blaCTX-M-15_23'] == "1" && data['qnrS'] == "1") {
                        obj_parser["XDR"] = "XDR"
                    } else {
                        obj_parser["XDR"] = "-"
                    }
                    if (data["ereA"] == "1") {
                        obj_parser["azith_pred_pheno"] = "AzithR"
                    }
                    if (data["blaCTX-M-15_23"] == "1" || data["blaOXA-7"] == "1" || data["blaSHV-12"] == "1") {
                        obj_parser["ESBL_category"] = "ESBL"
                    } else {
                        obj_parser["ESBL_category"] = "Non-ESBL"
                    }
                    if (data["catA1"] == "1" || data["cmlA"] == "1") {
                        obj_parser["chloramphenicol_category"] = "ChlR"
                    } else {
                        obj_parser["chloramphenicol_category"] = "ChlS"
                    }
                    if (data["tetA(A)"] == "1" || data["tetA(B)"] == "1" || data["tetA(C)"] == "1" || data["tetA(D)"] == "1") {
                        obj_parser["tetracycline_category"] = "TetR"
                    } else {
                        obj_parser["tetracycline_category"] = "TetS"
                    }
                }
                if (column_names.indexOf("qnrS") != -1) {
                    if (obj_parser["cip_pheno_qrdr_gene"] == undefined) {
                        obj_parser["cip_pheno_qrdr_gene"] = data["qnrS"].toString() + data["qnrB"].toString()
                    } else {
                        obj_parser["cip_pheno_qrdr_gene"] = obj_parser["cip_pheno_qrdr_gene"] + data["qnrS"].toString() + data["qnrB"].toString()
                    }
                    if (obj_parser["dcs_mechanisms"] == undefined) {
                        if (data["qnrS"] == "1") {
                            obj_parser["dcs_mechanisms"] = `_QRDR + qnrS`
                        } else {
                            obj_parser["dcs_mechanisms"] = `_QRDR`
                        }
                    } else {
                        if (data["qnrS"] == "1") {
                            obj_parser["dcs_mechanisms"] = obj_parser["dcs_mechanisms"] + `_QRDR + qnrS`
                        } else {
                            obj_parser["dcs_mechanisms"] = obj_parser["dcs_mechanisms"] + `_QRDR`
                        }
                    }
                }
                if (column_names.indexOf("gyrA_S83F") != -1) {
                    for (let column of headers_amr_snps) {
                        obj_parser[column] = data[column]
                    }
                    const list_qrdr = ["gyrA_S83F", "gyrA_S83Y", "gyrA_D87A", "gyrA_D87G", "gyrA_D87N", "gyrA_D87V", "gyrA_D87Y", "gyrB_S464F", "gyrB_S464Y", "parC_S80I", "parC_E84G", "parC_E84K"]
                    obj_parser["num_qrdr"] = 0
                    for (let qrdr of list_qrdr) {
                        if (data[qrdr] == "1") {
                            obj_parser["num_qrdr"]++
                        }
                    }
                    if (obj_parser["dcs_mechanisms"] == undefined) {
                        obj_parser["dcs_mechanisms"] = obj_parser["num_qrdr"]
                    } else {
                        obj_parser["dcs_mechanisms"] = obj_parser["num_qrdr"] + obj_parser["dcs_mechanisms"]
                    }
                    obj_parser["num_acrb"] = data["acrB_R717Q"]
                    if (obj_parser["azith_pred_pheno"] == undefined) {
                        if (parseInt(data["acrB_R717Q"]) > 0) {
                            obj_parser["azith_pred_pheno"] = "AzithR"
                        } else {
                            obj_parser["azith_pred_pheno"] = "AzithS"
                        }
                    }
                    if (obj_parser["num_qrdr"] == 3) {
                        obj_parser["cip_pred_pheno"] = "CipR"
                    }
                    if (obj_parser["num_qrdr"] == 2) {
                        obj_parser["cip_pred_pheno"] = "CipI"
                    }
                    if (obj_parser["num_qrdr"] == 1) {
                        obj_parser["cip_pred_pheno"] = "CipI"
                    }
                    if (obj_parser["num_qrdr"] == 0) {
                        obj_parser["cip_pred_pheno"] = "CipS"
                    }
                    if (obj_parser["cip_pheno_qrdr_gene"] != undefined) {
                        let cid_pred_pheno = obj_parser["cip_pred_pheno"].toString() + obj_parser["cip_pheno_qrdr_gene"].toString()
                        obj_parser["cip_pheno_qrdr_gene"] = cid_pred_pheno
                        if (cid_pred_pheno == "CipS10") {
                            obj_parser["cip_pred_pheno"] = "CipI"
                        }
                        if (cid_pred_pheno == "CipI10") {
                            obj_parser["cip_pred_pheno"] = "CipR"
                        }
                        if (cid_pred_pheno == "CipI01") {
                            obj_parser["cip_pred_pheno"] = "CipR"
                        }
                    } else {
                        obj_parser["cip_pheno_qrdr_gene"] = obj_parser["cip_pred_pheno"].toString()
                    }
                    obj_parser["dcs_category"] = obj_parser["cip_pred_pheno"]
                    if (obj_parser["cip_pred_pheno"] == "CipI") {
                        obj_parser["dcs_category"] = "DCS"
                    }
                    if (obj_parser["cip_pred_pheno"] == "CipR") {
                        obj_parser["dcs_category"] = "DCS"
                    }
                }
                if (column_names.indexOf("PW_AMP") != -1) {
                    for (let column of headers_amr_profile) {
                        obj_parser[column] = data[column]
                    }
                }
                if (obj_parser["cip_pred_pheno"] != undefined && obj_parser["dcs_category"] != undefined &&
                    obj_parser["cip_pheno_qrdr_gene"] != undefined && obj_parser["MDR"] == "MDR" != undefined &&
                    obj_parser["azith_pred_pheno"] != undefined && obj_parser["XDR"] != undefined) {

                    let XDR = obj_parser["XDR"]
                    let dcs_category = obj_parser["dcs_category"]
                    let cip_pheno_qrdr_gene = obj_parser["cip_pheno_qrdr_gene"]
                    let cip_pred_pheno = obj_parser["cip_pred_pheno"]
                    let azith_pred_pheno = obj_parser["azith_pred_pheno"]
                    let MDR = obj_parser["MDR"]
                    let num_amr_genes = obj_parser["num_amr_genes"]

                    if (XDR == "XDR") {

                        obj_parser["amr_category"] = "XDR"
                    } else if (MDR == "MDR" && dcs_category == "DCS" &&
                        cip_pred_pheno == "CipI" &&
                        cip_pheno_qrdr_gene == "CipI00" &&
                        azith_pred_pheno == "AzithR") {

                        obj_parser["amr_category"] = "AzithR_DCS_MDR"

                    } else if (MDR == "MDR" && dcs_category == "DCS" &&
                        (cip_pred_pheno == "CipI" || cip_pred_pheno == "CipR") &&
                        (cip_pheno_qrdr_gene == "CipI00" || cip_pheno_qrdr_gene == "CipI01" || cip_pheno_qrdr_gene == "CipS10" || cip_pheno_qrdr_gene == "CipR00") &&
                        azith_pred_pheno == "AzithS") {

                        obj_parser["amr_category"] = "MDR_DCS"

                    } else if (dcs_category == "DCS" &&
                        (cip_pred_pheno == "CipR" || cip_pred_pheno == "CipS" || cip_pred_pheno == "CipI") &&
                        (cip_pheno_qrdr_gene == "CipI00" || cip_pheno_qrdr_gene == "CipR00") &&
                        azith_pred_pheno == "AzithR") {

                        obj_parser["amr_category"] = "AzithR_DCS"

                    } else if (dcs_category == "DCS" &&
                        (cip_pred_pheno == "CipR" || cip_pred_pheno == "CipI") &&
                        num_amr_genes != "0" &&
                        azith_pred_pheno == "AzithS") {

                        obj_parser["amr_category"] = "AMR_DCS"

                    } else if (dcs_category == "DCS" && MDR == "-" &&
                        azith_pred_pheno == "AzithS" &&
                        (cip_pred_pheno == "CipI" || cip_pred_pheno == "CipR") &&
                        (cip_pheno_qrdr_gene == "CipI00" || cip_pheno_qrdr_gene == "CipR00")) {

                        obj_parser["amr_category"] = "DCS"

                    } else if (MDR == "MDR" && dcs_category != "DCS" &&
                        cip_pred_pheno == "CipS" &&
                        azith_pred_pheno == "AzithR" &&
                        cip_pheno_qrdr_gene == "CipS00") {

                        obj_parser["amr_category"] = "AzithR_MDR"

                    } else if (MDR == "MDR" && dcs_category == "CipS" &&
                        azith_pred_pheno == "AzithS" &&
                        cip_pred_pheno == "CipS" &&
                        cip_pheno_qrdr_gene == "CipS00") {

                        obj_parser["amr_category"] = "MDR"

                    } else if (MDR == "-" && dcs_category != "DCS" &&
                        cip_pred_pheno == "CipS" &&
                        cip_pheno_qrdr_gene == "CipS00" &&
                        num_amr_genes != "0" &&
                        azith_pred_pheno == "AzithS") {

                        obj_parser["amr_category"] = "AMR"

                    } else if (cip_pred_pheno == "CipS" &&
                        azith_pred_pheno == "AzithS" &&
                        cip_pheno_qrdr_gene == "CipS00" &&
                        num_amr_genes == "0") {

                        obj_parser["amr_category"] = "No AMR detected"

                    }
                }
                if (new_obj > 0) {
                    data_to_write.push(obj_parser)
                } else {
                    data_to_write[index] = obj_parser
                }
                obj_parser = {}
            })

        .on('end', async() => {
            data_to_write.forEach(element => {
                for (const key in element) {
                    if (element[key] === "") {
                        element[key] = "-"
                    }
                }
            });

            let temp = []
            for (let d = 0; d < data_to_write.length; d++) {
                if (data_to_write[d]["COUNTRY_ONLY"] !== "-" && data_to_write[d]["DATE"] !== "-") {
                    temp.push(data_to_write[d])
                }
            }

            await Tools.CreateFile(temp, "clean.csv")

        })
    }
    return res.json({ "Finished": "All done!" });
})
router.get('/download', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let path_file = Tools.path_clean_db || Tools.path_clean
    res.download(path_file);
});

export default router