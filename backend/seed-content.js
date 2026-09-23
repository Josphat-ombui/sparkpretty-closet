import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from './models/Setting.js';
import CONTENT_REGISTRY from './data/content-registry.js';

dotenv.config();

const seedContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const entry of CONTENT_REGISTRY) {
      const existing = await Setting.findOne({ key: entry.key });
      const { value, ...metadata } = entry;
      if (existing) {
        // Preserve the customized value — only refresh metadata/defaults
        await Setting.findOneAndUpdate({ key: entry.key }, { $set: metadata });
        updated++;
      } else {
        await Setting.create({ value, ...metadata });
        created++;
      }
    }

    console.log(`Content seed complete: ${created} created, ${updated} refreshed (${CONTENT_REGISTRY.length} total fields)`);
    process.exit(0);
  } catch (err) {
    console.error('Content seed failed:', err);
    process.exit(1);
  }
};

seedContent();