// import { postFormData, postJSON } from "../services/api";

// const extractEndpoints = {
//     id_card: "/api/idcard/extract",
//     passport: "/api/passport/extract",
//     bank: "/api/bank/extract",
//     resume: "/api/resume/extract",
//     diploma: "/api/diploma/extract",
// };

// const exportEndpoints = {
//     id_card: "/api/idcard/export",
//     passport: "/api/passport/export",
//     bank: "/api/bank/export",
//     resume: "/api/resume/export",
//     diploma: "/api/diploma/export",
// };

// export const extractDocuments = async (docType, files) => {
//     if (!extractEndpoints[docType]) {
//         throw new Error("Unsupported document type for extraction");
//     }

//     const formData = new FormData();
//     files.forEach((file) => formData.append("files", file));
//     return await postFormData(extractEndpoints[docType], formData);
// };

// export const exportDocuments = async (docType, documents, format = "pdf") => {
//     if (!exportEndpoints[docType]) {
//         throw new Error("Unsupported document type for export");
//     }

//     return await postJSON(exportEndpoints[docType], { documents }, format);
// };

const PARSE_ENDPOINT = "/parse-document/";
import { postFormData } from "../services/api";

export const extractDocuments = async (docType, files) => {
  if (!docType) {
    throw new Error("Il faut préciser le type de document (idcard, passport, bank, resume ou diploma).");
  }

  if (!files || files.length === 0) {
    throw new Error("Aucun fichier n’a été fourni.");
  }

  const formData = new FormData();
  formData.append("doc_type", docType);

  for (let file of files) {
    formData.append("files", file);
  }

  return await postFormData(PARSE_ENDPOINT, formData);
};
