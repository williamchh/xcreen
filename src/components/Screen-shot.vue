<template>
    <div>
      <div ref="captureArea">
        <!-- Your entire app or the part you want to capture goes here -->
        <h1>{{ title }}</h1>
        <p>{{ content }}</p>
        <!-- Add more elements as needed -->
      </div>
      <button @click="captureImage">Capture as Image</button>
      <button @click="captureEntirePage">Capture Entire Page</button>
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
    const htmlResponse = await chrome.runtime.sendMessage({ type: 'CAPTURE_ENTIRE_PAGE' })

    if (!htmlResponse) {
      console.error('No image response');
      return;
    }
    console.log(htmlResponse);
    // const canvas = await html2canvas(htmlResponse, {
    //   scrollX: 0,
    //   scrollY: 0,
    //   windowWidth: document.documentElement.scrollWidth,
    //   windowHeight: document.documentElement.scrollHeight,
    //   x: 0,
    //   y: 0,
    //   width: document.documentElement.scrollWidth,
    //   height: document.documentElement.scrollHeight,
    // });
    
};

</script>