const fs = require('fs');
const https = require('http');

const routesToFetch = {
  CBD: "24.7620,-28.7380;24.7620,-28.7450",
  Roodepan: "24.7200,-28.6650;24.7300,-28.6650",
  MonumentHeights: "24.7700,-28.7650;24.7700,-28.7750",
  Beaconsfield: "24.7700,-28.7550;24.7800,-28.7600"
};

const results = {};

let pending = Object.keys(routesToFetch).length;

for (const [name, coords] of Object.entries(routesToFetch)) {
  const url = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.routes && json.routes.length > 0) {
          results[name] = json.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
        }
      } catch (e) {
        console.error("Error parsing", name, e);
      }
      
      pending--;
      if (pending === 0) {
        fs.writeFileSync('routes.json', JSON.stringify(results, null, 2));
        console.log('Routes saved to routes.json');
      }
    });
  }).on('error', err => {
    console.error("Error fetching", name, err);
  });
}
