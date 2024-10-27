import { createWorker, ImageLike } from 'tesseract.js';

const extractTextFromFile = async (file: ImageLike) => {

  try {
    const worker = await createWorker("eng", 3, {
      workerBlobURL: false,
      corePath: '../tesseract/core',
      workerPath: '../tesseract/worker.min.js',
      cacheMethod: 'write',
      langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best'
    });
  
    const { data: { text } } = await worker.recognize(file);
  
    await worker.terminate();
  
    // create a and download the text file
    const link = document.createElement('a');
    const blob = new Blob([text], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted-text.txt';
    link.click();    
  }
  catch (error) {
    console.error('Failed to extract text from image', error);
  }
};


  export { extractTextFromFile };