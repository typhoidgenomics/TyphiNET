var express = require('express');
var router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');



router.get('/:filter1/:country/:min_year/:max_year', function(req, res, next) {
  params =  req.params
  let results_json = [];
  let results = [];
  fs.createReadStream('assets/webscrap/styphi/combine.csv')
  .pipe(csv())
  .on('data', (data) => results_json.push(data))
  .on('end', () => {
    for (data of results_json){
      let filter_value = new Object()
      filter_value["NAME"] =data["NAME"]
      filter_value["COUNTRY_ONLY"] = data["COUNTRY_ONLY"]
      filter_value["YEAR"] = data["DATE.x"]
      filter_value["GENOTYPE"] = data["GENOTYPE"]
      if ((data["COUNTRY_ONLY"] == params.country) && (params.min_year <= data["DATE.x"] && data["DATE.x"] <= params.max_year)){
        if (params.filter1 == "1"){      
          filter_value["blaCTX-M-15_23"] = data["blaCTX-M-15_23"]
          results.push(filter_value)
        }
        else if(params.filter1 == "2"){
          filter_value["amr_category"] = data["amr_category"]
          results.push(filter_value)
        }
        else if(params.filter1 == "3"){
          filter_value["amr_category"] = data["amr_category"]
          filter_value["GENOTYPE_SIMPLE"] = data["GENOTYPE_SIMPLE"]
          results.push(filter_value)
        }
        else if(params.filter1 == "4"){
        
          filter_value["Inc Types"] = data["Inc Types"]
          results.push(filter_value)
        }
        else{
          results.push(filter_value)
        }
      }
      else if ((params.country == "all") && (params.min_year <= data["DATE.x"] && data["DATE.x"] <= params.max_year)){
        if (params.filter1 == "1"){      
          filter_value["blaCTX-M-15_23"] = data["blaCTX-M-15_23"]
          results.push(filter_value)
        }
        else if(params.filter1 == "2"){
          filter_value["amr_category"] = data["amr_category"]
          results.push(filter_value)
        }
        else if(params.filter1 == "3"){
          filter_value["amr_category"] = data["amr_category"]
          filter_value["GENOTYPE_SIMPLE"] = data["GENOTYPE_SIMPLE"]
          results.push(filter_value)
        }
        else if(params.filter1 == "4"){
        
          filter_value["Inc Types"] = data["Inc Types"]
          results.push(filter_value)
        }
        else{
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


router.get('/:country/:min_year/:max_year', function(req, res, next) {
  params =  req.params
  let country_unique_genotype = {}
  let results = []
  fs.createReadStream('assets/webscrap/styphi/combine.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
  for (data of results){
    if (params.country != "all"){
      if (country_unique_genotype[params.country] == undefined){
        country_unique_genotype[params.country] = {
                                                   "GENOTYPES": {
                                                                 "GENOTYPES_LIST": [],
                                                                 "TOTAL": 0
                                                                },
                                                   "H58": 0,
                                                   "MDR": 0,
                                                   "TOTAL_OCCURRENCE": 0
                                                  }
      }
      if ((data["COUNTRY_ONLY"] == params.country) && (params.min_year <= data["DATE.x"] && data["DATE.x"] <= params.max_year)){
        if (country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) == -1){
          country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"])
        } 
        country_unique_genotype[params.country]["TOTAL_OCCURRENCE"]++
        if (data["GENOTYPE_SIMPLE"] == "H58"){
          country_unique_genotype[params.country]["H58"]++
        }
        if (data["MDR"] == "MDR"){
          country_unique_genotype[params.country]["MDR"]++
        }
      }
    }
    else{
      if (country_unique_genotype[data["COUNTRY_ONLY"]] == undefined){
        country_unique_genotype[data["COUNTRY_ONLY"]] = {
                                                         "GENOTYPES": {
                                                                       "GENOTYPES_LIST": [],
                                                                       "TOTAL": 0
                                                                      },
                                                          "H58": 0,
                                                          "MDR": 0,
                                                          "TOTAL_OCCURRENCE": 0
                                                        }
      }
      if ((params.min_year <= data["DATE.x"] && data["DATE.x"] <= params.max_year)){
        if (country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["GENOTYPES_LIST"].indexOf(data["GENOTYPE"]) == -1){
          country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["GENOTYPES_LIST"].push(data["GENOTYPE"])
          country_unique_genotype[data["COUNTRY_ONLY"]]["GENOTYPES"]["TOTAL"]++
        }
        country_unique_genotype[data["COUNTRY_ONLY"]]["TOTAL_OCCURRENCE"]++
        if (data["GENOTYPE_SIMPLE"] == "H58"){
          country_unique_genotype[data["COUNTRY_ONLY"]]["H58"]++
        }
        if (data["MDR"] == "MDR"){
          country_unique_genotype[data["COUNTRY_ONLY"]]["MDR"]++
        }
      }
    }

  }
  for (data in country_unique_genotype){
    country_unique_genotype[data]["H58"] = (country_unique_genotype[data]["H58"]/country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
    country_unique_genotype[data]["MDR"] = (country_unique_genotype[data]["MDR"]/country_unique_genotype[data]["TOTAL_OCCURRENCE"]) * 100
    delete country_unique_genotype[data].TOTAL_OCCURRENCE
  }
  if (params.country != "all"){
    country_unique_genotype[params.country]["GENOTYPES"]["GENOTYPES_LIST"].sort(function order_by_year(a, b) {
      if (a < b) {
        return -1;
      }
      if (b < a) {
        return 1;
      }
      return 0;
    })
  }
  else{
    for (country in country_unique_genotype)
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
module.exports = router;