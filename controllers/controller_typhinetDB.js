import CombinedModel from '../models/combined.js';
import asyncHandler from 'express-async-handler';
import * as Tools from '../services/services.js';
import express from 'express';
import csv from 'csv-parser';
import fs from 'fs';
const router = express.Router()

//getData function to get all fields
export const getUsers = asyncHandler(async(req, res) => {
    const users = await CombinedModel.find({})
    res.json(users)
})

//getSampleById function to retrieve sample by id
export const getUserById = asyncHandler(async(req, res) => {
    const user = await CombinedModel.findById(req.params.id)

    //if user id match param id send user else throw error
    if (user) {
        res.json(user)
    } else {
        res.status(404).json({ message: "User not found" })
        res.status(404)
        throw new Error('User not found')
    }
})

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

router.get('/upload', (req, res) => {

    let data_to_send = []
    fs.createReadStream(Tools.path_clean, { start: 0 })
        .pipe(csv())
        .on('data', (data) => {
            data_to_send.push(data)
        })
        .on('end', () => {

            CombinedModel.insertMany(data_to_send, (error) => {
                if (error) return res.json({ "Status": `Error! ${error}` });
                console.log("Sucess ! Combined data sent to MongoDB!");
            });
            res.json({ "Status": "Sent!" })
        })
});
export default router;