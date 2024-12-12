const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cookieParser());

// Tu App ID y App Secret de Facebook
const CLIENT_ID = "946925657498844";
const CLIENT_SECRET = "946925657498844";

app.get("/oauth/facebook", (req, res) => {
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });

  let url = "https://www.facebook.com/v15.0/dialog/oauth?";
  url += `client_id=${CLIENT_ID}`;
  url += `&redirect_uri=https://app.edwsystem.com/auth/facebook/callback`;
  url += `&scope=public_profile,instagram_basic`;
  url += `&state=${csrfState}`;

  res.redirect(url);
});

app.get("/auth/facebook/callback", async (req, res) => {
  const { code, state } = req.query;
  const csrfState = req.cookies.csrfState;

  if (state !== csrfState) {
    return res.status(403).json({ error: "Estado no válido" });
  }

  if (!code) {
    return res.status(400).json({ error: "Falta el código de autorización." });
  }

  try {
    const response = await axios.get("https://graph.facebook.com/v15.0/oauth/access_token", {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: "https://app.edwsystem.com/auth/facebook/callback",
        code,
      },
    });

    const { access_token } = response.data;
    res.json({ accessToken: access_token });
  } catch (error) {
    console.error("Error al obtener el token:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/user/facebook/info", async (req, res) => {
  const { accessToken } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: "Falta el token de acceso." });
  }

  try {
    const response = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,followers_count",
        access_token: accessToken,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/user/instagram/info", async (req, res) => {
  const { accessToken } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: "Falta el token de acceso." });
  }

  try {
    const response = await axios.get("https://graph.instagram.com/me", {
      params: {
        fields: "id,username,media_count,followers_count,media",
        access_token: accessToken,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
