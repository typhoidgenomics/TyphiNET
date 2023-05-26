/*
   THESE FUNCTIONS ARE NOT USED IN THE FILTERS BECAUSE THEY MAKE THE FILE BE CREATED INCOMPLETE WITH INFORMATION
     WRONG.
     EVERY FUNCTION IS ABOUT THE FILTERING OF EACH FILE.
*/

function FilterMetadataFile(Title, data, obj_parser, headers) {
    if (Title.indexOf("COUNTRY") != -1) {
        if (data['DATE'].trim().length == 4) {
            obj_parser["DATE"] = data['DATE'].trim()
        } else if (data['DATE'].trim().length > 4) {
            date_aux = data['DATE'].split(" ")
            date_aux = date_aux[date_aux.length - 1]
            obj_parser["DATE"] = date_aux
        } else {
            obj_parser["DATE"] = data['DATE'].trim()
        }
        obj_parser["DATE"] = obj_parser["DATE"] != "" ? obj_parser["DATE"] : "-"

        COUNTRY = data['COUNTRY']
        if (COUNTRY.indexOf("travel") != -1 || COUNTRY.indexOf("Travel") != -1) {
            TRAVEL = COUNTRY.split("_")
            obj_parser["COUNTRY_ONLY"] = TRAVEL[2]
            obj_parser["COUNTRY_PW"] = (COUNTRY == "None" || COUNTRY == "Unknown" || COUNTRY == "") ? "-" : TRAVEL[0].trim()
            obj_parser["REGION_IN_COUNTRY"] = "-"
            if (TRAVEL[1] == "No Travel Information" || TRAVEL[1] == "No Travel Reported") {
                obj_parser["TRAVEL"] = TRAVEL[1] == "No Travel Information" ? "unknown" : "local"
            } else {
                obj_parser["TRAVEL"] = TRAVEL[1]
            }
            if (obj_parser["NAME"] == "355129") {
                console.log("\n\nELE AQUI: " + TRAVEL + "\n\n")
            }
            obj_parser["TRAVEL_LOCATION"] = TRAVEL[2]
            if (obj_parser["TRAVEL"] == "unknown" || obj_parser["TRAVEL"] == "local") {
                obj_parser["COUNTRY_ONLY"] = obj_parser["COUNTRY_PW"]
                obj_parser["COUNTRY_PW"] = "-"
                obj_parser["TRAVEL_LOCATION"] = "-"
            }
        } else {
            delete_countrys = ["south-east asia", "south america", "western asia", "Africa"]
            aux_country = COUNTRY
            obj_parser["COUNTRY_ONLY"] = COUNTRY.trim()
            if (aux_country.indexOf("/") != -1) {
                country_aux = COUNTRY.split("/")
                country_aux = country_aux[0] == "kuwait" ? country_aux[0] : country_aux[1]
                obj_parser["COUNTRY_ONLY"] = country_aux.trim()
            }
            if (aux_country == "SriLanka") {
                country_aux = COUNTRY.replace("SriLanka", "Sri Lanka")
                obj_parser["COUNTRY_ONLY"] = country_aux.trim()
            }
            if (aux_country == "EastTimor") {
                country_aux = COUNTRY.replace("EastTimor", "East Timor")
                obj_parser["COUNTRY_ONLY"] = country_aux.trim()
            }
            if (aux_country.indexOf("(") != -1) {
                country_aux = COUNTRY.split(" ")
                country_aux = country_aux[0]
                obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                aux_country = country_aux
            }
            if (aux_country.indexOf(",") != -1) {
                country_aux = COUNTRY.split(",")
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
            obj_parser["TRAVEL_LOCATION"] = "-"
            obj_parser["COUNTRY_PW"] = "-"
        }
        if (COUNTRY.indexOf(":") != -1) {
            [COUNTRY, REGION_IN_COUNTRY] = COUNTRY.split(":")
            obj_parser["COUNTRY_ONLY"] = (COUNTRY == "None" || COUNTRY == "Unknown" || COUNTRY == "") ? "-" : COUNTRY
            REGION_IN_COUNTRY = REGION_IN_COUNTRY.trim()
            obj_parser["REGION_IN_COUNTRY"] = (REGION_IN_COUNTRY == "None" || REGION_IN_COUNTRY == "Unknown" || REGION_IN_COUNTRY == "") ? "-" : REGION_IN_COUNTRY
            obj_parser["TRAVEL"] = obj_parser["TRAVEL"] == undefined ? "unknown" : obj_parser["TRAVEL"]
            obj_parser["COUNTRY_PW"] = "-"
            if (REGION_IN_COUNTRY.indexOf("travel") != -1 || REGION_IN_COUNTRY.indexOf("Travel") != -1) {
                TRAVEL = REGION_IN_COUNTRY.split("_")
                REGION_IN_COUNTRY = TRAVEL[0]
                remove_travels = ["No info", "", "Unknown"]
                if (remove_travels.indexOf(TRAVEL[2]) != -1 || TRAVEL[1] == "No travel abroad" || TRAVEL[1] == "No Travel Information" || TRAVEL[1] == "No Travel Reported") {
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

                if (REGION_IN_COUNTRY.indexOf("/") != -1) {
                    REGION_IN_COUNTRY = REGION_IN_COUNTRY.split("/")[0]
                }
                obj_parser["REGION_IN_COUNTRY"] = (REGION_IN_COUNTRY == "None" || REGION_IN_COUNTRY == "Unknown" || REGION_IN_COUNTRY == "") ? "-" : REGION_IN_COUNTRY
                obj_parser["TRAVEL"] = TRAVEL
                obj_parser["TRAVEL_LOCATION"] = TRAVEL_LOCATION
                if (TRAVEL == "unknown") {
                    obj_parser["COUNTRY_PW"] = "-"
                    obj_parser["COUNTRY_ONLY"] = COUNTRY
                } else {
                    obj_parser["COUNTRY_PW"] = obj_parser["COUNTRY_ONLY"]
                    obj_parser["COUNTRY_ONLY"] = TRAVEL_LOCATION
                }

            }
        }
        for (column of headers) {
            obj_parser[column] = data[column]
        }
        obj_parser["LOCATION"] = data['COUNTRY']
    }
}

function FilterSpeciesPredictionFile(Title, data, obj_parser, headers) {
    if (Title.indexOf("Genome ID") != -1) {
        for (column of headers) {
            obj_parser[column] = data[column]
        }
    }
}

function FilterTypingFile(Title, data, obj_parser, headers) {
    if (Title.indexOf('REFERENCE') != -1) {
        for (column of headers) {
            obj_parser[column] = data[column]
        }
    }
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

function FilterAmrGenes(Title, data, obj_parser, headers) {
    if (Title.indexOf("blaCTX-M-15_23") != -1) {
        num_amr_genes = 0
        for (column of headers) {
            obj_parser[column] = data[column]
            if (data[column] == "1") {
                num_amr_genes++
            }
        }
        obj_parser["num_amr_genes"] = num_amr_genes.toString()
        dirA = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"]
        obj_parser["dfra_any"] = "0"
        for (d of dirA) {
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
        if (data["blaCTX-M"] == "1" || data["blaOX-7"] == "1" || data["blaSHV-12"] == "1") {
            obj_parser["ESBL"] = "ESBL"
        } else {
            obj_parser["ESBL"] = "Non-ESBL"
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
        if (obj_parser["cip_pheno_qrdr_gene"] == undefined) {
            obj_parser["cip_pheno_qrdr_gene"] = data["qnrS"].toString() + data["qnrB"].toString()
        } else {
            obj_parser["cip_pheno_qrdr_gene"] = obj_parser["cip_pheno_qrdr_gene"] + data["qnrS"].toString() + data["qnrB"].toString()
        }
    }
}

function FilterAmrSNPS(Title, data, obj_parser, headers) {
    if (Title.indexOf("gyrA_S83F") != -1) {
        for (column of headers) {
            obj_parser[column] = data[column]
        }
        list_qrdr = ["gyrA_S83F", "gyrA_S83Y", "gyrA_D87A", "gyrA_D87G", "gyrA_D87N", "gyrA_D87V", "gyrA_D87Y", "gyrB_S464F", "gyrB_S464Y", "parC_S80I", "parC_E84G", "parC_E84K"]
        obj_parser["num_qrdr"] = 0
        for (qrdr of list_qrdr) {
            if (data[qrdr] == "1") {
                obj_parser["num_qrdr"]++
            }
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
            cid_pred_pheno = obj_parser["cip_pred_pheno"].toString() + obj_parser["cip_pheno_qrdr_gene"].toString()
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
        if (data["qnrB"] == "1" && data["qnrS"] == "1") {
            obj_parser["dcs_mechanisms"] = `${obj_parser["num_qrdr"]}_QRDR + qnrS + qnrB`
        } else if (data["qnrB"] == "1") {
            obj_parser["dcs_mechanisms"] = `${obj_parser["num_qrdr"]}_QRDR + qnrB`
        } else if (data["qnrS"] == "1") {
            obj_parser["dcs_mechanisms"] = `${obj_parser["num_qrdr"]}_QRDR + qnrS`
        } else {
            obj_parser["dcs_mechanisms"] = `${obj_parser["num_qrdr"]}_QRDR`
        }

    }
}

function FilterAmrProfile(Title, data, obj_parser, headers) {
    if (Title.indexOf("PW_AMP") != -1) {
        for (column of headers) {
            obj_parser[column] = data[column]
        }
    }
}

function FilterAmrCategory(obj_parser) {
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
}