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
      </div>
    </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onUnmounted } from 'vue';

const title = ref('Capture Screen as Image');
const content = ref('Click the button below to capture the screen as an image');
const captureArea = ref(null);
let port: chrome.runtime.Port | null = null;

const $refs = {
  captureArea,
};

onMounted(() => {
  port = chrome.runtime.connect({ name: 'popup-connection '});

  portListeners();
});

onUnmounted(() => {
  if (port == null) return;
  port.disconnect();
});

const portListeners = () => {
  if (port == null) return;

  port.onMessage.addListener(message => {
    
    if (message.type === 'CAPTURE_RES') {
      const { image } = message;
      const link = document.createElement('a');
      link.href = image;
      link.download = 'screenshot.png';
      link.click();
    }
  })
}

const captureImage = async () => {

    if (port == null) { return; }
    port!.postMessage({ type: 'CAPTURE' });

};

const captureEntirePage = async () => {
  // await chrome.runtime.sendMessage({ type: 'ENTIRE_PAGE_HTML' });
  if (port == null) { return; }
  port!.postMessage({ type: 'ENTIRE_PAGE_HTML' });
};

</script>