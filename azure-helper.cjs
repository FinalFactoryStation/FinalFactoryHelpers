const crypto = require('crypto').webcrypto;
const fs = require('fs');
const { BlobServiceClient } = require('@azure/storage-blob');
const {BLOB_ACCOUNT_NAME, BLOB_CONTAINER_NAME, AZURE_STORAGE_ACCOUNT_KEY, SITE_URL} = require("./bot-config.cjs");


const OPTIONS_TEXT_JAVASCRIPT = {blobHTTPHeaders:{blobContentType:"text/javascript"}};
const OPTIONS_TEXT_HTML = {blobHTTPHeaders:{blobContentType:"text/html"}};

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${BLOB_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`;
const containerUrl = `https://${BLOB_ACCOUNT_NAME}.blob.core.windows.net/${BLOB_CONTAINER_NAME}`;


const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

async function createHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

async function makeJsonPUpload(blueprintString) {
    const filename = (await createHash(blueprintString)) + '.jsonp';
    const content = `readBlueprint({redirect: window.location.replace(${SITE_URL}'?bp=${encodeURIComponent(blueprintString)}')});`;
    return { filename, content, options: OPTIONS_TEXT_JAVASCRIPT }
}

async function makeHtmlRedirectUpload(blueprintString) {
    const filename = (await createHash(blueprintString)) + '.html';
    const content = `<meta http-equiv="Refresh" content="0; url='${SITE_URL}?bp=${encodeURIComponent(blueprintString)}'" />`;
    return { filename, content, options: OPTIONS_TEXT_HTML }
}

async function uploadBlueprint(blueprintString) {
    const upload = await makeHtmlRedirectUpload(blueprintString);
    const blockBlobClient = containerClient.getBlockBlobClient(upload.filename);
    const fileContent = Buffer.from(upload.content, 'utf-8');
    const uploadResponse = await blockBlobClient.uploadData(fileContent, upload.options);
    return `${containerUrl}/${upload.filename}`;
}

module.exports = { uploadBlueprint, createHash };
