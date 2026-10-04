import fs from 'fs';
import path from 'path';

const scenes = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenes.json'), 'utf-8'));

async function seed() {
  console.log('Seeding metadata...');
  const outputDir = path.join(__dirname, '../data/photos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;
  for (let i = 0; i < 1000; i++) {
    const scene = scenes[i % scenes.length];
    count++;
    const fileName = `img_${i.toString().padStart(4, '0')}_${scene.id}.jpg`;
    const jsonFileName = `${fileName}.json`;
    
    const metadata = {
      title: fileName,
      description: scene.description,
      imageViews: 0,
      creationTime: {
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 8 * 365 * 24 * 3600),
        formatted: new Date().toISOString()
      },
      geoData: {
        latitude: 15.2993,
        longitude: 74.1240,
        altitude: 0.0,
        latitudeSpan: 0.0,
        longitudeSpan: 0.0
      },
      geoDataExif: {
        latitude: 15.2993,
        longitude: 74.1240,
        altitude: 0.0,
        latitudeSpan: 0.0,
        longitudeSpan: 0.0
      },
      url: `file://${fileName}`,
      category: scene.category,
      target: scene.target
    };
    
    fs.writeFileSync(path.join(outputDir, jsonFileName), JSON.stringify(metadata, null, 2));
  }
  console.log(`Seeded metadata for ${count} images.`);
}

seed().catch(console.error);
