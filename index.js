/**
 ЗАДАЧА
 Написать сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
   GET /file.ext
   - выдаёт файл file.ext из директории files,

   POST /file.ext
   - если нет директории files то создает ее
   - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
   - если файл уже есть, то выдаёт ошибку 409
   - при превышении файлом размера 1MB выдаёт ошибку 413


   DELETE /file
   - удаляет файл
   - выводит 200 OK
   - если файла нет, то ошибка 404

   загрузка файлов на сервер по ссылке
    POST /link
   - передаем ссылку(любая картинка в интернете) и имя файла.
   - обработать ошибки: Oтсутсвие имени файла из запроса, либо самого файла по ссылке;
   - выводит 200 OK

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

- Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)

- При желании можно использовать Index.html для тестов
*/

const bodyParser = require('body-parser');
const config = require('./config');
const express = require('express');

const app = express();
const port = config.applicationPort;

const checkFilesFolder = require('./middleware/checkFilesFolder');
const validateFileName = require('./middleware/validateFileName');

const FileHandler = require('./controllers/fileHandler');

//Middleware
app.use(bodyParser.json());
app.use(checkFilesFolder);

//Routes
app.post('/file', async function(req, res, next) {
  const fileHandler = new FileHandler(req.fileDirectory, config.maxFileSize * 1024 * 1024);
  try {
    await fileHandler.upload(req);
    res.send({ status: 'Ok' });
  } catch(e) {
    const errorMessage = JSON.parse(e.message);
    res.status(errorMessage.status).send({ error: errorMessage.error })
  }
});

app.get('/file/:fileName', validateFileName, function(req, res, next) {
  const fileHandler = new FileHandler(req.fileDirectory);
  let file = fileHandler.getFilePath(req.params.fileName);
  res.download(file);
});

app.delete('/file/:fileName', validateFileName, async function(req, res, next) {
  const fileHandler = new FileHandler(req.fileDirectory);
  try {
    await fileHandler.deleteFile(req.params.fileName);
    res.send({ status: 'Ok' });
  } catch(e) {
    res.status(500).send({ error: e.message });
  }
});

app.post('/link', validateFileName, async function(req, res, next) {
  const fileHandler = new FileHandler(req.fileDirectory, config.maxFileSize * 1024 * 1024);
  try {
    await fileHandler.uploadLink(req.body.fileName, req.body.fileLink);
    res.send({ status: 'Ok' });
  } catch(e) {
    const errorMessage = JSON.parse(e);
    return res.status(errorMessage.status).send({ error: errorMessage.error });
  }
});

//Server starting
app.listen(port, () => {
  console.log('Application started at port: ', port);
});
