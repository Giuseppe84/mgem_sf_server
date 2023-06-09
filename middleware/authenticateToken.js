const jwt = require('jsonwebtoken');
require('dotenv').config();


function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token di autenticazione mancante.' });
  }
console.log(authHeader)
  const token = authHeader.split(' ')[1]; // Rimuovi il prefisso "Bearer" dal token


  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err)
      return res.status(403).json({ message: 'Token di autenticazione non valido.' });
    }

    req.user = user; // Aggiungi le informazioni dell'utente al oggetto `req` per usarle nelle successive rotte
    next();
  });
}
module.exports = authenticateToken;