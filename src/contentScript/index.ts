import html2canvas from "html2canvas";

console.info('contentScript is running');

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if (request.message === 'contentEntirePage') {

    try {
      const canvas = await html2canvas(document.documentElement, {
        allowTaint : true,
        useCORS : true
      });

      printFromCanvas(canvas);  
    } catch (error) {

      try {
        const cv = await html2canvas(document.documentElement, {
          allowTaint : false ,
          useCORS : true
        });

        printFromCanvas(cv);        
      }
      catch (error) {
        console.error(error);
      }
    }
  }
});
  
function printFromCanvas(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png');

  // download the image
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'entire-page.png';
  a.click();
}

