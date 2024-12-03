require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Rutas principales
app.get('/', (req, res) => {
  res.send('<a href="/auth/facebook">Conectar con Facebook</a>');
});

// URL de autenticación de Facebook
app.get('/auth/facebook', (req, res) => {
  const fbAuthUrl = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=pages_read_engagement,instagram_basic,instagram_manage_insights`;
  res.redirect(fbAuthUrl);
});

// Callback para manejar el token de acceso
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No se recibió el código de autorización');
  }

  try {
    // Intercambiar el código por un token de acceso
    const tokenResponse = await axios.get('https://graph.facebook.com/v15.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code,
      },
    });

    const { access_token } = tokenResponse.data;

    // Obtener métricas de ejemplo de Instagram
    const metricsResponse = await axios.get('https://graph.facebook.com/v15.0/me/accounts', {
      params: {
        access_token,
      },
    });

    res.json(metricsResponse.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error al obtener las métricas');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
