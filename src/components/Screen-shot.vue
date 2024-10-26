<template>
    <div>
      <div ref="captureArea">
      </div>
      <RadioButton @selectedType="selectedType" />
      <div style="display: flex; flex-direction: column; gap: .5em;">
        <button :disabled="entirePageDisabled" @click="captureImage">{{ capturesImage }}</button>
        <button :disabled="entirePageDisabled" @click="captureEntirePage">{{ captureWholePage }}</button>
        <button @click="selectElement">{{ selectAsElement }}</button>
        <button @click="selectAreaToImage">{{ selectArea }}</button>

        <FileUploader v-if="entirePageDisabled" 
          @files-selected="handleFileSelected" style="margin-top: 1rem;"/>
      </div>
    </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onUnmounted, computed } from 'vue';
import RadioButton from './radio-button.vue';
import { getLanguage } from '../libs/language';
import FileUploader from './file-uploader.vue';
import { createSVGByFile } from '../contentScript/generate-svg';

const capturesImage = ref('Capture Image');
const captureWholePage = ref('Capture Entire Page');
const selectAsElement = ref('Select Element');
const selectArea = ref('Select Area');
const captureArea = ref(null);
const mediaType = ref('png');
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

const entirePageDisabled = computed(() => {
  return mediaType.value === 'svg';
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
  mediaType.value = type;
};

const portListeners = () => {
  if (port == null) return;

  port.onMessage.addListener(message => {
    
    if (message.type === 'CAPTURE_RES') {
      const { image } = message;
      const link = document.createElement('a');
      link.href = image;
      link.download = `screenshot.${mediaType.value}`;
      link.click();
    }
  })
}

const captureImage = async () => {

    if (port == null) { return; }
    port!.postMessage({ type: 'CAPTURE', mediaType: mediaType.value });

    window.close();

};

const captureEntirePage = async () => {
  
  if (port == null) { return; }
  port!.postMessage({ type: 'ENTIRE_PAGE_HTML', mediaType: mediaType.value });
};

const selectElement = async () => {
  if (port == null) { return; }
  port!.postMessage({ type: 'SELECT_ELEMENT', mediaType: mediaType.value });
};

const selectAreaToImage = async () => {
  if (port == null) { return; }
  port!.postMessage({ type: 'SELECT_AREA', mediaType: mediaType.value });
};

const handleFileSelected = (files: File[]) => {
  if (port == null) { return; }
  if (mediaType.value === 'svg') {
    // @ts-ignore
    createSVGByFile(files);
    return;
  }
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

button:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}
</style>