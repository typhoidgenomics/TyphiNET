import express from 'express'

import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as Tools from '../../services/services.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router()

//Rota da qual criará o clean.csv
router.get('/create', function (req, res) {

    //All files that read require to generate the combine.csv
    const read_files = ["pw_metadata.csv", "pw_species-prediction.csv", "pw_typing.csv",
        "pw_amr-genes.csv", "pw_amr-snps.csv", "pw_amr-profile.csv", "pw_stats.csv"
    ]

    //All header fields require related to each pw_file
    const headers_metadata = ["ACCURACY", "STRAIN", "SOURCE", "ACCESSION", "STUDY ACCESSION",
        "SANGER LANE", "PMID", "LATITUDE", "LONGITUDE"
    ]

    const headers_species_prediction = ["Genome ID", "Version", "Organism Name", "Organism ID", "Species Name", "Species ID", "Genus Name", "Genus ID", "Reference ID", "Matching Hashes", "p-Value", "Mash Distance"]

    const headers_typing = ["REFERENCE", "MLST ST (EnteroBase)", "MLST PROFILE (EnteroBase)", "GENOTYPHI SNPs CALLED", "Inc Types"]

    const headers_amr_genes = ["blaCTX-M-15_23", "blaOXA-7", "blaSHV-12", "blaTEM-1D", "catA1", "cmlA", "qnrB", "qnrS", "sul1", "sul2", "dfrA1", "dfrA14", "dfrA15", "dfrA17", "dfrA18", "dfrA5", "dfrA7", "tetA(A)",
        "tetA(B)", "tetA(C)", "tetA(D)", "ereA"
    ]

    const headers_amr_snps = ["gyrA_S83F", "gyrA_S83Y", "gyrA_D87A", "gyrA_D87G", "gyrA_D87N", "gyrA_D87V", "gyrA_D87Y", "gyrB_S464F", "gyrB_S464Y", "parC_S80I", "parC_E84G", "parC_E84K", "acrB_R717Q"]
    const headers_amr_profile = ["PW_AMP", "PW_CEP", "PW_CHL", "PW_CIP", "PW_SMX", "PW_TMP", "PW_SXT", "PW_TCY", "PW_AZM", "PW_CST", "PW_MEM"]

    //write lines
    let obj_parser = {}
    let data_to_write = []
    //Esse loop irá ler todos os nomes dos arquivos a serem filtrados
    for (let file of read_files) {
        //É criado uma ReadStream para ler cada um dos csv  
        fs.createReadStream(path.join(__dirname, `../../assets/webscrap/raw_data/${file}`), { start: 0 })
            .pipe(csv())
            .on('data', (data) => {
                //column_names guarda os títulos das colunas do arquivo atual
                let column_names = Object.keys(data)
                //data_name vai guardar o identificador do dado atual que está sendo lido. O "NAME" é o mesmo em todos os arquivos e ele é único.
                //É através dele que é feito a indentificação de qual dado está sendo tratado atualmente.
                //É feito uma formatação no name, primeiro transformando eles todos pro tipo string, e logo em seguida
                //é retirado os espaços da esquerda e da direita. Para não criar ambiguidade de dados
                let data_name = data["NAME"].toString()
                data_name = data_name.trim()
                //Por ser um objeto que sempre conterá o NAME como o mesmo valor para todos os arquivos
                //É ele quem será procurado pelo filtro abaixo, em todos os dados armazenados em obj_parser é procurado pelo
                //objeto que possui o NAME do dado atual, para então serem feitas as filtragens nele.
                obj_parser = data_to_write.filter((x) => { if (x.NAME == data_name) return x })
                //Após achar o objeto na lista de objetos data_to_write, é identificado qual é o seu index e então 
                //esse index é salvo na variável index
                let index = data_to_write.indexOf(obj_parser[0])
                //Essa variável é responsável por identificar se o dado atual é novo, ou ele já havia sido criado antes
                let new_obj = true
                //Caso o obj_parser tenha o tamanho 0, significa que ele não foi encontrado no vetor data_to_write
                if (obj_parser.length == 0) {
                    //Como não há o dado criado, a primeira coisa a ser criada no objeto é o NAME, para identificar futuramente
                    //nas outras filtragens
                    obj_parser = { "NAME": data_name }
                } else {
                    //Caso o dado já exista, a variável new_obj recebe false e obj_parser recebe o dado atual identificado
                    new_obj = false
                    obj_parser = obj_parser[0]
                }
                //Todos os if's abaixo estão verificando qual arquivo está sendo lido atualmente.
                //É utilizado o indexOf em column_names para verificar o nome de 1 coluna que indentifique qual arquivo 
                //Está sendo lido
                let item = 0
                //Arquivo aberto: pw_metadata
                if (file === "pw_metadata.csv") {
                    //Essa primeira filtragem é referente ao campo DATE
                    //Para acessar os valores das colunas do csv atualmente aberto basta chamar data e então
                    //passar em forma de chave o nome da coluna desejada, abaixo por exemplo, para acessar a coluna DATE
                    //bastei passar o valor data['DATE']

                    //A filtragem abaixo verifica se o tamanho do dado é de 4 caracteres, caso seja maior, significa que não está
                    //cotendo apenas o valor do ANO na coluna, e a primeira filtragem é transformar todos os valores
                    //contendo a informação apenas do ANO.
                    if (data['DATE'].trim().length == 4) {
                        //Caso ele já tenha 4 caracteres, é apenas retirado os espaçoes da esquerda e direita
                        obj_parser["DATE"] = data['DATE'].trim()
                    } else if (data['DATE'].trim().length > 4) {
                        //caso tenha mais que 4, é feito um split dos espações
                        let date_aux = data['DATE'].split(" ")
                        //E então é pego o último valor do vetor criado que é onde contém possivelmente o ano.
                        date_aux = date_aux[date_aux.length - 1]
                        //E o valor inserido no nosso dado atual é o filtrado pelas características acima.
                        obj_parser["DATE"] = date_aux
                    } else {
                        obj_parser["DATE"] = data['DATE'].trim()
                    }
                    //Aqui abaixo é verificado se o valor de DATE está vazio, caso esteja, é substituído o valor vazio por '-'
                    obj_parser["DATE"] = obj_parser["DATE"] != "" ? obj_parser["DATE"] : "-"

                    //Abaixo começa a filtragem em relação ao campo COUNTRY
                    let COUNTRY = data['COUNTRY']
                    let REGION_IN_COUNTRY
                    let TRAVEL
                    let TRAVEL_LOCATION
                    //Esse primeiro if verifica se no campo COUNTRY existe no dado atual o valor 'travel'
                    //Caso possua, ele entra no if
                    if (COUNTRY.indexOf("travel") != -1 || COUNTRY.indexOf("Travel") != -1) {
                        //Aqui ele dá um split para separar o valor do país com o valor do travel
                        //geralmente o dado com travel está nesse formato: PaísOriginal_travel_PaísDestino
                        //Então ao usar o split é separado em 1 vetor onde o [0] é o PaísOriginal, [1] é a informação
                        //de travel e [2] é o país para onde ele viajou
                        TRAVEL = COUNTRY.split("_")
                        //Devido a alteração solicitado pela Louise de que caso o valor travel seja válido, o valor de
                        //TRAVEL_LOCATION deve ser o que deve ficar em COUNTRY_ONLY e o valor de COUNTRY_ONLY
                        //Deve ir para COUNTRY_PW
                        //E é isso que é feito aqui embaixo, o valor referente ao TRAVEL_LOCATION é posto em COUNTRY_ONLY
                        obj_parser["COUNTRY_ONLY"] = TRAVEL[0]
                        obj_parser["REGION_IN_COUNTRY"] = "-"
                        obj_parser["TRAVEL"] = TRAVEL[1]
                        obj_parser["COUNTRY_ORIGIN"] = TRAVEL[0]
                        obj_parser["TRAVEL_LOCATION"] = TRAVEL[2]
                        //Aqui ele verifica se o valor de COUNTRY é: None ou Unknown ou "", caso seja algum deles o valor de
                        //COUNTRY_PW se torna: "-"
                        // obj_parser["COUNTRY_PW"] = (COUNTRY == "None" || COUNTRY == "Unknown" || COUNTRY == "") ? "-" : TRAVEL[0].trim()
                        //Caso o valor de Travel seja mais que apenas Travel ele entra aqui.
                        //Caso se trate de No Travel Reported o valor é alterado para local
                        //Caso seja qualquer outro valor, é alterado para unknown
                        if (TRAVEL[1] == "No Travel Information" || TRAVEL[1] == "No Travel Reported") {
                            obj_parser["TRAVEL"] = TRAVEL[1] == "No Travel Information" ? "unknown" : "local"
                        }
                        //Aqui embaixo ele verifica se o valor de TRAVEL é unknown ou local, para alterar o valor do
                        //COUNTRY_ONLY para o valor contido em COUNTRY_PW e inserir o valor "-" nas colunas COUNTRY_PW e TRAVEL_LOCATION
                        //Caso não possua travel ele vem para o else
                    } else {
                        //delete_countrys são os países que não de vem entrar na filtragem
                        const delete_countrys = ["south-east asia", "south america", "western asia", "Africa"]
                        let aux_country = COUNTRY
                        obj_parser["COUNTRY_ONLY"] = COUNTRY.trim()
                        //Esse if retira o outro valor ao lado de kuwait, deixando apenas o valor kuwait
                        if (aux_country.indexOf("/") != -1) {
                            let country_aux = COUNTRY.split("/")
                            country_aux = country_aux[0] == "kuwait" ? country_aux[0] : country_aux[1]
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        //Esse if verifica se o valor trata-se de SriLanka, para alterá-lo para Sri Lanka
                        if (aux_country == "SriLanka") {
                            let country_aux = COUNTRY.replace("SriLanka", "Sri Lanka")
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        //Mesma coisa que o if de cima, apenas separa o valor
                        if (aux_country == "EastTimor") {
                            let country_aux = COUNTRY.replace("EastTimor", "East Timor")
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        //Verifica se o país possui parênteses para removelos
                        if (aux_country.indexOf("(") != -1) {
                            let country_aux = COUNTRY.split(" ")
                            country_aux = country_aux[0]
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                            aux_country = country_aux
                        }
                        //Verifica se o páis possui ',' para removê-las
                        if (aux_country.indexOf(",") != -1) {
                            let country_aux = COUNTRY.split(",")
                            country_aux = country_aux[0]
                            obj_parser["COUNTRY_ONLY"] = country_aux.trim()
                        }
                        //Verifica se algum dos países que não deve passar, passou e muda seu valor para "-"
                        if (delete_countrys.indexOf(aux_country.toLowerCase()) != -1) {
                            obj_parser["COUNTRY_ONLY"] = "-"
                        }
                        //Verifica se o valor do país é unknown para alterá-lo para "-"
                        if (aux_country.toLowerCase() == "unknown") {
                            obj_parser["COUNTRY_ONLY"] = "-"
                        }
                        obj_parser["REGION_IN_COUNTRY"] = "-"
                        obj_parser["TRAVEL"] = "unknown"
                        obj_parser["COUNTRY_ORIGIN"] = obj_parser["COUNTRY_ONLY"]
                        obj_parser["TRAVEL_LOCATION"] = "-"
                    }
                    //Esse if verifica se o valor do país possui ':' se possuir, é porque ele possui o valor de REGION_IN_COUNTRY
                    //pois o valor é provavelmente desse tipo aqui PAÍS:REGIAO
                    //Quando há alguma região no país, a informação de travel fica nele, então caso haja algum travel ficaria:
                    // PAÍS:REGIAO_TRAVEL_DESTINO
                    if (COUNTRY.indexOf(":") != -1) {
                        //Faz o split, retornando o valor do país para a variável COUNTRY e retornando o valor de REGION para REGION_IN_COUNTRY
                        [COUNTRY, REGION_IN_COUNTRY] = COUNTRY.split(":")
                        //Verifica se o valor do país é None, Unknown ou "", caso seja algum desses ele altera o valor do país para "-"
                        obj_parser["COUNTRY_ONLY"] = COUNTRY
                        obj_parser["COUNTRY_ORIGIN"] = COUNTRY
                        //Retira os espaçoes da esquerda e direita do REGION_IN_COUNTRY
                        REGION_IN_COUNTRY = REGION_IN_COUNTRY.trim()
                        //Verifica se o valor de REGION_IN_COUNTRY é None/ Unknown ou "", caso seja algum deles o valor é alterado para "-"
                        obj_parser["REGION_IN_COUNTRY"] = (REGION_IN_COUNTRY == "None") ? "-" : REGION_IN_COUNTRY
                        //Verifica se há alguma informação de travel no REGION_IN_COUNTRY
                        if (REGION_IN_COUNTRY.indexOf("travel") != -1 || REGION_IN_COUNTRY.indexOf("Travel") != -1) {
                            //Faz o split do REGION_IN_COUNTRY 
                            TRAVEL = REGION_IN_COUNTRY.split("_")
                            //Após o split a variável TRAVEL fica como um vetor, onde o [0] é onde fica a região e o [1] fica a informação do TRAVEL
                            REGION_IN_COUNTRY = TRAVEL[0]
                            //Valores de travels que não são válidos
                            const remove_travels = ["No info", "", "Unknown"]
                            const remove_travels2 = ["No travel abroad", "No Travel Information", "No Travel Reported"]
                            //Verifica se o valor de Travel possui algum desses valores
                            if (remove_travels.indexOf(TRAVEL[2]) != -1 || remove_travels2.indexOf(TRAVEL[1]) != -1) {
                                TRAVEL_LOCATION = "-"
                                //Caso o valor de Travel seja o No Travel Reported, o valor de Travel será Local
                                if (TRAVEL[1] == "No Travel Reported") {
                                    TRAVEL = "local"
                                    //Se não, ele será unknown
                                } else {
                                    TRAVEL = "unknown"
                                }
                                //Caso ele não seja nenhuma das informações acima, é inserido o valor de TRAVEL_LOCATION
                                //E também é verificado se o valor de travel é "-" e se for, troca o valor por unknown
                            } else {
                                TRAVEL_LOCATION = TRAVEL[2]
                                TRAVEL = TRAVEL[1] == "-" ? "unknown" : TRAVEL[1]
                            }
                            //Abaixo ele verifica se o valor de REGION_IN_COUNTRY é None ou Unknown ou "" se for algum desses o valor será alterado para "-"
                            obj_parser["REGION_IN_COUNTRY"] = (REGION_IN_COUNTRY == "None" || REGION_IN_COUNTRY == "Unknown" || REGION_IN_COUNTRY == "") ? "-" : REGION_IN_COUNTRY
                            obj_parser["TRAVEL"] = TRAVEL
                            obj_parser["TRAVEL_LOCATION"] = TRAVEL_LOCATION
                        }
                    }

                    //Esse for é apenas para completar as restantes das colunas da planilha
                    for (let column of headers_metadata) {
                        if (column === "STRAIN" || column === "SANGER LANE" || column === "ACCESSION") {
                            if (data[column] === "NA") {
                                data[column] = ""
                            }
                        }
                        obj_parser[column] = data[column]
                    }
                    //Insere o valor original de COUNTRY antes das filtragens na coluna LOCATION
                    obj_parser["LOCATION"] = data['COUNTRY']
                }
                //Arquivo aberto: pw_species-prediction
                if (column_names.indexOf("Genome ID") != -1) {
                    //Apenas insere as colunas da planilha pw_species-prediction que estão no vetor 
                    //headers_species_prediction
                    for (let column of headers_species_prediction) {
                        obj_parser[column] = data[column]
                    }
                }
                //Arquivo aberto: pw_typing
                if (column_names.indexOf('REFERENCE') != -1) {
                    //Apenas insere as colunas da planilha pw_species-prediction que estão no vetor 
                    //headers_typing
                    for (let column of headers_typing) {
                        obj_parser[column] = data[column]
                    }
                }
                //Arquivo aberto: pw_typing
                if (column_names.indexOf("GENOTYPHI GENOTYPE") != -1) {
                    //filtra os genes h58
                    const h58_genotypes = ["4.3.1", "4.3.1.1", "4.3.1.1.P1", "4.3.1.2", "4.3.1.3"]
                    //Ele fazer uma filtragem especial para esses abaixo
                    const curate_223 = ["9953_5_76_LaoLNT1480_2010",
                        "10060_6_13_LaoSV430_2009",
                        "10060_6_20_LaoUI10788_2007",
                        "10060_6_30_LaoUI14598_2009",
                        "10209_5_36_LaoUI2001_2002",
                        "10209_5_60_LaoUI3396_2003"
                    ]
                    //Verifica se os gene atual está na lista dos genes acima, se tiver ele é classificado como H58
                    if (h58_genotypes.indexOf(data['GENOTYPHI GENOTYPE']) != -1) {
                        obj_parser["h58_genotypes"] = data['GENOTYPHI GENOTYPE']
                        obj_parser["GENOTYPE_SIMPLE"] = "H58"
                        //Se não ele é classificado como Non-H58
                    } else {
                        obj_parser["h58_genotypes"] = "-"
                        obj_parser["GENOTYPE_SIMPLE"] = "Non-H58"
                    }
                    //Se o gene atual tiver com o nome na lista curate_223 então o GENOTYPE dele será de 2.2.3
                    if (curate_223.indexOf(data['NAME']) != -1) {
                        obj_parser["GENOTYPE"] = "2.2.3"
                        //Se não ele receberá o valor que está em GENOTYPHI GENOTYPE
                    } else {
                        obj_parser["GENOTYPE"] = data['GENOTYPHI GENOTYPE']
                    }

                }
                //Arquivo aberto: pw_amr-genes
                if (column_names.indexOf("blaCTX-M-15_23") != -1) {
                    //Abaixo ele irá contar o número de amr_genes
                    let num_amr_genes = 0
                    let column
                    for (column of headers_amr_genes) {
                        obj_parser[column] = data[column]
                        if (data[column] == "1") {
                            num_amr_genes++
                        }
                    }
                    //Aqui ele transforma o número do amr de int pra string
                    obj_parser["num_amr_genes"] = num_amr_genes.toString()
                    const dirA = ["dfrA1", "dfrA5", "dfrA7", "dfrA14", "dfrA15", "dfrA17", "dfrA18"]
                    obj_parser["dfra_any"] = "0"
                    //Percorre o vetor dirA para identificar se algum desses genes é 1 para inserir o valor do
                    //dfra_any = 1 caso algum seja 1
                    for (let d of dirA) {
                        if (data[d] == "1") {
                            obj_parser["dfra_any"] = "1"
                        }
                    }
                    //Aqui ele verifica se o sul1 e o sul2 são 0, se for então o sul_any é 0
                    //se não vai ser 1
                    if (data["sul1"] == "0" && data["sul2"] == "0") {
                        obj_parser["sul_any"] = "0"
                    } else {
                        obj_parser["sul_any"] = "1"
                    }
                    //Verifica se o sul_any e o dfra_any são 1, se forem, o co_trim vai ser 1
                    if (obj_parser["sul_any"] == "1" && obj_parser["dfra_any"] == "1") {
                        obj_parser["co_trim"] = "1"
                    } else {
                        obj_parser["co_trim"] = "0"
                    }
                    //Verifica se os genes catA1, blaTEM-1D e co_trim são 1, se forem, o valor da coluna MDR será MDR
                    if (data["catA1"] == "1" && data["blaTEM-1D"] == "1" && obj_parser["co_trim"] == "1") {
                        obj_parser["MDR"] = "MDR"
                    } else {
                        obj_parser["MDR"] = "-"
                    }
                    // Caso o valor da coluna MDR seja MDR e blaCTX-M-15_23 seja 1 e qnrS seja 1, então o valor da coluna
                    // XDR vai ser XDR
                    if (obj_parser["MDR"] == "MDR" && data['blaCTX-M-15_23'] == "1" && data['qnrS'] == "1") {
                        obj_parser["XDR"] = "XDR"
                        //Se não vai ser "-"
                    } else {
                        obj_parser["XDR"] = "-"
                    }
                    //Se o gene ereA for 1, então o valor de azith_pred_pheno vai ser AzithR
                    if (data["ereA"] == "1") {
                        obj_parser["azith_pred_pheno"] = "AzithR"
                    }
                    //Se o valor do gene blaCTX-M-15_23 for 1, blaOXA-7 for 1 e blaSHV-12 for 1, então o valor da coluna
                    // ESBL_category vai ser ESBL
                    if (data["blaCTX-M-15_23"] == "1" || data["blaOXA-7"] == "1" || data["blaSHV-12"] == "1") {
                        obj_parser["ESBL_category"] = "ESBL"
                    } else {
                        obj_parser["ESBL_category"] = "Non-ESBL"
                    }
                    //Se o valor do gene carA1 for 1 e cmlA for 1 o valor da coluna chloramphenicol_category vai ser chlR
                    if (data["catA1"] == "1" || data["cmlA"] == "1") {
                        obj_parser["chloramphenicol_category"] = "ChlR"
                    } else {
                        obj_parser["chloramphenicol_category"] = "ChlS"
                    }
                    //Se algum dos valores tetA for 1, então o valor de tetracycline_category vai ser TetR
                    if (data["tetA(A)"] == "1" || data["tetA(B)"] == "1" || data["tetA(C)"] == "1" || data["tetA(D)"] == "1") {
                        obj_parser["tetracycline_category"] = "TetR"
                    } else {
                        obj_parser["tetracycline_category"] = "TetS"
                    }
                }
                //Arquivo aberto: pw_amr-genes
                if (column_names.indexOf("qnrS") != -1) {
                    //Verifica se o cip_pheno_qrdr_gene é undefined
                    //Se for, ele insere o valor do qnrS e qnrB na coluna cip_pheno_qrdr_gene
                    if (obj_parser["cip_pheno_qrdr_gene"] == undefined) {
                        obj_parser["cip_pheno_qrdr_gene"] = data["qnrS"].toString() + data["qnrB"].toString()
                        //Se não for, concatena o valor que já tem em cip_pheno_qrdr_gene com o valor de qnrS
                    } else {
                        obj_parser["cip_pheno_qrdr_gene"] = obj_parser["cip_pheno_qrdr_gene"] + data["qnrS"].toString() + data["qnrB"].toString()
                    }
                    //Verifica se o valor de dcs_mechanisms é undefined, se for, ele insere o valor _QRDR + qnrS ou _QRDR dependendo do valor de qnrS
                    if (obj_parser["dcs_mechanisms"] == undefined) {
                        if (data["qnrS"] == "1") {
                            obj_parser["dcs_mechanisms"] = `_QRDR + qnrS`
                        } else {
                            obj_parser["dcs_mechanisms"] = `_QRDR`
                        }
                        //Se não for undefined, ele vai concatenar o valor que já tem em dcs_mechanisms com o _QRDR + qnrS
                    } else {
                        if (data["qnrS"] == "1") {
                            obj_parser["dcs_mechanisms"] = obj_parser["dcs_mechanisms"] + `_QRDR + qnrS`
                        } else {
                            obj_parser["dcs_mechanisms"] = obj_parser["dcs_mechanisms"] + `_QRDR`
                        }
                    }

                }
                //Arquivo aberto: pw_amr-snps
                if (column_names.indexOf("gyrA_S83F") != -1) {
                    //Insere as colunas do pw_amr-snps que estão no vetor headers_amr_snps
                    for (let column of headers_amr_snps) {
                        obj_parser[column] = data[column]
                    }
                    const list_qrdr = ["gyrA_S83F", "gyrA_S83Y", "gyrA_D87A", "gyrA_D87G", "gyrA_D87N", "gyrA_D87V", "gyrA_D87Y", "gyrB_S464F", "gyrB_S464Y", "parC_S80I", "parC_E84G", "parC_E84K"]
                    obj_parser["num_qrdr"] = 0
                    //Conta o número de qrdr caso algum deles seja 1
                    for (let qrdr of list_qrdr) {
                        if (data[qrdr] == "1") {
                            obj_parser["num_qrdr"]++
                        }
                    }
                    //Verifica se o dcs_mechanisms é undefined, se for, ele recebe o valor de num_qrdr
                    if (obj_parser["dcs_mechanisms"] == undefined) {
                        obj_parser["dcs_mechanisms"] = obj_parser["num_qrdr"]
                        //Se não, ele concatena o valor já que tenha em dcs_mechanisms com num_qrdr
                    } else {
                        obj_parser["dcs_mechanisms"] = obj_parser["num_qrdr"] + obj_parser["dcs_mechanisms"]
                    }
                    //Insere o valor de acrB_R717Q na coluna num_acrb
                    obj_parser["num_acrb"] = data["acrB_R717Q"]
                    //veririfica se o valor de azith_pred_pheno é undefined
                    //Se for, ele entra e verifica se o valor de acrB_R717Q é maior que 0, se for, o valor de
                    //azith_pred_pheno se torna AzithR, se não, será AzithS
                    if (obj_parser["azith_pred_pheno"] == undefined) {
                        if (parseInt(data["acrB_R717Q"]) > 0) {
                            obj_parser["azith_pred_pheno"] = "AzithR"
                        } else {
                            obj_parser["azith_pred_pheno"] = "AzithS"
                        }
                    }
                    //Aqui ele verifica os valores de num_qrdr e dependendo do valor ele insere o valor do
                    //cip_pred_pheno 
                    if (obj_parser["num_qrdr"] == 3) {
                        obj_parser["cip_pred_pheno"] = "CipR"
                    }
                    if (obj_parser["num_qrdr"] == 2) {
                        obj_parser["cip_pred_pheno"] = "CipI"
                    }
                    if (obj_parser["num_qrdr"] == 1) {
                        obj_parser["cip_pred_pheno"] = "CipI"
                    }
                    if (obj_parser["num_qrdr"] == 0) {
                        obj_parser["cip_pred_pheno"] = "CipS"
                    }
                    //Verifica se o valor de cip_pheno_qrdr_gene é diferente de undefined, se for, entra no if
                    //Primeiro ele concatena o valor de cip_pred_pheno com cid_pheno_qrdr_gene
                    //E então ele insere esse valor na coluna cip_pheno_qrdr_gene
                    //As outras colunas verificam se o valor de cid_pred_pheno corresponde a alguns dos ifs
                    //Se sim, ele irá inserir um novo valor para cip_pred_pheno
                    if (obj_parser["cip_pheno_qrdr_gene"] != undefined) {
                        let cid_pred_pheno = obj_parser["cip_pred_pheno"].toString() + obj_parser["cip_pheno_qrdr_gene"].toString()
                        obj_parser["cip_pheno_qrdr_gene"] = cid_pred_pheno
                        if (cid_pred_pheno == "CipS10") {
                            obj_parser["cip_pred_pheno"] = "CipI"
                        }
                        if (cid_pred_pheno == "CipI10") {
                            obj_parser["cip_pred_pheno"] = "CipR"
                        }
                        if (cid_pred_pheno == "CipI01") {
                            obj_parser["cip_pred_pheno"] = "CipR"
                        }
                        //Se for undefined, ele só irá inserir o valor de cip_pred_pheno em cip_pheno_qrdr_gene
                    } else {
                        obj_parser["cip_pheno_qrdr_gene"] = obj_parser["cip_pred_pheno"].toString()
                    }
                    //insere o valor de cip_pred_pheno em dcs_category
                    obj_parser["dcs_category"] = obj_parser["cip_pred_pheno"]
                    //Verifica se o valor de cip_pred_pheno é cipI, se sim, o valor de dcs_category será DCS
                    if (obj_parser["cip_pred_pheno"] == "CipI") {
                        obj_parser["dcs_category"] = "DCS"
                    }
                    //Verifica se o valor de cip_pred_pheno é cipR, se sim, o valor de dcs_category será DCS
                    if (obj_parser["cip_pred_pheno"] == "CipR") {
                        obj_parser["dcs_category"] = "DCS"
                    }


                }
                //Arquivo aberto: pw_amr-profile
                if (column_names.indexOf("PW_AMP") != -1) {
                    //Apenas insere os valores das colunas do arquivo pw_amr-profile, que estão no vetor
                    //headers_amr_profile  
                    for (let column of headers_amr_profile) {
                        obj_parser[column] = data[column]
                    }
                }
                //Filtragem para criação da coluna amr_category
                if (obj_parser["cip_pred_pheno"] != undefined && obj_parser["dcs_category"] != undefined &&
                    obj_parser["cip_pheno_qrdr_gene"] != undefined && obj_parser["MDR"] == "MDR" != undefined &&
                    obj_parser["azith_pred_pheno"] != undefined && obj_parser["XDR"] != undefined) {
                    //inicio variáveis auxiliares para cada uma das colunas abaixo, pegando o valor da célula atual
                    let XDR = obj_parser["XDR"]
                    let dcs_category = obj_parser["dcs_category"]
                    let cip_pheno_qrdr_gene = obj_parser["cip_pheno_qrdr_gene"]
                    let cip_pred_pheno = obj_parser["cip_pred_pheno"]
                    let azith_pred_pheno = obj_parser["azith_pred_pheno"]
                    let MDR = obj_parser["MDR"]
                    let num_amr_genes = obj_parser["num_amr_genes"]
                    //Verifica se XDR possui o valor XDR, se sim, o amr_category será XDR
                    if (XDR == "XDR") {

                        obj_parser["amr_category"] = "XDR"
                        //Caso não seja XDR, irá verificar se o MDR é igual a MDR, se o DCS é igual a DCS
                        //se cip_pred_pheno é CipI, se cip_pheno_qrdr_gene é CipI00
                        //e se azith_pred_pheno é AzithR, se sim, o valor de amr_category será AzithR_DCS_MDR
                        //O mesmo será feito para todos os else if abaixo
                    } else if (MDR == "MDR" && dcs_category == "DCS" &&
                        cip_pred_pheno == "CipI" &&
                        cip_pheno_qrdr_gene == "CipI00" &&
                        azith_pred_pheno == "AzithR") {

                        obj_parser["amr_category"] = "AzithR_DCS_MDR"

                    } else if (MDR == "MDR" && dcs_category == "DCS" &&
                        (cip_pred_pheno == "CipI" || cip_pred_pheno == "CipR") &&
                        (cip_pheno_qrdr_gene == "CipI00" || cip_pheno_qrdr_gene == "CipI01" || cip_pheno_qrdr_gene == "CipS10" || cip_pheno_qrdr_gene == "CipR00") &&
                        azith_pred_pheno == "AzithS") {

                        obj_parser["amr_category"] = "MDR_DCS"

                    } else if (dcs_category == "DCS" &&
                        (cip_pred_pheno == "CipR" || cip_pred_pheno == "CipS" || cip_pred_pheno == "CipI") &&
                        (cip_pheno_qrdr_gene == "CipI00" || cip_pheno_qrdr_gene == "CipR00") &&
                        azith_pred_pheno == "AzithR") {

                        obj_parser["amr_category"] = "AzithR_DCS"

                    } else if (dcs_category == "DCS" &&
                        (cip_pred_pheno == "CipR" || cip_pred_pheno == "CipI") &&
                        num_amr_genes != "0" &&
                        azith_pred_pheno == "AzithS") {

                        obj_parser["amr_category"] = "AMR_DCS"

                    } else if (dcs_category == "DCS" && MDR == "-" &&
                        azith_pred_pheno == "AzithS" &&
                        (cip_pred_pheno == "CipI" || cip_pred_pheno == "CipR") &&
                        (cip_pheno_qrdr_gene == "CipI00" || cip_pheno_qrdr_gene == "CipR00")) {

                        obj_parser["amr_category"] = "DCS"

                    } else if (MDR == "MDR" && dcs_category != "DCS" &&
                        cip_pred_pheno == "CipS" &&
                        azith_pred_pheno == "AzithR" &&
                        cip_pheno_qrdr_gene == "CipS00") {

                        obj_parser["amr_category"] = "AzithR_MDR"

                    } else if (MDR == "MDR" && dcs_category == "CipS" &&
                        azith_pred_pheno == "AzithS" &&
                        cip_pred_pheno == "CipS" &&
                        cip_pheno_qrdr_gene == "CipS00") {

                        obj_parser["amr_category"] = "MDR"

                    } else if (MDR == "-" && dcs_category != "DCS" &&
                        cip_pred_pheno == "CipS" &&
                        cip_pheno_qrdr_gene == "CipS00" &&
                        num_amr_genes != "0" &&
                        azith_pred_pheno == "AzithS") {

                        obj_parser["amr_category"] = "AMR"

                    } else if (cip_pred_pheno == "CipS" &&
                        azith_pred_pheno == "AzithS" &&
                        cip_pheno_qrdr_gene == "CipS00" &&
                        num_amr_genes == "0") {

                        obj_parser["amr_category"] = "No AMR detected"

                    }
                }
                //Verifica se o new_obj é true, se sim, então ele insere o novo obj_parser criado dentro do vetor
                //data_to_write
                if (new_obj > 0) {
                    data_to_write.push(obj_parser)
                    //Caso ele não seja novo, ele apenas substitui o obj_parser que já estava na lista pelo novo
                    //com as novas informações
                } else {
                    data_to_write[index] = obj_parser
                }
                //obj_parser é 'zerado' para a criação de um novo
                obj_parser = {}
            })

            .on('end', async () => {
                data_to_write.forEach(element => {
                    for (const key in element) {
                        if (element[key] === "") {
                            element[key] = "-"
                        }
                    }
                });

                let temp = []
                for (let d = 0; d < data_to_write.length; d++) {
                    if (data_to_write[d]["COUNTRY_ONLY"] !== "-" && data_to_write[d]["DATE"] !== "-") {
                        temp.push(data_to_write[d])
                    }
                }

                //Chama essa função para criar um arquivo csv dentro da pasta clean
                //o primeiro parâmetro é um vetor de objetos que deverão ser escritos no csv
                //o segundo é o nome ocm a extensão
                await Tools.CreateFile(temp, "clean.csv")

            })
    }
    return res.json({ "Finished": "All done!" });
})
//Rota para ser feito o download do arquivo clean.csv ou do clean_db.csv caso esse exista.
router.get('/download', function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let path_file = Tools.path_clean_db || Tools.path_clean
    res.download(path_file);
});

export default router