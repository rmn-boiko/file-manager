module.exports = {
    applicationPort: process.env.APPLICATION_PORT || 3000,
    filesDirectory:  process.env.FILES_DIRECTORY || '/files',
    maxFileSize: process.env.MAX_FILE_SIZE_MB || 1,
}
