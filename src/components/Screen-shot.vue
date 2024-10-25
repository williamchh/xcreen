<template>
    <div>
      <div ref="captureArea">
      </div>
      <RadioButton @selectedType="selectedType" />
      <div style="display: flex; flex-direction: column; gap: .5em;">
        <button @click="captureImage">{{ capturesImage }}</button>
        <button @click="captureEntirePage">{{ captureWholePage }}</button>
        <button @click="selectElement">{{ selectAsElement }}</button>
        <button @click="selectAreaToImage">{{ selectArea }}</button>
      </div>
    </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onUnmounted } from 'vue';
import RadioButton from './radio-button.vue';
import { getLanguage } from '../libs/language';

const capturesImage = ref('Capture Image');
const captureWholePage = ref('Capture Entire Page');
const selectAsElement = ref('Select Element');
const selectArea = ref('Select Area');
const captureArea = ref(null);
let port: chrome.runtime.Port | null = null;

const $refs = {
  captureArea,
};

onMounted(() => {
  port = chrome.runtime.connect({ name: 'popup-connection '});
  getLanguageData();
  portListeners();
});

onUnmounted(() => {
  if (port == null) return;
  port.disconnect();
});

const getLanguageData = () => {
  const browserLanguage = chrome.i18n.getUILanguage();
  const langData = getLanguage(browserLanguage);
  capturesImage.value = langData.capture_as_image;
  captureWholePage.value = langData.capture_entire_page;
  selectAsElement.value = langData.select_as_element;
  selectArea.value = langData.select_area;
}

const selectedType = (type: string) => {
  console.log(type);
};

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
getLanguageData();
return;
    if (port == null) { return; }
    port!.postMessage({ type: 'CAPTURE' });

    window.close();

};

const captureEntirePage = async () => {
  // await chrome.runtime.sendMessage({ type: 'ENTIRE_PAGE_HTML' });
  if (port == null) { return; }
  port!.postMessage({ type: 'ENTIRE_PAGE_HTML' });
};

const selectElement = async () => {
  if (port == null) { return; }
  port!.postMessage({ type: 'SELECT_ELEMENT' });
};

const selectElementToSvg = async () => {
  if (port == null) { return; }
  port!.postMessage({ type: 'SELECT_ELEMENT_SVG' });
};

const selectAreaToImage = async () => {
  if (port == null) { return; }
  port!.postMessage({ type: 'SELECT_AREA' });
};

</script>

<style scoped>

button {
  padding: .5em 1em;
  border: none;
  border-radius: 1em;
  background-color: #42b983;
  color: white;
  cursor: pointer;
}
</style>