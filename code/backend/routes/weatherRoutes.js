const express = require('express');
const router = express.Router();
const https = require('https');

router.get('/current', (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'OpenWeather API key is not configured' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  https.get(url, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);

        if (parsedData.cod !== 200) {
          return res.status(parsedData.cod || 500).json({ success: false, message: parsedData.message || 'Failed to fetch weather' });
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
        res.status(500).json({ success: false, message: 'Error parsing weather data' });
      }
    });

  }).on('error', (err) => {
    res.status(500).json({ success: false, message: 'Network error fetching weather' });
  });
});

module.exports = router;
