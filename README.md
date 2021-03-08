![TyphiNET_Logo](assets/img/logo-typhinet.png) 
# TyphiNET web dashboard
![Code Count](https://img.shields.io/github/languages/count/zadyson/TyphiNET) 
![Main Code Base](https://img.shields.io/github/languages/top/zadyson/TyphiNET) 
![License](https://img.shields.io/badge/license-MIT-blue) 
![Version](https://img.shields.io/badge/version-1.0-red) 
![Last Commit](https://img.shields.io/github/last-commit/zadyson/TyphiNET) 
![Open Issues](https://img.shields.io/github/issues-raw/zadyson/TyphiNET) 
![Repo Size](https://img.shields.io/github/repo-size/zadyson/TyphiNET)

## Table of Contents

* [Description](#Description)
* [Installation](#Installation)

## Description

TyphiNET is a dashboard for visualising global *Salmonella* Typhi genotype and antimicrobial resistance data.  Our interface allows you to search for specific data on individual countries, and over specific time periods.  Data are regularly updated (last updated November 5th 2020) from [Pathogenwatch](https://pathogen.watch/).

## Installation

#### 1. Install <a href="https://git-scm.com/">GIT</a>, <a href="https://www.npmjs.com/get-npm">NPM</a> and <a href="https://www.mongodb.com/try/download/community?tck=docs_server">MongoDB</a>:
```Note: While installing MongoDB, check the option to also install MongoDB Compass. If there's no option you can download it here:``` <a href="https://www.mongodb.com/try/download/compass">MongoDB Compass</a>

#### 2. Install YARN with the command:

```sh
npm install -g yarn
```

#### 3. On the command line, run the commands:

```sh
git clone https://github.com/zadyson/TyphiNET.git
```

#### 4. Inside the project folder run this command to install the server dependecies:

```sh
npm install
```

#### 5. Inside the folder ```/client``` run the previous command to install the client dependecies.

#### 6. Inside the project folder create a file named ```.env```, inside it copy the following code:

```sh
EMAIL_USER= (insert here the email to which you want to receive the Contact Us messages)
EMAIL_PASSWD= (password from previous email)
MONGO_URI= (see item 7 from manual)
```

#### 7. When opening MongoDB Compass, you will see a white box with a connection string. Copy this string and paste it on the variable ```MONGO_URI```. After click the ```Connect``` button.

#### 8. Finally, inside the project folder run the command and wait for the program to open on your browser:

```sh
yarn start:prod
```
#### 9. Under constrution 

# creating clean.csv

Clean.csv should be created only if it does not exist in path assets / webscrap / clean.
# Clean.csv structure 

For clean.csv to be created, 7 files must be in path assets / webscrap / raw_data. Being them:

- pw_amr-genes.csv
- pw_amr-profile.csv
- pw_amr-snps.csv
- pw_metadata.csv
- pw_species-prediction.csv
- pw_stats.csv
- pw_typing.csv

# File clean.CSV

Route to local run (create file):
http://localhost:8080/api/file/create

heroku deploy:
https://typhinet.herokuapp.com/api/file/create

It should be noted that if the file is already created (clean.csv), it will be <b> EXCLUDED </b> and a new one will be generated. Therefore, it is not recommended that changes be made to this clean.csv file, any data update must be done in MongoDB and then the step.

# Send the clean.csv to MONGODB

After creating clean.csv, to send the data to mongoDB just use the route:

# Create Clean_db.CSV

To download the data that is in the mongo just use the route:


Running on heroku:
https://typhinet.herokuapp.com/api/mongo/download

It is recommended to use this route only if any changes have been made to any data.

## Site

[Here](http://typhinet.erc.monash.edu/)