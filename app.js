const express = require('express');
const app = express();
//const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
  res.send('<a href="/oauth">Conectar con TikTok</a>');
});

const CLIENT_KEY = 'sbaw3r1yc2xl0zk2p8' // this value can be found in app's developer portal

app.get('/oauth', (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    let url = 'https://www.tiktok.com/v2/auth/authorize/';

    // the following params need to be in `application/x-www-form-urlencoded` format.
    url += `?client_key=${CLIENT_KEY}`;
    url += '&scope=user.info.basic';
    url += '&response_type=code';
    url += '&redirect_uri=https://app.gruntt.co/';
    url += '&state=' + csrfState;

    res.redirect(url);
})
app.get('/autorizado', (req, res) => {
    res.send("Autorizado")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
