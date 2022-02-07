import CombinedModel from '../models/combined.js';
import asyncHandler from 'express-async-handler';
import * as Tools from '../services/services.js';
import express from 'express';
import csv from 'csv-parser';
import fs from 'fs';
import { detailedDiff} from 'deep-object-diff';
import LZString from 'lz-string';

const router = express.Router()

//getData function to get all fields
// export const getUsers = asyncHandler(async(req, res) => {
//     const users = await CombinedModel.find({})
//     res.json(users)
// })

// //getSampleById function to retrieve sample by id
// export const getUserById = asyncHandler(async(req, res) => {
//     const user = await CombinedModel.findById(req.params.id)

//     //if data id match param id send data else throw error
//     if (user) {
//         res.json(user)
//     } else {
//         res.status(404).json({ message: "Data not found" })
//         res.status(404)
//         throw new Error('Data not found')
//     }
// })

// Downloads data from MongoDB and creates the clean_db file
router.get('/download', (req, res) => {

    CombinedModel.find().then(async(comb) => {
        let send_comb = []
        for (let data of comb) {
            let aux_data = JSON.parse(JSON.stringify(data));
            delete aux_data["_id"]
            delete aux_data["__v"]
            send_comb.push(aux_data)
        }

        await Tools.CreateFile(send_comb, "clean_db.csv")
        return res.json(send_comb);
    })
})

// Uploads clean file to MongoDB
router.get('/upload', (req, res) => {
    let data_to_send = []
    fs.createReadStream(Tools.path_clean, { start: 0 })
        .pipe(csv())
        .on('data', (data) => {
            data_to_send.push(data)
        })
        .on('end', () => {
            CombinedModel.countDocuments(function (err, count) {
                if (err) {
                    return res.json({ "Status": `Error! ${err}` });
                }
                if (count > 0) {
                    CombinedModel.collection.drop();
                }
                CombinedModel.insertMany(data_to_send, (error) => {
                    if (error) return res.json({ "Status": `Error! ${error}` });
                    console.log("Success ! Combined data sent to MongoDB!");
                });
            });
            res.json({ "Status": "Sent!" })
        })
});

// Upload data from admin page to MongoDB
router.post('/upload/admin', (req, res) => {

    const path = "./assets/database/lastClean.txt";

    if (req.body.current === 1) {
        fs.writeFileSync(path, JSON.stringify({data: []}));
    }
    
    const text = fs.readFileSync(path, 'utf-8');
    const aux = JSON.parse(text);

    const decompressed = LZString.decompress(req.body.data)
    const object = JSON.parse(decompressed)[0]
    const array = Object.values(object)
    aux.data = [...aux.data, ...array]
    fs.writeFileSync(path, JSON.stringify(aux));

    if (req.body.current === req.body.parts) {
        CombinedModel.countDocuments(function (err, count) {
            if (err) {
                return res.json({ "Status": `Error! ${err}` });
            }
            if (count > 0) {
                CombinedModel.collection.drop();
            }
            CombinedModel.insertMany(aux.data, (error) => {
                if (error) return res.json({ "Status": `Error! ${error}` });
                res.json({ "Status": 'Uploaded' });
            });
        });
    } else {
        res.json("")
    }

});

// Check if there were any changes made directly in the MongoDB and update current data from the admin page
router.get('/checkForChanges', async (req, res) => {
    let response = []

    response = await CombinedModel.find().then(async(comb) => {
        let send_comb = []
        for (let data of comb) {
            let aux_data = JSON.parse(JSON.stringify(data));
            delete aux_data["_id"]
            delete aux_data["__v"]
            send_comb.push(aux_data)
        }
        return send_comb
    })
    
    const path = "./assets/database/previousDatabases.txt";
    const text = fs.readFileSync(path, 'utf-8');
    const aux = JSON.parse(text);
    const collection = aux[aux.length - 1].data;

    const data = {}
    for (const i in response) {
        data[response[i].NAME.toString()] = response[i]
    }

    if (collection.length === 0) {
        aux[aux.length - 1].data = data
        fs.writeFileSync(path, JSON.stringify(aux));
        console.log('New data');
        res.json({ "Status": "New Data" });
    } else {
        const difference = detailedDiff(collection, data)
        Object.keys(difference.updated).forEach(element => {
            for (const key in difference.updated[element]) {
                difference.updated[element][key] = {
                    new: difference.updated[element][key],
                    old: collection[element][key]
                }
            }
        });
        Object.keys(difference.deleted).forEach(element => {
            difference.deleted[element] = collection[element]
        });

        if (Object.keys(difference).filter(x => Object.keys(difference[x]).length > 0).length > 0) {
            const currentDate = new Date();
            aux.splice(0, 0, {
                updatedAt: currentDate.toISOString(),
                changes: difference
            })
            aux[aux.length - 1].data = data
            aux[aux.length - 1].updatedAt = currentDate.toISOString()
            fs.writeFileSync(path, JSON.stringify(aux));
            console.log('Changes: true');
            res.json({ "Status": "Changes" });
        } else {
            console.log('Changes: false');
            res.json({ "Status": "No Changes" });
        }
    }
});

// Get last date that the MongoDB was updated
router.get('/lastUpdated', (req, res) => {

    const path = "./assets/database/previousDatabases.txt";
    
    const text = fs.readFileSync(path, 'utf-8');
    const aux = JSON.parse(text);
    return res.json(aux[0].updatedAt)
});

// Delete specific change from the admin page
router.post('/deleteChange', (req, res) => {

    const path = "./assets/database/previousDatabases.txt";
    const id = req.body.id;
    
    const text = fs.readFileSync(path, 'utf-8');
    let aux = JSON.parse(text);
    aux.splice(id, 1)
    fs.writeFileSync(path, JSON.stringify(aux));
    return res.json(aux)
});

// This is not currently being used
// router.get('/genomes/:name', (req, res) => {

//     CombinedModel.findOne({NAME: req.params.name}, function(err, result) {
//         if (err) {
//             return res.json({ success: false, message: "Something went wrong" });
//         }
    
//         if (result) {
//             return res.json({
//                 success: true,
//                 data: result
//             });
//         } else {
//             return res.json({
//                 success: true,
//                 data: 'no data'
//             });
//         }
//     });
// });

export default router;