![TyphiNET_Logo](assets/img/logo-typhinet-beta.png)

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
* [Video demonstration](#Demonstration)
* [Installation](#Installation)
* [Funding & acknowledgements](#Acknowledgements)

## Description

TyphiNET is a dashboard for visualising global *Salmonella* Typhi genotype and antimicrobial resistance data.  Our interface allows you to search for specific data on individual countries, and over specific time periods.  Data are regularly updated (last updated/curation on March 21th 2022) from [Pathogenwatch](https://pathogen.watch/).  

TyphiNET is available at: http://typhi.net 

## Demonstration
https://user-images.githubusercontent.com/8507671/144901022-3017adcb-30d2-451e-b7b8-421054426d85.mp4

## Installation (for software development purposes only, please visit http://typhi.net for all other purposes)

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
MONGO_URI= (see item 7 from manual)
MONGO_URI_ATLAS=(see item 7 from manual to access mongoDB Atlas cloud)
```

#### 7. When opening MongoDB Compass, you will see a white box with a connection string. Copy this string and paste it on the variable ```MONGO_URI```. After click the ```Connect``` button

#### 8. Finally, inside the project folder run the command and wait for the program to open on your browser

```sh
yarn start:prod
```


## Funding & acknowledgements  

The TyphiNET dashboard is coordinated by Dr Zoe Dyson, Dr Louise Cerdeira & Prof Kat Holt at the London School of Hygiene and Tropical Medicine & Monash University. This project has received funding from the the Wellcome Trust (Open Research Fund, 219692/Z/19/Z) and the European Union's Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681. <img src="https://user-images.githubusercontent.com/8507671/153406979-9462c466-5a65-469e-adb6-14e271fd9e21.jpg" height="30" />
