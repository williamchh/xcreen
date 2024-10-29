<template>
  <div class="language-dropdown">
    <select v-model="selectedLanguage" @change="onLanguageChange">
      <option disabled value="">{{ selectLanguagePlaceholder }}</option>
      <option v-for="language in languages" :key="language.id" :value="language.id">
        {{ language.value }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>

import { ref, onMounted } from 'vue';
import { getLanguageSet } from '../libs/language-set';
import { getLanguage } from '../libs/language';

const selectedLanguage = ref('eng');
const selectLanguagePlaceholder = ref('Select a language');
const languages = ref<{id: string, value: string}[]>([]);
const emit = defineEmits(['language-selected']);

onMounted(() => {
    const browserLanguage = chrome.i18n.getUILanguage();
    const langSet = getLanguageSet(browserLanguage);
    const lang = getLanguage(browserLanguage);
    languages.value = langSet;
    selectLanguagePlaceholder.value = lang.select_a_language;
});

const onLanguageChange = () => {
    emit('language-selected', selectedLanguage.value);
};

</script>

<style scoped>
    .language-dropdown {
    margin-bottom: 20px;
    }
    select {
    width: 100%;
    padding: 8px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #737373;
    transition: border-color 0.2s;
    }
    select:focus {
    border-color: #76c7c0;
    outline: none;
}
</style>