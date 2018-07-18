import startsWith from 'mout/string/startsWith'

const uploadPath = '/uploads/'

const imageName = (pathOrName) => pathOrName.split('\\').pop().split('/').pop()

const equalsFileName = (val1, val2) => imageName(val1) === imageName(val2)

const buildUploadUrl = (filename) => window.location.origin + uploadPath + filename

const isLocalFile = (url) => startsWith(url, window.location.origin + uploadPath)

export default {
  imageName,
  equalsFileName,
  buildUploadUrl,
  isLocalFile
}
