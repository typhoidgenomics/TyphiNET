import ObjectsToCsv from "objects-to-csv";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import chokidar from "chokidar";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const path_clean = path.join(__dirname, "../assets/webscrap/clean/clean.csv");
const path_clean_all = path.join(
  __dirname,
  "../assets/webscrap/clean/cleanAll.csv"
);
var path_clean_db;
const watcher = chokidar.watch(
  path.join(__dirname, "../assets/webscrap/clean/"),
  { ignored: /^\./, persistent: true }
);

watcher
  .on("add", function () {
    fs.readdir("./assets/webscrap/clean/", function (error, files) {
      if (files.indexOf("clean_db.csv") != -1) {
        path_clean_db = path.join(
          __dirname,
          "../assets/webscrap/clean/clean_db.csv"
        );
      } else {
        path_clean_db = undefined;
      }
    });
  })
  .on("unlink", function () {
    fs.readdir("./assets/webscrap/clean/", function (error, files) {
      if (files.indexOf("clean_db.csv") != -1) {
        path_clean_db = path.join(
          __dirname,
          "../assets/webscrap/clean/clean_db.csv"
        );
      } else {
        path_clean_db = undefined;
      }
    });
  });

async function CreateFile(data, name) {
  const csv_writer = new ObjectsToCsv(data);
  const save_path = path.join(__dirname, `../assets/webscrap/clean/${name}`);
  await csv_writer.toDisk(save_path);
}

export { CreateFile, path_clean_db, path_clean, path_clean_all };
