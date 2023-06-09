const express = require('express');
const app = express();

// Importa il modulo delle route
const imageUploadRoutes = require('./routes/uploadImage');
const showImage = require('./routes/showImage');

// Configura le route
app.use('/upload_image', imageUploadRoutes);
app.use('/show', showImage);

// Avvio del server su una porta specifica
app.listen(3000, () => {
  console.log('Il server è in ascolto sulla porta 3000');
});