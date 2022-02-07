import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';

// Get all data from the clean or clean_db file inside assets
router.get('/getDataFromCSV', function (req, res, next) {
    let results = []
    let read_file = Tools.path_clean_db || Tools.path_clean

    fs.createReadStream(read_file)
        .on('error', (_) => { return res.json([]) })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
            return res.json(results);
        })
});


export default router