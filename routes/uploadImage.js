
const express = require('express');
const router = express.Router();

const multer = require('multer');

const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand ,GetObjectCommand} = require('@aws-sdk/client-s3');

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
const maxSizeInBytes = 5 * 1024 * 1024; // Dimensione massima di 5 MB (5 * 1024 * 1024 byte)
const maxWidth = 1024; // Larghezza massima consentita
const maxHeight = 1024; // Altezza massima consentita

const generateUniqueFileName= (originalFileName) =>{
  const timestamp = Date.now();
  const uniqueId = uuidv4();
  const extension = originalFileName.split('.').pop();
  return `${timestamp}_${uniqueId}.${extension}`;
}
// Configurazione Multer
const storage = multer.memoryStorage(); // Memorizza l'immagine in memoria come buffer
const upload = multer({ storage: storage ,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite di 5 MB (5 * 1024 * 1024 byte)
  }});

const app = express();

// Route per l'endpoint di upload
router.post('/', upload.single('image'), async (req, res) => {
  
 
  const file = req.file; // Contiene i dettagli dell'immagine caricata

  // Verifica se l'immagine è stata caricata correttamente
  if (!file) {
    res.status(400).send('Nessuna immagine caricata.');
    return;
  }
    // Utilizza sharp per ottenere le dimensioni dell'immagine
    const metadata = await sharp(file.buffer).metadata();
    const { width, height } = metadata;


  // Verifica se l'immagine supera le dimensioni massime consentite
  if (width > maxWidth || height > maxHeight || file.size > maxSizeInBytes) {
    try {
      // Ridimensiona l'immagine solo se supera le dimensioni massime
      const resizedImageBuffer = await sharp(file.buffer)
     
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      // Sovrascrivi il buffer originale con l'immagine ridimensionata
      file.buffer = resizedImageBuffer;
    } catch (error) {
      console.error('Errore durante il ridimensionamento dell\'immagine:', error);
      res.status(500).json({ error: 'Si è verificato un errore durante il ridimensionamento dell\'immagine.' });
      return;
    }
  }

  const fileName = generateUniqueFileName(file.originalname);

  // Configurazione dei parametri per l'upload su S3
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
  // Esecuzione del comando di caricamento su S3
  const command = new PutObjectCommand(params);

    const response = await s3Client.send(command);
    console.log('Immagine caricata su S3 con successo.', response);
    const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${fileName}`;

    res.json({...response,fileName,imageUrl});
  } catch (error) {
    console.error('Errore durante il caricamento dell\'immagine su S3:', error);
    res.status(500).send('Si è verificato un errore durante il caricamento dell\'immagine su S3.');
  }
});



module.exports = router;