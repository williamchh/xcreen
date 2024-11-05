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
        <button :disabled="entirePageDisabled" @click="captureEntirePage2">{{ captureWholePage2 }}</button>
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
import { PortManager } from '../models/port-manager';

const props = defineProps<{
  showTxtSelection: boolean;
}>();

const capturesImage = ref('Capture Image');
const captureWholePage = ref('Capture Entire Page');
const captureWholePage2 = ref('Capture Entire Page2');
const selectArea = ref('Select Area');
const useSidePanel = ref('Use Side Panel');
const captureArea = ref(null);
const mediaType = ref('png');
const extraLanguage = ref('eng');
let portManager: PortManager | null = null;
let bgPortManager: PortManager | null = null;

onMounted(() => {
  
  setTimeout(() => {
    setupPortManagers();
  }, 1000);
  
  getLanguageData();

  chrome.storage.sync.get('mediaType', (data) => {
    mediaType.value = data.mediaType || 'png';
  });

  chrome.storage.sync.get('language', (data) => {
    extraLanguage.value = data.language || 'eng';
  });
});

const setupPortManagers = () => {
  portManager = new PortManager('popup-content', handleCtResponseTask);
  bgPortManager = new PortManager('popup-background', handleBgResponseTask);
  portManager.linkManager(bgPortManager);
  bgPortManager.linkManager(portManager);
}

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
  captureWholePage2.value = langData.capture_entire_page2;
  selectArea.value = langData.select_area;
  useSidePanel.value = langData.use_side_panel;
}

const selectedType = (type: string) => {
  mediaType.value = '';

  setTimeout(() => {
    mediaType.value = type;
  }, 0);
};

const handleBgResponseTask = (message: any) => {
  if (message.type === 'CAPTURE_RES') {
    const { image } = message;
      const link = document.createElement('a');
      link.href = image;
      link.download = `Xcreen.${mediaType.value}`;
      link.click();
  }
  else if (message.type === 'SELECT_AREA_RES') {
    portManagerSendMessage(message)
  }
};

const handleCtResponseTask = (message: any) => {
  if (message.type === 'EXTRACT_TEXT_IMAGE') {
    // todo: to be removed
  }
}

const portManagerSendMessage = (message: any) => {
  if (!bgPortManager || !bgPortManager.getLinkedManager()) { return; }
  bgPortManager.getLinkedManager()?.currentPort()?.postMessage({ 
    type: 'SELECT_AREA', 
    mediaType: mediaType.value, 
    imageData: message.image 
  });
};

const captureImage = async () => {
  if (bgPortManager == null) {
    setupPortManagers();
    await sleep(500);
   }
  bgPortManager!.sendMessage({ type: 'CAPTURE', mediaType: mediaType.value });
};

const captureEntirePage = async () => {
  if (portManager == null) {
    setupPortManagers();
    await sleep(500);
  }
  portManager!.sendMessage({ type: 'ENTIRE_PAGE_HTML', mediaType: mediaType.value });
};

const captureEntirePage2 = async () => {
  if (portManager == null) {
    setupPortManagers();
    await sleep(500);
  }
  portManager!.sendMessage({ type: 'ENTIRE_PAGE_HTML2', mediaType: mediaType.value });
};

const selectAreaToImage = async () => {
  if (bgPortManager == null) { 
    setupPortManagers();
    await sleep(500);
  }
  bgPortManager!.sendMessage({ type: 'SELECT_AREA', mediaType: mediaType.value, lang: extraLanguage.value });
};

const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const handleFileSelected = (files: File[]) => {

  if (mediaType.value === 'svg') {
    // @ts-ignore
    createSVGByFile(files);

    return;
  }
  else if (mediaType.value === 'txt') {
    // @ts-ignore
    extractTextFromFile(files, extraLanguage.value);

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