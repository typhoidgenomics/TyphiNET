import mongoose from 'mongoose';

// MongoDB scheme
const CombinedSchema = mongoose.Schema({
  NAME: {
    type: String
  },
  DATE: {
    type: String
  },
  COUNTRY_ONLY: {
    type: String
  },
  REGION_IN_COUNTRY: {
    type: String
  },
  TRAVEL: {
    type: String
  },
  COUNTRY_ORIGIN: {
    type: String
  },
  TRAVEL_LOCATION: {
    type: String
  },
  'TGC ID': {
    type: String
  },
  ACCESSION: {
    type: String
  },
  AGE: {
    type: String
  },
  'COUNTRY OF ORIGIN': {
    type: String
  },
  LOCATION: {
    type: String
  },
  'COUNTRY ISOLATED': {
    type: String
  },
  'TRAVEL ASSOCIATED': {
    type: String
  },
  'TRAVEL COUNTRY': {
    type: String
  },
  STRAIN: {
    type: String
  },
  'PURPOSE OF SAMPLING': {
    type: String
  },
  SOURCE: {
    type: String
  },
  'SYMPTOM STATUS': {
    type: String
  },
  'PROJECT ACCESSION': {
    type: String
  },
  BIOSAMPLE: {
    type: String
  },
  LAB: {
    type: String
  },
  CONTACT: {
    type: String
  },
  ACCURACY: {
    type: String
  },
  PMID: {
    type: String
  },
  LATITUDE: {
    type: String
  },
  LONGITUDE: {
    type: String
  },
  gyrA_S83F: {
    type: String
  },
  gyrA_S83Y: {
    type: String
  },
  gyrA_D87A: {
    type: String
  },
  gyrA_D87G: {
    type: String
  },
  gyrA_D87N: {
    type: String
  },
  gyrA_D87V: {
    type: String
  },
  gyrA_D87Y: {
    type: String
  },
  gyrB_S464F: {
    type: String
  },
  gyrB_S464Y: {
    type: String
  },
  gyrB_Q465L: {
    type: String
  },
  gyrB_Q465R: {
    type: String
  },
  parC_S80I: {
    type: String
  },
  parC_S80R: {
    type: String
  },
  parC_E84G: {
    type: String
  },
  parC_E84K: {
    type: String
  },
  parE_D420N: {
    type: String
  },
  parE_L416F: {
    type: String
  },
  acrB_R717Q: {
    type: String
  },
  acrB_R717L: {
    type: String
  },
  num_qrdr: {
    type: String
  },
  dcs_mechanisms: {
    type: String
  },
  num_acrb: {
    type: String
  },
  azith_pred_pheno: {
    type: String
  },
  cip_pred_pheno: {
    type: String
  },
  CipNS: {
    type: String
  },
  'dashboard view': {
    type: String
  },
  CipR: {
    type: String
  },
  cip: {
    type: String
  },
  cip_pheno_qrdr_gene: {
    type: String
  },
  dcs_category: {
    type: String
  },
  REFERENCE: {
    type: String
  },
  'MLST ST (EnteroBase)': {
    type: String
  },
  'MLST PROFILE (EnteroBase)': {
    type: String
  },
  'GENOTYPHI SNPs CALLED': {
    type: String
  },
  'Inc Types': {
    type: String
  },
  h58_genotypes: {
    type: String
  },
  GENOTYPE_SIMPLE: {
    type: String
  },
  GENOTYPE: {
    type: String
  },
  ampC: {
    type: String
  },
  'blaCTX-M-12': {
    type: String
  },
  'blaCTX-M-15_23': {
    type: String
  },
  'blaCTX-M-55': {
    type: String
  },
  'blaOXA-1': {
    type: String
  },
  'blaOXA-7': {
    type: String
  },
  'blaOXA134_2': {
    type: String
  },
  'blaSHV-12': {
    type: String
  },
  'blaTEM-1D': {
    type: String
  },
  catA1: {
    type: String
  },
  cmlA: {
    type: String
  },
  qnrB: {
    type: String
  },
  qnrS: {
    type: String
  },
  qnrD: {
    type: String
  },
  sul1: {
    type: String
  },
  sul2: {
    type: String
  },
  dfrA1: {
    type: String
  },
  dfrA14: {
    type: String
  },
  dfrA15: {
    type: String
  },
  dfrA17: {
    type: String
  },
  dfrA18: {
    type: String
  },
  dfrA5: {
    type: String
  },
  dfrA7: {
    type: String
  },
  'tetA(A)': {
    type: String
  },
  'tetA(B)': {
    type: String
  },
  'tetA(C)': {
    type: String
  },
  'tetA(D)': {
    type: String
  },
  ereA: {
    type: String
  },
  num_amr_genes: {
    type: String
  },
  dfra_any: {
    type: String
  },
  sul_any: {
    type: String
  },
  co_trim: {
    type: String
  },
  MDR: {
    type: String
  },
  XDR: {
    type: String
  },
  ESBL_category: {
    type: String
  },
  chloramphenicol_category: {
    type: String
  },
  tetracycline_category: {
    type: String
  },
  amr_category: {
    type: String
  },
  'Genome ID': {
    type: String
  },
  Version: {
    type: String
  },
  'Organism Name': {
    type: String
  },
  'Organism ID': {
    type: String
  },
  'Species Name': {
    type: String
  },
  'Species ID': {
    type: String
  },
  'Genus Name': {
    type: String
  },
  'Genus ID': {
    type: String
  },
  'Reference ID': {
    type: String
  },
  'Matching Hashes': {
    type: String
  },
  'p-Value': {
    type: String
  },
  'Mash Distance': {
    type: String
  }
});

const CombinedModel = mongoose.model('CombinedModel', CombinedSchema);

export default CombinedModel;
