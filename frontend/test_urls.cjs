const https = require('https');

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Nashik_City_Centre_Mall.jpg/1024px-Nashik_City_Centre_Mall.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sula_Vineyards.jpg/1024px-Sula_Vineyards.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ramkund_Panchavati_Nashik.jpg/1024px-Ramkund_Panchavati_Nashik.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Nashik_Road_railway_station.jpg/1024px-Nashik_Road_railway_station.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Muktidham%2C_Nashik.jpg/1024px-Muktidham%2C_Nashik.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Canal_tower_of_Gangapur_Dam_India.jpg/1024px-Canal_tower_of_Gangapur_Dam_India.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Pandavleni-A_Picture-1.jpg/1024px-Pandavleni-A_Picture-1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/NashikViewfromPandavLeni.jpg/1024px-NashikViewfromPandavLeni.jpg'
];

async function check() {
  for (const url of urls) {
    https.get(url, (res) => {
      console.log(res.statusCode === 200 ? 'OK' : 'FAIL', url);
    }).on('error', (e) => {
      console.error('FAIL', url, e.message);
    });
  }
}
check();
