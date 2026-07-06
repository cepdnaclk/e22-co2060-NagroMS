const express = require('express');
const router = express.Router();
const https = require('https');

router.get('/current', (req, res) => {
  let { city } = req.query;
  if (!city) city = 'Colombo';

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('OpenWeather API Error: Missing API Key');
    return res.status(200).json({ success: false, message: "Unable to load weather right now." });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},LK&appid=${apiKey}&units=metric`;

  https.get(url, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);

        if (parsedData.cod !== 200) {
          console.error('OpenWeather API Error:', parsedData);
          return res.status(200).json({ success: false, message: "Unable to load weather right now." });
        }

        const result = {
          success: true,
          city: parsedData.name,
          country: parsedData.sys.country,
          temperature: parsedData.main.temp,
          feelsLike: parsedData.main.feels_like,
          humidity: parsedData.main.humidity,
          windSpeed: parsedData.wind.speed,
          condition: parsedData.weather[0].main,
          description: parsedData.weather[0].description,
          icon: parsedData.weather[0].icon
        };

        res.status(200).json(result);
      } catch (e) {
        console.error('OpenWeather API Error: JSON parse failed', e);
        res.status(200).json({ success: false, message: "Unable to load weather right now." });
      }
    });

  }).on('error', (err) => {
    console.error('OpenWeather API Error:', err);
    res.status(200).json({ success: false, message: "Unable to load weather right now." });
  });
});

module.exports = router;
