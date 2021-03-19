![TyphiNET_Logo](assets/img/logo-typhinet.png)

# TyphiNET web dashboard

![Code Count](https://img.shields.io/github/languages/count/zadyson/TyphiNET)
![Main Code Base](https://img.shields.io/github/languages/top/zadyson/TyphiNET)
![Version](https://img.shields.io/badge/version-1.0-red)
![License](https://img.shields.io/badge/license-GPLv3-blue) 
![Last Commit](https://img.shields.io/github/last-commit/zadyson/TyphiNET)
![Open Issues](https://img.shields.io/github/issues-raw/zadyson/TyphiNET)
![Repo Size](https://img.shields.io/github/repo-size/zadyson/TyphiNET)

## Table of Contents

* [Description](#Description)
* [Installation](#Installation)

## Description

TyphiNET is a dashboard for visualising global *Salmonella* Typhi genotype and antimicrobial resistance data.  Our interface allows you to search for specific data on individual countries, and over specific time periods.  Data are regularly updated (last updated/curation on March 11th 2021) from [Pathogenwatch](https://pathogen.watch/).

## Installation

#### 1. Install <a href="https://git-scm.com/">GIT</a>, <a href="https://www.npmjs.com/get-npm">NPM</a> and <a href="https://www.mongodb.com/try/download/community?tck=docs_server">MongoDB</a>

```Note: While installing MongoDB, check the option to also install MongoDB Compass. If there's no option you can download it here:``` <a href="https://www.mongodb.com/try/download/compass">MongoDB Compass</a>

#### 2. Install YARN with the command

```sh
npm install -g yarn
```

#### 3. On the command line, run the commands

```sh
git clone https://github.com/zadyson/TyphiNET.git
```

#### 4. Inside the project folder run this command to install the server dependecies

```sh
npm install
```

#### 5. Inside the folder ```/client``` run the previous command to install the client dependecies

#### 6. Inside the project folder create a file named ```.env```, inside it copy the following code

```sh
EMAIL_USER= (insert here the email to which you want to receive the Contact Us messages)
EMAIL_PASSWD= (password from previous email)
MONGO_URI= (see item 7 from manual)
MONGO_URI_ATLAS=(see item 7 from manual to access mongoDB Atlas cloud)
```

#### 7. When opening MongoDB Compass, you will see a white box with a connection string. Copy this string and paste it on the variable ```MONGO_URI```. After click the ```Connect``` button

#### 8. Finally, inside the project folder run the command and wait for the program to open on your browser

```sh
yarn start:prod
```

#### Site

[HTTP](http://typhinet.erc.monash.edu/)
[HTTPS](https://typhinet.erc.monash.edu/)
[dev](https://typhinet.herokuapp.com//)

TODO  - need to format to route API style and add more informations

#### Create the clean.csv

clean.csv need be create only if the file doesn't exist in the directory assets/webscrap/clean.

#### Requeriments to create the clean.csv

clean.csv, requires 7 files inside the directory assets/webscrap/raw_data:

* pw_amr-genes.csv
* pw_amr-profile.csv
* pw_amr-snps.csv
* pw_metadata.csv
* pw_species-prediction.csv
* pw_stats.csv
* pw_typing.csv

#### Create the file clean.csv 

Note: Never edit the clean.csv file; If you need curate the data, make the changes  in the mongoDB and synch the data.

local route

<http://localhost:8080/api/file/create>

heroku route
<https://typhinet.herokuapp.com/api/file/create>

#### Upload clean.csv to mongoDB

local route
<http://localhost:8080/api/mongo/upload>

heroku route
<https://typhinet.herokuapp.com/api/mongo/upload>

#### Create the file clean_db.csv from mongoDB

local route
<http://localhost:8080/api/mongo/download>

heroku route
<https://typhinet.herokuapp.com/api/mongo/download>
