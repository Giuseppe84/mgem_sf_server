
const express = require('express');
const router = express.Router();

const multer = require('multer');
const { Readable } = require('stream');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand ,GetObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const sharp = require('sharp');
require('dotenv').config();
// Configurazione delle credenziali AWS
const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});



const app = express();



router.get('/:fileName', async (req, res) => {
  const fileName = req.params.fileName;
  const bucketName = process.env.S3_BUCKET;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL prefirmato valido per 1 ora
console.log(signedUrl);
    res.redirect(signedUrl);
  } catch (error) {
    console.error('Errore durante la generazione del URL prefirmato:', error);
    res.status(500).json({ error: 'Si è verificato un errore durante la generazione del URL prefirmato.' });
  }
});


module.exports = router;