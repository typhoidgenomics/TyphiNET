import express from "express";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as Tools from "../../services/services.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

//Route GET to create the clean.csv
router.get("/create", function (req, res) {
  //All files that read require to generate the combine.csv
  const read_files = [
    "pw_metadata.csv",
    "pw_typing.csv",
    "pw_amr-genes.csv",
    "pw_species-prediction.csv",
    "pw_amr-snps.csv",
    "pw_amr-profile.csv",
    "pw_stats.csv",
  ];

  //All header fields require related to each pw_file
  const headers_metadata = [
    "DATE",
    "TGC ID",
    "ACCESSION",
    "AGE",
    "COUNTRY OF ORIGIN",
    "LOCATION",
    "COUNTRY ISOLATED",
    "TRAVEL ASSOCIATED",
    "TRAVEL COUNTRY",
    "STRAIN",
    "PURPOSE OF SAMPLING",
    "SOURCE",
    "SYMPTOM STATUS",
    "PROJECT ACCESSION",
    "BIOSAMPLE",
    "LAB",
    "CONTACT",
    "ACCURACY",
    "PMID",
    "LATITUDE",
    "LONGITUDE",
  ];

  const headers_species_prediction = [
    "Genome ID",
    "Version",
    "Organism Name",
    "Organism ID",
    "Species Name",
    "Species ID",
    "Genus Name",
    "Genus ID",
    "Reference ID",
    "Matching Hashes",
    "p-Value",
    "Mash Distance",
  ];

  const headers_typing = [
    "REFERENCE",
    "MLST ST (EnteroBase)",
    "MLST PROFILE (EnteroBase)",
    "GENOTYPHI SNPs CALLED",
    "Inc Types",
  ];

  const headers_amr_genes = [
    "ampC",
    "blaCTX-M-12",
    "blaCTX-M-15_23",
    "blaCTX-M-55",
    "blaOXA-1",
    "blaOXA-7",
    "blaOXA134_2",
    "blaSHV-12",
    "blaTEM-1D",
    "catA1",
    "cmlA",
    "qnrB",
    "qnrS",
    "qnrD",
    "sul1",
    "sul2",
    "dfrA1",
    "dfrA14",
    "dfrA15",
    "dfrA17",
    "dfrA18",
    "dfrA5",
    "dfrA7",
    "tetA(A)",
    "tetA(B)",
    "tetA(C)",
    "tetA(D)",
    "ereA",
  ];

  const headers_amr_snps = [
    "gyrA_S83F",
    "gyrA_S83Y",
    "gyrA_D87A",
    "gyrA_D87G",
    "gyrA_D87N",
    "gyrA_D87V",
    "gyrA_D87Y",
    "gyrB_S464F",
    "gyrB_S464Y",
    "parC_S80I",
    "parC_E84G",
    "parC_E84K",
    "acrB_R717Q",
    "acrB_R717L",
  ];
  const headers_amr_profile = [
    "Ampicillin",
    "Broad-Spectrum Cephalosporins",
    "Chloramphenicol",
    "Ciprofloxacin",
    "Sulfonamides",
    "Trimethoprim",
    "Co-Trimoxazole",
    "Tetracycline",
    "Azithromycin",
    "Colistin",
    "Meropenem",
  ];

  const empty = ["NA", "Not Provided", "", "-", undefined];

  let obj_parser = {};
  let data_to_write = [];

  for (let file of read_files) {
    fs.createReadStream(
      path.join(__dirname, `../../assets/webscrap/raw_data/${file}`),
      { start: 0 }
    )
      .pipe(csv())
      .on("data", (data) => {
        let column_names = Object.keys(data);
        let data_name;

        if (file === "pw_species-prediction.csv") {
          data_name = data["Genome Name"].toString();
        } else {
          data_name = data["NAME"].toString();
        }

        if (data_name !== "NA") {
          data_name = data_name.trim();
          obj_parser = data_to_write.filter((x) => {
            if (x.NAME == data_name) return x;
          });

          let index = data_to_write.indexOf(obj_parser[0]);
          let new_obj = true;
          if (obj_parser.length == 0) {
            obj_parser = { NAME: data_name };
          } else {
            new_obj = false;
            obj_parser = obj_parser[0];
          }

          if (file === "pw_metadata.csv") {
            if (empty.includes(data["DATE"])) {
              obj_parser["DATE"] = "-";
            } else {
              if (data["DATE"].trim().length === 4) {
                obj_parser["DATE"] = data["DATE"].trim();
              } else if (data["DATE"].trim().length > 4) {
                let date_aux = data["DATE"].split(" ");
                date_aux = date_aux[date_aux.length - 1];
                obj_parser["DATE"] = date_aux;
              }
            }

            obj_parser["COUNTRY_ONLY"] = empty.includes(
              data["COUNTRY OF ORIGIN"]
            )
              ? "-"
              : data["COUNTRY OF ORIGIN"];
            obj_parser["REGION_IN_COUNTRY"] = empty.includes(data["LOCATION"])
              ? "-"
              : data["LOCATION"];

            if (data["TRAVEL ASSOCIATED"] === "Yes") {
              obj_parser["TRAVEL"] = "travel";
            } else if (data["TRAVEL ASSOCIATED"] === "No") {
              obj_parser["TRAVEL"] = "local";
            } else {
              obj_parser["TRAVEL"] = data["TRAVEL ASSOCIATED"];
            }

            obj_parser["COUNTRY_ORIGIN"] = empty.includes(
              data["COUNTRY OF ORIGIN"]
            )
              ? "-"
              : data["COUNTRY OF ORIGIN"];
            obj_parser["TRAVEL_LOCATION"] = empty.includes(
              data["TRAVEL COUNTRY"]
            )
              ? "-"
              : data["TRAVEL COUNTRY"];

            const keys = Object.keys(data);

            for (let i = 0; i < headers_metadata.length; i++) {
              const index = keys.findIndex((x) => x === headers_metadata[i]);
              if (headers_metadata[i] === "ACCESSION") {
                obj_parser["ACCESSION"] = empty.includes(data[keys[0]])
                  ? "-"
                  : data[keys[0]];
              } else if (
                !["DATE"].includes(headers_metadata[i]) &&
                index != -1
              ) {
                obj_parser[keys[index].toUpperCase()] = empty.includes(
                  data[keys[index]]
                )
                  ? "-"
                  : data[keys[index]];
              }
            }
          }

          if (column_names.indexOf("Genome ID") != -1) {
            for (let column of headers_species_prediction) {
              obj_parser[column] = data[column];
            }
          }
          if (column_names.indexOf("REFERENCE") != -1) {
            for (let column of headers_typing) {
              obj_parser[column] = data[column];
            }
          }
          if (column_names.indexOf("GENOTYPHI GENOTYPE") != -1) {
            const h58_genotypes = [
              "4.3.1",
              "4.3.1.1",
              "4.3.1.1.P1",
              "4.3.1.2",
              "4.3.1.3",
              "4.3.1.1.EA1",
              "4.3.1.2.EA2",
              "4.3.1.2.EA3",
              "4.3.1.3.Bdq",
            ];
            const curate_223 = [
              "9953_5_76_LaoLNT1480_2010",
              "10060_6_13_LaoSV430_2009",
              "10060_6_20_LaoUI10788_2007",
              "10060_6_30_LaoUI14598_2009",
              "10209_5_36_LaoUI2001_2002",
              "10209_5_60_LaoUI3396_2003",
            ];
            if (h58_genotypes.indexOf(data["GENOTYPHI GENOTYPE"]) != -1) {
              obj_parser["h58_genotypes"] = data["GENOTYPHI GENOTYPE"];
              obj_parser["GENOTYPE_SIMPLE"] = "H58";
            } else {
              obj_parser["h58_genotypes"] = "-";
              obj_parser["GENOTYPE_SIMPLE"] = "Non-H58";
            }
            if (curate_223.indexOf(data["NAME"]) != -1) {
              obj_parser["GENOTYPE"] = "2.2.3";
            } else {
              obj_parser["GENOTYPE"] = data["GENOTYPHI GENOTYPE"];
            }
          }
          if (column_names.indexOf("blaCTX-M-15_23") != -1) {
            let num_amr_genes = 0;
            let column;
            for (column of headers_amr_genes) {
              obj_parser[column] = data[column];
              if (data[column] == "1") {
                num_amr_genes++;
              }
            }
            obj_parser["num_amr_genes"] = num_amr_genes.toString();
            const dirA = [
              "dfrA1",
              "dfrA5",
              "dfrA7",
              "dfrA14",
              "dfrA15",
              "dfrA17",
              "dfrA18",
            ];
            obj_parser["dfra_any"] = "0";
            for (let d of dirA) {
              if (data[d] == "1") {
                obj_parser["dfra_any"] = "1";
              }
            }
            if (data["sul1"] == "0" && data["sul2"] == "0") {
              obj_parser["sul_any"] = "0";
            } else {
              obj_parser["sul_any"] = "1";
            }
            if (obj_parser["sul_any"] == "1" && obj_parser["dfra_any"] == "1") {
              obj_parser["co_trim"] = "1";
            } else {
              obj_parser["co_trim"] = "0";
            }
            if (
              data["catA1"] == "1" &&
              data["blaTEM-1D"] == "1" &&
              obj_parser["co_trim"] == "1"
            ) {
              obj_parser["MDR"] = "MDR";
            } else {
              obj_parser["MDR"] = "-";
            }
            if (
              obj_parser["MDR"] == "MDR" &&
              data["blaCTX-M-15_23"] == "1" &&
              data["qnrS"] == "1"
            ) {
              obj_parser["XDR"] = "XDR";
            } else {
              obj_parser["XDR"] = "-";
            }
            if (data["ereA"] == "1") {
              obj_parser["azith_pred_pheno"] = "AzithR";
            }
            if (
              data["blaCTX-M-15_23"] == "1" ||
              data["blaOXA-7"] == "1" ||
              data["blaSHV-12"] == "1" ||
              data["blaCTX-M-55"] == "1"
            ) {
              obj_parser["ESBL_category"] = "ESBL";
            } else {
              obj_parser["ESBL_category"] = "Non-ESBL";
            }
            if (data["catA1"] == "1" || data["cmlA"] == "1") {
              obj_parser["chloramphenicol_category"] = "ChlR";
            } else {
              obj_parser["chloramphenicol_category"] = "ChlS";
            }
            if (
              data["tetA(A)"] == "1" ||
              data["tetA(B)"] == "1" ||
              data["tetA(C)"] == "1" ||
              data["tetA(D)"] == "1"
            ) {
              obj_parser["tetracycline_category"] = "TetR";
            } else {
              obj_parser["tetracycline_category"] = "TetS";
            }
          }
          if (file === "pw_amr-genes.csv") {
            if (obj_parser["cip_pheno_qrdr_gene"] == undefined) {
              obj_parser["cip_pheno_qrdr_gene"] =
                data["qnrS"].toString() + data["qnrB"].toString();
            } else {
              obj_parser["cip_pheno_qrdr_gene"] =
                obj_parser["cip_pheno_qrdr_gene"] +
                data["qnrS"].toString() +
                data["qnrB"].toString();
            }
            if (obj_parser["dcs_mechanisms"] == undefined) {
              if (data["qnrS"] == "1" && data["qnrB"] == "1") {
                obj_parser["dcs_mechanisms"] = `_QRDR + qnrS + qnrB`;
              } else if (data["qnrS"] == "1") {
                obj_parser["dcs_mechanisms"] = `_QRDR + qnrS`;
              } else if (data["qnrB"] == "1") {
                obj_parser["dcs_mechanisms"] = `_QRDR + qnrB`;
              } else {
                obj_parser["dcs_mechanisms"] = `_QRDR`;
              }
            } else {
              if (data["qnrS"] == "1" && data["qnrB"] == "1") {
                obj_parser["dcs_mechanisms"] =
                  obj_parser["dcs_mechanisms"] + `_QRDR + qnrS + qnrB`;
              } else if (data["qnrS"] == "1") {
                obj_parser["dcs_mechanisms"] =
                  obj_parser["dcs_mechanisms"] + `_QRDR + qnrS`;
              } else if (data["qnrB"] == "1") {
                obj_parser["dcs_mechanisms"] =
                  obj_parser["dcs_mechanisms"] + `_QRDR + qnrB`;
              } else {
                let auxDCS = obj_parser["dcs_mechanisms"];
                if (!(typeof auxDCS === "string" && auxDCS.includes("QRDR"))) {
                  obj_parser["dcs_mechanisms"] =
                    obj_parser["dcs_mechanisms"] + `_QRDR`;
                }
              }
            }
          }
          if (column_names.indexOf("gyrA_S83F") != -1) {
            for (let column of headers_amr_snps) {
              obj_parser[column] = data[column];
            }

            const list_qrdr = [
              "gyrA_S83F",
              "gyrA_S83Y",
              "gyrA_D87A",
              "gyrA_D87G",
              "gyrA_D87N",
              "gyrA_D87V",
              "gyrA_D87Y",
              "gyrB_S464F",
              "gyrB_S464Y",
              "parC_S80I",
              "parC_E84G",
              "parC_E84K",
            ];
            obj_parser["num_qrdr"] = 0;
            for (let qrdr of list_qrdr) {
              if (data[qrdr] == "1") {
                obj_parser["num_qrdr"]++;
              }
            }
            if (obj_parser["dcs_mechanisms"] == undefined) {
              obj_parser["dcs_mechanisms"] = obj_parser["num_qrdr"];
            } else {
              obj_parser["dcs_mechanisms"] =
                obj_parser["num_qrdr"] + obj_parser["dcs_mechanisms"];
            }
            obj_parser["num_acrb"] = data["acrB_R717Q"];
            if (obj_parser["azith_pred_pheno"] == undefined) {
              if (
                parseInt(data["acrB_R717Q"]) > 0 ||
                parseInt(data["acrB_R717L"])
              ) {
                obj_parser["azith_pred_pheno"] = "AzithR";
              } else {
                obj_parser["azith_pred_pheno"] = "AzithS";
              }
            }

            if (obj_parser["num_qrdr"] === 3) {
              obj_parser["cip_pred_pheno"] = "CipR";
            }
            if (obj_parser["num_qrdr"] === 2) {
              obj_parser["cip_pred_pheno"] = "CipR";
            }
            if (obj_parser["num_qrdr"] === 1) {
              obj_parser["cip_pred_pheno"] = "CipI";
            }
            if (obj_parser["num_qrdr"] === 0) {
              obj_parser["cip_pred_pheno"] = "CipS";
            }

            if (obj_parser["cip_pheno_qrdr_gene"] != undefined) {
              let cid_pred_pheno =
                obj_parser["cip_pred_pheno"].toString() +
                obj_parser["cip_pheno_qrdr_gene"].toString();
              obj_parser["cip_pheno_qrdr_gene"] = cid_pred_pheno;
              if (
                cid_pred_pheno == "CipS10" ||
                cid_pred_pheno == "CipS11" ||
                cid_pred_pheno == "CipS01"
              ) {
                obj_parser["cip_pred_pheno"] = "CipI";
              }
              if (
                cid_pred_pheno == "CipI10" ||
                cid_pred_pheno == "CipI11" ||
                cid_pred_pheno == "CipI01"
              ) {
                obj_parser["cip_pred_pheno"] = "CipR";
              }
            } else {
              obj_parser["cip_pheno_qrdr_gene"] =
                obj_parser["cip_pred_pheno"].toString();
            }
            obj_parser["dcs_category"] = obj_parser["cip_pred_pheno"];
            if (obj_parser["cip_pred_pheno"] == "CipI") {
              obj_parser["dcs_category"] = "DCS";
            }
            if (obj_parser["cip_pred_pheno"] == "CipR") {
              obj_parser["dcs_category"] = "DCS";
            }
          }
          if (column_names.indexOf("PW_AMP") != -1) {
            for (let column of headers_amr_profile) {
              obj_parser[column] = data[column];
            }
          }
          if (
            obj_parser["cip_pred_pheno"] != undefined &&
            obj_parser["dcs_category"] != undefined &&
            obj_parser["cip_pheno_qrdr_gene"] != undefined &&
            (obj_parser["MDR"] == "MDR") != undefined &&
            obj_parser["azith_pred_pheno"] != undefined &&
            obj_parser["XDR"] != undefined
          ) {
            let XDR = obj_parser["XDR"];
            let dcs_category = obj_parser["dcs_category"];
            let cip_pheno_qrdr_gene = obj_parser["cip_pheno_qrdr_gene"];
            let cip_pred_pheno = obj_parser["cip_pred_pheno"];
            let azith_pred_pheno = obj_parser["azith_pred_pheno"];
            let MDR = obj_parser["MDR"];
            let num_amr_genes = obj_parser["num_amr_genes"];

            if (XDR == "XDR") {
              obj_parser["amr_category"] = "XDR";
            } else if (
              MDR == "MDR" &&
              dcs_category == "DCS" &&
              cip_pred_pheno == "CipI" &&
              cip_pheno_qrdr_gene == "CipI00" &&
              azith_pred_pheno == "AzithR"
            ) {
              obj_parser["amr_category"] = "AzithR_DCS_MDR";
            } else if (
              MDR == "MDR" &&
              dcs_category == "DCS" &&
              (cip_pred_pheno == "CipI" || cip_pred_pheno == "CipR") &&
              (cip_pheno_qrdr_gene == "CipI00" ||
                cip_pheno_qrdr_gene == "CipI01" ||
                cip_pheno_qrdr_gene == "CipS10" ||
                cip_pheno_qrdr_gene == "CipR00") &&
              azith_pred_pheno == "AzithS"
            ) {
              obj_parser["amr_category"] = "MDR_DCS";
            } else if (
              dcs_category == "DCS" &&
              (cip_pred_pheno == "CipR" ||
                cip_pred_pheno == "CipS" ||
                cip_pred_pheno == "CipI") &&
              (cip_pheno_qrdr_gene == "CipI00" ||
                cip_pheno_qrdr_gene == "CipR00") &&
              azith_pred_pheno == "AzithR"
            ) {
              obj_parser["amr_category"] = "AzithR_DCS";
            } else if (
              dcs_category == "DCS" &&
              (cip_pred_pheno == "CipR" || cip_pred_pheno == "CipI") &&
              num_amr_genes != "0" &&
              azith_pred_pheno == "AzithS"
            ) {
              obj_parser["amr_category"] = "AMR_DCS";
            } else if (
              dcs_category == "DCS" &&
              MDR == "-" &&
              azith_pred_pheno == "AzithS" &&
              (cip_pred_pheno == "CipI" || cip_pred_pheno == "CipR") &&
              (cip_pheno_qrdr_gene == "CipI00" ||
                cip_pheno_qrdr_gene == "CipR00")
            ) {
              obj_parser["amr_category"] = "DCS";
            } else if (
              MDR == "MDR" &&
              dcs_category != "DCS" &&
              cip_pred_pheno == "CipS" &&
              azith_pred_pheno == "AzithR" &&
              cip_pheno_qrdr_gene == "CipS00"
            ) {
              obj_parser["amr_category"] = "AzithR_MDR";
            } else if (
              MDR == "MDR" &&
              dcs_category == "CipS" &&
              azith_pred_pheno == "AzithS" &&
              cip_pred_pheno == "CipS" &&
              cip_pheno_qrdr_gene == "CipS00"
            ) {
              obj_parser["amr_category"] = "MDR";
            } else if (
              MDR == "-" &&
              dcs_category != "DCS" &&
              cip_pred_pheno == "CipS" &&
              cip_pheno_qrdr_gene == "CipS00" &&
              num_amr_genes != "0" &&
              azith_pred_pheno == "AzithS"
            ) {
              obj_parser["amr_category"] = "AMR";
            } else if (
              cip_pred_pheno == "CipS" &&
              azith_pred_pheno == "AzithS" &&
              cip_pheno_qrdr_gene == "CipS00" &&
              num_amr_genes == "0"
            ) {
              obj_parser["amr_category"] = "No AMR detected";
            }
          }
          if (new_obj > 0) {
            data_to_write.push(obj_parser);
          } else {
            data_to_write[index] = obj_parser;
          }
          obj_parser = {};
        }
      })

      .on("end", async () => {
        data_to_write.forEach((element) => {
          for (const key in element) {
            if (element[key] === "") {
              element[key] = "-";
            }
          }
        });

        let temp = [];
        let tempAll = [];

        for (let d = 0; d < data_to_write.length; d++) {
          if (!["", undefined].includes(data_to_write[d]["num_qrdr"])) {
            if (
              data_to_write[d]["num_qrdr"] === 0 &&
              (data_to_write[d]["qnrS"] === "1" ||
                data_to_write[d]["qnrB"] === "1")
            ) {
              data_to_write[d]["cip_pred_pheno"] = "CipI";
            } else if (data_to_write[d]["num_qrdr"] === 0) {
              data_to_write[d]["cip_pred_pheno"] = "CipS";
            } else if (
              data_to_write[d]["num_qrdr"] === 1 &&
              (data_to_write[d]["qnrS"] === "1" ||
                data_to_write[d]["qnrB"] === "1")
            ) {
              data_to_write[d]["cip_pred_pheno"] = "CipR";
            } else if (
              data_to_write[d]["num_qrdr"] === 2 &&
              (data_to_write[d]["qnrS"] === "1" ||
                data_to_write[d]["qnrB"] === "1")
            ) {
              data_to_write[d]["cip_pred_pheno"] = "CipR";
            } else if (
              data_to_write[d]["num_qrdr"] === 1 ||
              data_to_write[d]["num_qrdr"] === 2
            ) {
              data_to_write[d]["cip_pred_pheno"] = "CipI";
            } else {
              data_to_write[d]["cip_pred_pheno"] = "CipR";
            }
          }
          if (
            data_to_write[d]["cip_pred_pheno"] === "CipI" ||
            data_to_write[d]["cip_pred_pheno"] === "CipR"
          ) {
            data_to_write[d]["dcs_category"] = "DCS";
          } else {
            data_to_write[d]["dcs_category"] = "CipS";
          }
          if (
            !empty.includes(data_to_write[d]["DATE"]) &&
            !empty.includes(data_to_write[d]["COUNTRY_ONLY"]) &&
            data_to_write[d]["PURPOSE OF SAMPLING"].includes("Non Targeted")
          ) {
            temp.push(data_to_write[d]);
          }
          tempAll.push(data_to_write[d]);
        }
        await Tools.CreateFile(temp, "clean.csv");
        await Tools.CreateFile(tempAll, "cleanAll.csv");
      });
  }
  return res.json({ Finished: "All done!" });
});

// Download clean as spreadsheet
router.get("/download", function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  let path_file = Tools.path_clean_all;
  res.download(path_file);
});

// Get data for admin page: changes and current data
router.get("/databaseLog", function (req, res, next) {
  const path = "./assets/database/previousDatabases.txt";
  const text = fs.readFileSync(path, "utf-8");
  const aux = JSON.parse(text);
  return res.json(aux);
});

export default router;
