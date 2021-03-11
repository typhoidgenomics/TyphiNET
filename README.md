![TyphiNET_Logo](assets/img/logo-typhinet.png) 
# TyphiNET web dashboard
![Code Count](https://img.shields.io/github/languages/count/zadyson/TyphiNET) 
![Main Code Base](https://img.shields.io/github/languages/top/zadyson/TyphiNET) 
![License](https://img.shields.io/badge/) 
![Version](https://img.shields.io/badge/version-1.0-red) 
![Last Commit](https://img.shields.io/github/last-commit/zadyson/TyphiNET) 
![Open Issues](https://img.shields.io/github/issues-raw/zadyson/TyphiNET) 
![Repo Size](https://img.shields.io/github/repo-size/zadyson/TyphiNET)

## Table of Contents

* [Description](#Description)
* [Installation](#Installation

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

## Site

[HTTP](http://typhinet.erc.monash.edu/)
[HTTPS](https://typhinet.erc.monash.edu/)

---

# QUANDO DEVO CRIAR O CLEAN.CSV?

O clean.csv deve ser criado somente caso ele não exista no path assets/webscrap/clean.

# REQUISITOS PARA CRIAR O CLEAN.CSV

Para que o clean.csv seja criado, é necessário que 7 arquivos estejam no path assets/webscrap/raw_data. Sendo eles:

- pw_amr-genes.csv
- pw_amr-profile.csv
- pw_amr-snps.csv
- pw_metadata.csv
- pw_species-prediction.csv
- pw_stats.csv
- pw_typing.csv

# COMO CRIAR O CLEAN.CSV

Para criar o clean.csv basta utilizar a rota:

Rodando localmente:
http://localhost:8080/api/file/create

Rodando no heroku:
https://typhinet.herokuapp.com/api/file/create

Deve-se atentar que caso o arquivo já esteja criado, ele irá ser <b>EXCLUÍDO</b> e um novo será gerado. Portanto, não é recomendável que sejam feitas alterações nesse arquivo clean.csv, qualquer atualização dos dados deve ser feita no MongoDB e então deverá ser utilizado o passo: [COMO CRIAR O CLEAN_DB.CSV](#COMO-CRIAR-O-CLEAN_DB.CSV)

# ENVIANDO O CLEAN.CSV PARA O MONGODB

Após ter criado o clean.csv, para enviar os dados para o mongoDB basta utilizar a rota:

Rodando localmente:
http://localhost:8080/api/mongo/upload

Rodando no heroku:
https://typhinet.herokuapp.com/api/mongo/upload

Quando o arquivo tiver sido enviado a mensagem: 

    Combined enviado para MongoDB com sucesso!

Aparecerá no terminal.

# COMO CRIAR O CLEAN_DB.CSV

Para baixar os dados que estão no mongo basta utilizar a rota:

Rodando localmente:
http://localhost:8080/api/mongo/download

