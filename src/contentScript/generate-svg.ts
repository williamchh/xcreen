import { Potrace } from '../libs/potrace';

export async function downloadSvgFromCanvas(canvas: HTMLCanvasElement) {
    
  const file = await getFileFromCanvas(canvas);
 
  createSVGByFile(file);
}

 export async function getFileFromCanvas(canvas: HTMLCanvasElement) {
  // Convert canvas to blob directly instead of going through data URL
  const canvasBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });

  // Create a proper File object that matches what you'd get from a file input
  const file = new File([canvasBlob], 'element.png', { 
    type: 'image/png',
    lastModified: Date.now()
  });

  return file;
 }

 export function createSVGByFile(file: File) {
    Potrace.loadImageFromFile(file);
    Potrace.process(function() {
      const svg = Potrace.getSVG(1);
  
      // download the image
      const a = document.createElement('a');
      a.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
      a.download = 'element.svg';
      a.click();
    });
 } 