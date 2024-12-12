const express = require("express");
const app = express();
//const fetch = require('node-fetch');
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.send('<a href="/oauth">Conectar con TikTok</a>');
});

const CLIENT_KEY = "sbaw3r1yc2xl0zk2p8"; // this value can be found in app's developer portal

app.get("/oauth", (req, res) => {
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });

  let url = "https://www.tiktok.com/v2/auth/authorize/";

  // the following params need to be in `application/x-www-form-urlencoded` format.
  url += `?client_key=${CLIENT_KEY}`;
  url += "&scope=user.info.basic";
  url += "&response_type=code";
  url += "&redirect_uri=https://app.edwsystem.com/auth/tiktok/callback";
  url += "&state=" + csrfState;

  res.redirect(url);
});


app.get("/auth/tiktok/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Falta el código de autorización." });
  }

  try {
    // Paso 2: Intercambiar el código por un token de acceso
    const response = await axios.post(
      "https://open.tiktokapis.com/v1/oauth/token",
      {
        client_key: process.env.CLIENT_KEY, // Reemplaza con tu Client Key
        client_secret: process.env.CLIENT_SECRET, // Reemplaza con tu Client Secret
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI,
      }
    );

    const { access_token, refresh_token, expires_in } = response.data.data;

    // Guardar tokens en la base de datos o devolverlos al cliente
    res.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get('/user/info', async (req, res) => {
  const { accessToken } = req.query;

  if (!accessToken) {
      return res.status(400).json({ error: 'Falta el token de acceso.' });
  }

  try {
      const response = await axios.get('https://open.tiktokapis.com/v1/user/info/', {
          headers: {
              Authorization: `Bearer ${accessToken}`,
          },
      });

      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: error.response?.data || error.message });
  }
});


app.get("/autorizado", (req, res) => {
  res.send("Autorizado");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
