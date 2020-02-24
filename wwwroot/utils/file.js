import dayjs from "/web_modules/dayjs.js"

/**
 * Converts File object containing image into DataURL string.
 * Coppied from https://hacks.mozilla.org/2012/02/saving-images-and-files-in-localstorage/
 * @param {File} file
 * @returns Promise<{ exif: object, dataURL: string }>
 */
export function imageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const loadingImg = loadImage(
      file,
      function(result, { exif }) {
        if (result.type === "error") {
          reject(result)
        } else {
          const exifData = exif.getAll()
          resolve({
            image: result,
            datetime: dayjs(
              exifData.DateTimeOriginal,
              "YYYY:MM:DD HH:mm:ss",
            ).toISOString(),
            id: createIdFromExif(exifData),
            gps: getExifGPS(exifData),
            filename: file.name,
          })
        }
      },
      { meta: true },
    )
    loadingImg.onerror = reject
  })
}

export function imgToCanvas(img) {
  const imgCanvas = document.createElement("canvas")
  const imgContext = imgCanvas.getContext("2d")

  // Make sure canvas is as big as the picture
  imgCanvas.width = img.width
  imgCanvas.height = img.height

  // Draw image into canvas element
  imgContext.drawImage(img, 0, 0, img.width, img.height)

  return imgCanvas
}

/**
 * Given dataUrl returns Image object
 * @param {string} dataUrl
 * @returns Image
 */
export function dataUrlToImage(dataUrl) {
  const imgUrl = URL.createObjectURL(dataUrl)
  const img = new Image()
  img.src = imgUrl
  URL.revokeObjectURL(imgURL)
  return img
}

function getExifGPS({
  GPSLatitude,
  GPSLatitudeRef,
  GPSLongitude,
  GPSLongitudeRef,
}) {
  return [
    { coordinate: GPSLatitude, hemisphere: GPSLatitudeRef },
    { coordinate: GPSLongitude, hemisphere: GPSLongitudeRef },
  ].map(({ coordinate, hemisphere }) => {
    const [degrees, minutes, seconds] = coordinate.split(",", 3).map(parseFloat)
    const sign = hemisphere == "W" || hemisphere == "S" ? -1 : 1
    return sign * (degrees + minutes / 60 + seconds / 3600)
  })
}

function createIdFromExif({ DateTimeOriginal, GPSImgDirection, GPSLongitude }) {
  return [DateTimeOriginal, GPSImgDirection, GPSLongitude].join("")
}