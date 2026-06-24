import { readFileSync, writeFileSync } from "node:fs";

function pngSize(data) {
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
}

function writeIco(pngPaths, outPath) {
  const images = pngPaths.map((path) => {
    const data = readFileSync(path);
    const { width, height } = pngSize(data);
    return { width, height, data };
  });

  let offset = 6 + 16 * images.length;
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  images.forEach((image, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(image.width >= 256 ? 0 : image.width, entryOffset);
    header.writeUInt8(image.height >= 256 ? 0 : image.height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(image.data.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += image.data.length;
  });

  writeFileSync(outPath, Buffer.concat([header, ...images.map((image) => image.data)]));
}

writeIco(["favicon-light-16.png", "favicon-light-32.png"], "favicon-light.ico");
writeIco(["favicon-dark-16.png", "favicon-dark-32.png"], "favicon-dark.ico");
writeFileSync("favicon.ico", readFileSync("favicon-dark.ico"));
