const Busboy = require('busboy');
const fs = require('fs');
const https = require('https');

module.exports = class FileHandler {
  constructor(filesFolder, maxFileSize= null) {
    this.filesFolder = filesFolder;
    this.maxFileSize = maxFileSize;
    this.fileName = null;
  }

  async _parseFile(req) {
    return new Promise((resolve, reject) => {
      const self = this;

      const busboy = new Busboy({ headers: req.headers, limits: { fileSize: this.maxFileSize } });

      busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        if (fs.existsSync(self.filesFolder + filename)) reject('File already exist');
        self.fileName = filename;

        file.on('limit', function() {
          fs.unlink(self.filesFolder + self.fileName, () => {
            self.fileName = null;
            reject('File limit');
          });
        });

        file.on('data', function(data) {

        });

        file.pipe(fs.createWriteStream(self.filesFolder + self.fileName))

        // fileStream = file;
      });

      busboy.on('finish', () => {
        resolve(0);
      });

      req.pipe(busboy);
    });
  }

  async upload(req) {
    try {
      await this._parseFile(req);
      return 0;
    } catch (e) {
      if (e === 'File already exist') 
      {
        throw new Error(
          JSON.stringify({
            status: 409, 
            error: 'File already exist',
          })
        );
      }
      throw new Error(
        JSON.stringify({
          status: 413, 
          error: 'File too large',
        })
      );
    }
  }

  getFilePath(fileName) {
    return this.filesFolder + fileName;
  }

  async deleteFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.unlink(this.filesFolder + fileName, (err) => {
        if (err) return reject('Service temporary unavailable');
        return resolve(0);
      });
    });
  }

  async uploadLink(fileName, fileLink) {
    const self = this;
    return new Promise((resolve, reject) => {
      https.get(fileLink, function(response) {
        if (response.statusCode >= 400) {
          return reject(
            JSON.stringify({ status: 400, error: 'Link is invalid' })
          );
        }
        if (response.headers['content-length'] > self.maxFileSize) {
          return reject(
            JSON.stringify({ status: 400, error: 'File too large' })
          );
        }
        const filePath = self.filesFolder + fileName;
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        resolve(0);
      });
    })
  }

}
