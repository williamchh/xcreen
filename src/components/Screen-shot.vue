<template>
    <div>
      <div ref="captureArea">
      </div>
      <RadioButton @selectedType="selectedType" />
      
      <progress-bar v-if="progressValue > 0" :uploadProgress="progressValue" style="margin-bottom: 1em;" />
      
      <language-dropdown 
        v-if="mediaType === 'txt'"
        @language-selected="languageSelected" /> 

      <div style="display: flex; flex-direction: column; gap: .5em;">
        <button :disabled="entirePageDisabled" @click="captureImage">{{ capturesImage }}</button>
        <button :disabled="entirePageDisabled" @click="captureEntirePage">{{ captureWholePage }}</button>
        <!-- <button @click="selectElement">{{ selectAsElement }}</button> -->
        <button @click="selectAreaToImage">{{ selectArea }}</button>

        <FileUploader v-if="entirePageDisabled" :type="mediaType"
          @files-selected="handleFileSelected" style="margin-top: 1rem;"/>
      </div>
    </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onUnmounted, computed } from 'vue';
import RadioButton from './radio-button.vue';
import { getLanguage } from '../libs/language';
import FileUploader from './file-uploader.vue';
import ProgressBar from './progress-bar.vue';
import languageDropdown from './language-dropdown.vue';
import { createSVGByFile } from '../contentScript/generate-svg';
import { extractTextFromFile, progressValue } from '../contentScript/extract-text-from-image';


const capturesImage = ref('Capture Image');
const captureWholePage = ref('Capture Entire Page');
const selectAsElement = ref('Select Element');
const selectArea = ref('Select Area');
const captureArea = ref(null);
const mediaType = ref('png');
const extraLanguage = ref('eng');
let port: chrome.runtime.Port | null = null;

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
  return ['svg', 'txt'].includes(mediaType.value);
});

const languageSelected = (lang: string) => {
  extraLanguage.value = lang;
};

const getLanguageData = () => {
  const browserLanguage = chrome.i18n.getUILanguage();
  const langData = getLanguage(browserLanguage);
  capturesImage.value = langData.capture_as_image;
  captureWholePage.value = langData.capture_entire_page;
  selectAsElement.value = langData.select_as_element;
  selectArea.value = langData.select_area;
}

const selectedType = (type: string) => {
  mediaType.value = '';

  setTimeout(() => {
    mediaType.value = type;
  }, 0);
};

const portListeners = () => {
  if (port == null) return;

  port.onMessage.addListener(message => {
    
    if (message.type === 'CAPTURE_RES') {
      const { image } = message;
      const link = document.createElement('a');
      link.href = image;
      link.download = `Xcreen.${mediaType.value}`;
      link.click();
    }
  })

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_TEXT_IMAGE') {
      const { data, mineType, fileName } = message;

      extractTextFromFile(data, extraLanguage.value);
    }
  });
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
  else if (mediaType.value === 'txt') {
    // @ts-ignore
    extractTextFromFile(files);

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