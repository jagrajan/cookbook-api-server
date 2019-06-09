import imageDataURI from 'image-data-uri';
import uuid from 'uuid//v4';

export const createImage = async dataURL => {
  if (!dataURL) {
    return '';
  }
  const path = await imageDataURI
    .outputFile(dataURL, `${process.env.IMAGES_DIRECTORY}/${uuid()}`);
  return path;
}