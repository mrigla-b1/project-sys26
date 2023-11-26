const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();


mongoose.connect('mongodb://127.0.0.1:27017/sys-project')
  .then(() => console.log('Connecté à MongoDB...'))
  .catch(err => console.error('Impossible de se connecter à MongoDB...', err));


  // Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
    email: String,
    login: String,
    password: String
  });
  
  // Modèle Mongoose pour les utilisateurs
  const User = mongoose.model('User', userSchema, 'login');
  
  // Middleware pour body-parser
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Middleware pour servir des fichiers statiques
  app.use(express.static('public'));
  

// Middleware pour servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route pour la page de connexion (login)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route pour la page d'inscription (signin)
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signup.html'));
});

app.post('/signup', async (req, res) => {
    try {
      const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
  
      let newUser = new User({
        email: req.body.email,
        login: req.body.login,
        password: hash
      });

     
        const { email, login, password, repeatPassword } = req.body;

        // Vérifier si le login existe déjà
        const userExists = await User.findOne({ login: login });
        if (userExists) {
            return res.status(400).send({ message: 'Le login est déjà utilisé.' });
        }
      await newUser.save();
     
      res.redirect('/login');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement :', error);
      res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur');
    }
  });

  app.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        // Chercher l'utilisateur par le login
        const user = await User.findOne({ login: login });
        if (!user) {
            // Si l'utilisateur n'existe pas
            return res.status(401).send('Identifiants incorrects');
        }

        // Comparer le mot de passe (dans cet exemple, on compare le hash directement)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedPassword) {
            // Si les mots de passe ne correspondent pas
            return res.status(401).send('Identifiants incorrects');
        }

        // Si les identifiants sont corrects
        // Ici, vous pouvez gérer la session ou le token d'authentification
        res.send('Connexion réussie');

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).send('Erreur lors de la connexion');
    }
});

app.get('/profil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/profil.html'));
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
