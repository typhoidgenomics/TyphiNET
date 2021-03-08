import CombinedModel from '../models/combined.js';
import asyncHandler from 'express-async-handler';
import * as Tools from '../services/services.js';
import mongoose from 'mongoose'
import express from 'express';
import csv from 'csv-parser';
import fs from 'fs';
const router = express.Router()



//getData function to get all fields
export const getUsers = asyncHandler(async (req, res) => {
    const users = await CombinedModel.find({})
    res.json(users)
})

//getSampleById function to retrieve sample by id
export const getUserById = asyncHandler(async (req, res) => {
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

//Rota para baixar os dados do mongoDB e inserir na pasta clean em formato de csv com o nome de clean_db.csv
router.get('/download', (req, res) => {
    //chama o objeto Combined que possui o schema do mongoose, utiliza o comando find para resgatar todos os dados
    //do mongo Atlas e então usa o then para quando a chamada tiver sido completa, armazenar todos os dados
    //no parâmetro comb, e então utilizo um for para retirar algumas chaves que não deverão entrar no csv
    //pra cada dado eu excluo as chaves _id e __v e crio um novo objeto e insiro no vetor send_comb
    CombinedModel.find().then(async (comb) => {
        let send_comb = []
        for (let data of comb) {
            let aux_data = JSON.parse(JSON.stringify(data));
            delete aux_data["_id"]
            delete aux_data["__v"]
            send_comb.push(aux_data)
        }
        //E o dado que envio para a criação do arquivo é o send_comb
        await Tools.CreateFile(send_comb, "clean_db.csv")
        return res.json(send_comb);
    })
})

//Essa rota faz o upload do arquivo clean.csv para o mongo atlas
router.get('/upload', (req, res) => {
    //Esse vetor é onde terá os objetos que deverão ser enviados
    //cada objeto representa 1 linha
    let data_to_send = []
    fs.createReadStream(Tools.path_clean, { start: 0 })
        .pipe(csv())
        .on('data', (data) => {
            data_to_send.push(data)
        })
        .on('end', () => {
            //Utilizo a função insertMany para enviar os dados de 1 única vez para o mongo
            CombinedModel.insertMany(data_to_send, (error) => {
                if (error) return res.json({ "Status": `Error! ${error}` });
                console.log("Combined enviado para MongoDB com sucesso!");
            });
            res.json({ "Status": "Sent!" })
        })
});


/*

//Inicia a função para que comece a observar o banco para qualquer mudança
mongoose.connection.watch([{"$match": { 
    "operationType": 'replace'                           
}
}])
.on('change', change => {
    //Ao detectar que algo mudou, uso o find no schema CombineModel para receber todos os dados que estão no mongo
    //E ao receber, faço uma filtragem para retirar as chaves _id e __v para então salvar os dados no arquivo clean_db.csv
    CombinedModel.find().then(async (comb) => {
        let send_comb = []
        for (let data of comb) {
            let aux_data = JSON.parse(JSON.stringify(data));
            delete aux_data["_id"]
            delete aux_data["__v"]
            send_comb.push(aux_data)
        }
        await Tools.CreateFile(send_comb, "clean_db.csv")
        console.log("clean_db atualizado!")
    });
});
*/
export default router;