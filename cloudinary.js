const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const walkSync = (dir, fileList = [], rootDir = '') => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      // eslint-disable-next-line
      fileList = walkSync(dir + '/' + file, fileList, rootDir);
    } else {
      fileList.push(`${dir}/${file}`.replace(rootDir, ''));
    }
  });
  return fileList;
};

const rootDir = path.resolve(path.join(__dirname, 'dist', 'build'));


const cdnFiles = walkSync(rootDir, [], rootDir);
cdnFiles.forEach((file) => {
  cloudinary.uploader.upload(path.resolve(path.join(rootDir, file)), {
    public_id: file
      .replace(/^\//, '')
      .split('.')
      .slice(0, -1)
      .join('.'),
    version: 'v1',
    use_filename: true,
    overwrite: true,
    resource_type: 'raw',
  }, (error, res) => {
    if (error) {
      // eslint-disable-next-line
      console.log(error);
    } else {
      // eslint-disable-next-line
      console.log(res);
    }
  });
});
