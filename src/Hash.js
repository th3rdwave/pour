// @flow

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const addFileToHash = (file, hash) =>
  new Promise((resolve, reject) => {
    const fileStream = new fs.ReadStream(file);
    fileStream.on('data', data => hash.update(data));
    fileStream.on('end', resolve);
    fileStream.on('error', reject);
  });

const sha1sum = async (
  folder: string,
  ignore: ?Set<string>
): Promise<string> => {
  const hash = crypto.createHash('sha1');
  const traverse = async node => {
    if (ignore && ignore.has(path.basename(node))) {
      return;
    }
    const stat = await fs.stat(node);
    if (stat.isDirectory()) {
      const files = await fs.readdir(node);
      for (const f of files) {
        await traverse(path.join(node, f));
      }
    } else if (stat.isFile()) {
      await addFileToHash(node, hash);
    } else {
      throw new Error('File type not supported');
    }
  };

  await traverse(folder);

  return hash.digest('hex');
};

module.exports = {
  sha1sum,
};
