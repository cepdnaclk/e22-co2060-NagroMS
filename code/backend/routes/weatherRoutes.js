const express = require('express');
const router = express.Router();
const https = require('https');

const fetchWeather = (city, apiKey) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},LK&appid=${apiKey}&units=metric`;
    
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

router.get('/current', async (req, res) => {
  let { city } = req.query;
  let fallbackUsed = false;
  if (!city) {
    city = 'Colombo';
    fallbackUsed = true;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('OpenWeather API Error: Missing API Key');
    return res.status(200).json({ success: false, message: "Unable to load weather right now." });
  }

  try {
    let parsedData = await fetchWeather(city, apiKey);

    // If city is not found or invalid, fallback to Colombo
    if (parsedData.cod !== 200 && city.toLowerCase() !== 'colombo') {
      console.warn(`City '${city}' not found by OpenWeather. Falling back to Colombo.`);
      parsedData = await fetchWeather('Colombo', apiKey);
      fallbackUsed = true;
    }

    if (parsedData.cod !== 200) {
      console.error('OpenWeather API Error (Even after fallback):', parsedData);
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
      icon: parsedData.weather[0].icon,
      fallbackUsed
    };

    res.status(200).json(result);
  } catch (err) {
    console.error('OpenWeather API Fetch Error:', err);
    res.status(200).json({ success: false, message: "Unable to load weather right now." });
  }
});

module.exports = router;
