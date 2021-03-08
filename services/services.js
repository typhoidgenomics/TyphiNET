import ObjectsToCsv from 'objects-to-csv'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(
    import.meta.url));
//A variável path_clean guarda o path do arquivo clean.csv
const path_clean = path.join(__dirname, "../assets/webscrap/clean/clean.csv")
    //A variável path_clean_db guarda o path do arquivo clean_db.csv, porém ele precisa ser criado
    //Caso não esteja criado, ele guardará o valor undefined
var path_clean_db
    //Utilizo o módulo chokidar para criar um watcher, que ficará observando qualquer alteração na pasta clean
const watcher = chokidar.watch(path.join(__dirname, "../assets/webscrap/clean/"), { ignored: /^\./, persistent: true });
//Caso a mudança que ele detecte seja de um arquivo adicionado ao diretório, então ele irá verificar
//Se o arquivo criado trata-se do clean_db.csv, se sim, ele irá inserir o path dele na variável path_clean_db
//Se não o valor de path_clean_db será undefined
watcher
    .on('add', function() {
        fs.readdir("./assets/webscrap/clean/", function(error, files) {
            if (files.indexOf("clean_db.csv") != -1) {
                path_clean_db = path.join(__dirname, "../assets/webscrap/clean/clean_db.csv")
            } else {
                path_clean_db = undefined
            }
        });
    })
    .on('unlink', function() {
        fs.readdir("./assets/webscrap/clean/", function(error, files) {
            if (files.indexOf("clean_db.csv") != -1) {
                path_clean_db = path.join(__dirname, "../assets/webscrap/clean/clean_db.csv")
            } else {
                path_clean_db = undefined
            }
        });
    })
    // Function to create the CSV file, the first parameter is an array containing several objects that will be the data to be written to the file
    // Second is the name of the file along with its extension, for example: clean.csv
    // The files for this function are always saved in the clean folder.
async function CreateFile(data, name) {
    let csv_writer = new ObjectsToCsv(data)
    let save_path = path.join(__dirname, `../assets/webscrap/clean/${name}`)
    await csv_writer.toDisk(save_path)
}

export { CreateFile, path_clean_db, path_clean }