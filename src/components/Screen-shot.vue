<template>
    <div>
      <div ref="captureArea">
        <!-- Your entire app or the part you want to capture goes here -->
        <h1>{{ title }}</h1>
        <p>{{ content }}</p>
        <!-- Add more elements as needed -->
      </div>
      <div style="display: flex; flex-direction: column; gap: .5em;">
        <button @click="captureImage">Capture as Image</button>
        <button @click="captureEntirePage">Capture Entire Page</button>
        <button @click="scrollCapture">Scroll Capture</button>
      </div>
    </div>
</template>

<script lang="ts" setup>

import html2canvas from 'html2canvas';
import { ref, onMounted } from 'vue';

const title = ref('Capture Screen as Image');
const content = ref('Click the button below to capture the screen as an image');
const captureArea = ref(null);

const $refs = {
  captureArea,
};

onMounted(() => {

});

const captureImage = async () => {

    const imageResponse = await chrome.runtime.sendMessage({ type: 'CAPTURE' })

    if (!imageResponse) {
      console.error('No image response');
      return;
    }
    const link = document.createElement('a');
    link.href = `${imageResponse}`;
    link.download = 'screenshot.png';
    link.click();

};

const captureEntirePage = async () => {
  await chrome.runtime.sendMessage({ type: 'ENTIRE_PAGE_HTML' })
};

const scrollCapture = async () => {
    const htmlResponse = await chrome.runtime.sendMessage({ type: 'SCROLL_CAPTURE' })

    if (!htmlResponse) {
      console.error('No image response');
      return;
    }

    const { html, pageHeight, pageWidth, pageLeftPadding } = htmlResponse;
    const outerHtml = html;
    const htmlEl = document.createElement('div');
    htmlEl.innerHTML = outerHtml;
    
    // Temporarily append htmlEl to the document body
    document.body.appendChild(htmlEl);
    
    html2canvas(htmlEl, {
      scrollX: 0,
      scrollY: 0,
      windowWidth: pageWidth + pageLeftPadding,
      windowHeight: pageHeight,
      x: 0,
      y: 0,
      width: document.documentElement.scrollWidth,
      height: pageHeight,
    }).then(canvas => {
        // Do something with the canvas
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'screenshot.png';
        link.click();
    
        // Remove htmlEl from the document body
        document.body.removeChild(htmlEl);
    })
    .catch(err => {
      console.error(err);
    });    
};

</script>