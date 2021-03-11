import ObjectsToCsv from 'objects-to-csv'
import fs from 'fs'
import { dirname } from path from 'path'
import chokidar from 'chokidar'

import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(
    import.meta.url))

//This variable store the path file of clean.csv

const path_clean = path.join(__dirname, '../assets/webscrap/clean/clean.csv')

// The variable path_clean_db store the path of file clean_db.csv. But first this file need be create. If you doesn't create, it will store a undefined value

var path_clean_db

// The chokidar module was used to create a watcher, which will monitor any change in clean folder

const watcher = chokidar.watch(path.join(__dirname, '../assets/webscrap/clean/'), { ignored: /^\./, persistent: true })

watcher
    .on('add', function() {
        fs.readdir('./assets/webscrap/clean/', function(error, files) {
            if (files.indexOf('clean_db.csv') != -1) {
                path_clean_db = path.join(__dirname, '../assets/webscrap/clean/clean_db.csv')
            } else {
                path_clean_db = undefined
            }
        })
    })
    .on('unlink', function() {
        fs.readdir('./assets/webscrap/clean/', function(error, files) {
            if (files.indexOf('clean_db.csv') != -1) {
                path_clean_db = path.join(__dirname, '../assets/webscrap/clean/clean_db.csv')
            } else {
                path_clean_db = undefined
            }
        })
    })

// Function to create the CSV file, the first parameter is an array containing several objects that will be the data to be written to the file
// Second is the name of the file along with its extension, for example: clean.csv
// The files for this function are always saved in the clean folder.

async function CreateFile(data, name) {
    const csv_writer = new ObjectsToCsv(data)
    const save_path = path.join(__dirname, `../assets/webscrap/clean/${name}`)
    await csv_writer.toDisk(save_path)
}

export { CreateFile, path_clean_db, path_clean }