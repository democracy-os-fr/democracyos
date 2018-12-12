import startsWith from 'mout/string/startsWith'
import { isUri, isWebUri } from 'valid-url'

const uploadPath = '/uploads/'

const imageName = (pathOrName) => pathOrName.split('\\').pop().split('/').pop()

const equalsFileName = (val1, val2) => imageName(val1) === imageName(val2)

const buildUploadUrl = (filename) => window.location.origin + uploadPath + filename

const isLocalFile = (url) => startsWith(url, window.location.origin + uploadPath)

const checkFileType = (name, ext) => {
  return (new RegExp('(' + ext.join('|').replace(/\./g, '\\.') + ')$')).test(name)
}

const readFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    file.data = e.target.result
  }
  reader.readAsDataURL(file)
}

export default {
  imageName,
  equalsFileName,
  buildUploadUrl,
  isLocalFile,
  isUri,
  isWebUri,
  checkFileType,
  readFile
}
