var platform = require('os').platform();

module.exports = {
    osx: platform === 'darwin',
    win: platform === 'win32',
    linux: platform === 'linux'
};
