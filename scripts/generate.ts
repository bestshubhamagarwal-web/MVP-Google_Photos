import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const isProcedural = args.includes('--procedural');
const scenes = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenes.json'), 'utf-8'));

async function generate() {
  console.log(`Starting generation... Procedural mode: ${isProcedural}`);
  const outputDir = path.join(__dirname, '../data/photos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate a dummy set to simulate 2500 images
  let count = 0;
  for (let i = 0; i < 1000; i++) {
    const scene = scenes[i % scenes.length];
    count++;
    const fileName = `img_${i.toString().padStart(4, '0')}_${scene.id}.jpg`;
    const filePath = path.join(outputDir, fileName);
    if (isProcedural) {
      // Create an SVG and save as dummy file
      const svg = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ccc"/><text x="50%" y="50%" font-size="20" text-anchor="middle" fill="#333">${scene.category} ${i}</text></svg>`;
      fs.writeFileSync(filePath, svg); // Saving SVG directly as jpg for mock
    } else {
      // AI image generation mock
      fs.writeFileSync(filePath, Buffer.from([]));
    }
  }
  console.log(`Generated ${count} images.`);
}

generate().catch(console.error);
