import fs from 'fs';
import path from 'path';
import { pipeline, env } from '@xenova/transformers';

// Disable remote models if needed, or allow downloading
env.allowLocalModels = false;
env.useBrowserCache = false;

const dataDir = path.join(__dirname, '../data');
const photosDir = path.join(dataDir, 'photos');
const indexFile = path.join(dataDir, 'index.json');
const anchorsFile = path.join(dataDir, 'anchors.json');
const embeddingsFile = path.join(dataDir, 'embeddings.json'); // Using JSON for simplicity instead of BIN

async function main() {
  console.log('Indexing photos...');
  const files = fs.readdirSync(photosDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const indexData: any[] = [];
  const anchors: any = { trips: [], festivals: [] };
  const embeddings: Record<string, number[]> = {};

  // Try to load a feature extractor for CLIP (text only for MVP metadata)
  let extractor;
  try {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  } catch (err) {
    console.error('Failed to load transformers pipeline:', err);
  }

  for (const file of jsonFiles) {
    const filePath = path.join(photosDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const data = JSON.parse(content);
      indexData.push({
        id: data.title,
        title: data.title,
        description: data.description,
        timestamp: data.creationTime.timestamp,
        formattedDate: data.creationTime.formatted,
        geoData: data.geoData,
        url: `/photos/${data.title}`,
        category: data.category,
        tags: [] // Placeholder for Gemini tagging
      });

      // Simple heuristic for anchors
      if (data.category === 'Travel' && anchors.trips.length < 5) {
        anchors.trips.push(data.title);
      }

      // Generate embedding from description/metadata if extractor is available
      if (extractor) {
        try {
          const textToEmbed = `${data.description} ${data.category}`;
          const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
          embeddings[data.title] = Array.from(output.data);
        } catch (err) {
          console.warn(`Could not generate embedding for ${data.title}`);
        }
      }
    } catch (e) {
      console.error(`Failed to parse ${file}`);
    }
  }

  // Sort by timestamp descending
  indexData.sort((a, b) => b.timestamp - a.timestamp);

  fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
  fs.writeFileSync(anchorsFile, JSON.stringify(anchors, null, 2));
  if (Object.keys(embeddings).length > 0) {
    fs.writeFileSync(embeddingsFile, JSON.stringify(embeddings, null, 2));
    console.log(`Generated embeddings to ${embeddingsFile}`);
  }

  console.log(`Indexed ${indexData.length} photos to ${indexFile}`);
  console.log(`Generated anchors to ${anchorsFile}`);
  
  // Note: CLIP Embeddings and Gemini Tagging would be added here
  console.log('Note: CLIP Embeddings and Gemini Tagging generation are placeholders in this MVP phase.');
}

main().catch(console.error);
