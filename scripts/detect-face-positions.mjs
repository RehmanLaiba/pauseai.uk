#!/usr/bin/env node
// Detects the largest face in each photo under public/images/people/ and
// writes a suggested `background-position` into the matching story's
// `imageStyle` in lib/data/stories.json (the .story-avatar /
// .story-detail-avatar square crop). Re-run after adding/replacing a story
// photo. Pass --dry-run to only print suggestions without writing.
import "@tensorflow/tfjs-backend-cpu";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// tfjs-node (native binding) crashes on this project's Node version, so we run
// on the plain CPU backend instead — slower, but fine for a handful of small
// images run manually. Prod mode silences its "install tfjs-node for speed" nag.
tf.enableProdMode();
await tf.setBackend("cpu");

async function decodeImage(filePath) {
  const { data, info } = await sharp(filePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return tf.tensor3d(data, [info.height, info.width, info.channels], "int32");
}

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const peopleDir = path.join(rootDir, "public/images/people");
const storiesJsonPath = path.join(rootDir, "lib/data/stories.json");

const args = process.argv.slice(2);
const write = !args.includes("--dry-run");
const files = args.filter((a) => a !== "--dry-run");
const targets = files.length > 0 ? files : readdirSync(peopleDir).filter((f) => /\.(jpe?g|png)$/i.test(f));

const stories = write ? JSON.parse(readFileSync(storiesJsonPath, "utf8")) : null;
let updated = 0;

const model = await blazeface.load();

for (const file of targets) {
  const filePath = path.isAbsolute(file) ? file : path.join(peopleDir, file);
  const imageTensor = await decodeImage(filePath);
  const [height, width] = imageTensor.shape;

  const predictions = await model.estimateFaces(imageTensor, false);
  imageTensor.dispose();

  if (predictions.length === 0) {
    console.log(`${path.basename(filePath)}: no face found (${width}x${height})`);
    continue;
  }

  // Largest face by bounding-box area, in case of multiple people.
  const largest = predictions.reduce((best, p) => {
    const area = (p.bottomRight[0] - p.topLeft[0]) * (p.bottomRight[1] - p.topLeft[1]);
    return area > best.area ? { p, area } : best;
  }, { p: null, area: -1 }).p;

  const cx = (largest.topLeft[0] + largest.bottomRight[0]) / 2;
  const cy = (largest.topLeft[1] + largest.bottomRight[1]) / 2;
  const px = Math.round((100 * cx) / width);
  const py = Math.round((100 * cy) / height);
  const imageStyle = `background-position: ${px}% ${py}%;`;

  if (write) {
    const basename = path.basename(filePath);
    const story = stories.find((s) => s.imageSrc && path.basename(s.imageSrc) === basename);
    if (!story) {
      console.log(`${basename}: ${width}x${height}, ${predictions.length} face(s) -> no matching story in stories.json, skipped`);
      continue;
    }
    story.imageStyle = imageStyle;
    updated++;
    console.log(`${basename}: ${width}x${height}, ${predictions.length} face(s) -> updated "${story.name}" imageStyle: "${imageStyle}"`);
  } else {
    console.log(`${path.basename(filePath)}: ${width}x${height}, ${predictions.length} face(s) -> imageStyle: "${imageStyle}"`);
  }
}

if (write && updated > 0) {
  writeFileSync(storiesJsonPath, JSON.stringify(stories, null, 2) + "\n");
  console.log(`\nWrote ${updated} update(s) to lib/data/stories.json`);
}
