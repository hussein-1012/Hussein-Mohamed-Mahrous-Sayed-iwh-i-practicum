const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
require('dotenv').config();

// إعدادات الـ Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Private App Token
const PRIVATE_APP_ACCESS = process.env.HUBSPOT_API_KEY;
const OBJECT_ID = '2-195413524';

// 🏠 ROUTE 1 - Homepage: عرض كل Custom Objects
app.get('/', async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_ID}?properties=name&properties=type&properties=avg_price`;

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(url, { headers });
    const data = response.data.results.map(obj => ({
      id: obj.id,
      name: obj.properties.name,
      type: obj.properties.type,
      avg_price: obj.properties.avg_price
    }));

    res.render('homepage', {
      title: 'My Custom Objects | HubSpot',
      data
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error fetching data');
  }
});

// 📝 ROUTE 2 - صفحة الفورم لإضافة Custom Object
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Add Custom Object | HubSpot'
  });
});

// 🚀 ROUTE 3 - POST لإنشاء أو تحديث Custom Object
app.post('/update-cobj', async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_ID}`;
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };

  const newObj = {
    properties: {
      name: req.body.name,
      type: req.body.type === 'true', // تحويل Boolean لو Property من نوع Boolean
      avg_price: req.body.avg_price
    }
  };

  try {
    await axios.post(url, newObj, { headers });
    res.redirect('/');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error adding new record');
  }
});

// 🚀 تشغيل السيرفر
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
