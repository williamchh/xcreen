import html2canvas from "html2canvas";

console.info('contentScript is running');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.message === 'contentEntirePage') {

    html2canvas(document.documentElement, {
        allowTaint : true,
        useCORS : true
      })
      .then((canvas) => {
        const dataUrl = canvas.toDataURL('image/png');

        // download the image
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'entire-page.png';
        a.click();  
 
      })
      .catch((error) => {
        console.error(error);
      });
  }


});
  
