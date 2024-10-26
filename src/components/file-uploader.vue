<script lang="ts">
import { defineComponent, ref } from 'vue';

interface FileWithPreview extends File {
  preview?: string;
}

export default defineComponent({
  name: 'FileUploader',
  emits: ['files-selected'],
  
  setup(_, { emit }) {
    const files = ref<FileWithPreview[]>([]);
    const isDragging = ref(false);
    const uploadProgress = ref(0);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const supportTypes = ['image/png', 'image/jpeg'];

    const onFileSelect = (event: Event) => {

      const input = event.target as HTMLInputElement;
      if (input.files) {

        // check if the selected files are supported
        const hasUnsupportedFiles = Array.from(input.files).some(file => !supportTypes.includes(file.type));
        if (hasUnsupportedFiles) {
          alert('Unsupported file type');
          return;
        }

        handleFiles(Array.from(input.files));
      }
    };

    const handleFiles = (newFiles: File[]) => {
      const validFiles = newFiles.filter(file => {
        // Add your file validation here
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
      });

      const filesWithPreviews = validFiles.map(file => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });

      if (!newFiles || !newFiles.length) {
        return;
      }

        const firstFile = newFiles[0];
        if (!firstFile.type.startsWith('image/')) {
            alert('Unsupported file type');
            return;
        }

        if (firstFile.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB');
            return;
        }

      files.value = [...files.value, ...filesWithPreviews];
      emit('files-selected', newFiles[0]);
    };

    const removeFile = (index: number) => {
      if (files.value[index].preview) {
        URL.revokeObjectURL(files.value[index].preview!);
      }
      files.value.splice(index, 1);
      emit('files-selected', files.value);
    };

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      isDragging.value = true;
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      isDragging.value = false;
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      isDragging.value = false;
      if (e.dataTransfer?.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };

    const triggerFileInput = () => {
      fileInputRef.value?.click();
    };

    return {
      files,
      isDragging,
      uploadProgress,
      fileInputRef,
      onFileSelect,
      removeFile,
      onDragEnter,
      onDragLeave,
      onDrop,
      triggerFileInput
    };
  }
});
</script>

<template>
  <div class="file-uploader">
    <div
      class="upload-zone"
      :class="{ 'dragging': isDragging }"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover.prevent
      @drop="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="hidden-input"
        @change="onFileSelect"
      />
      <div class="upload-content">
        <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="upload-text">To SVG</p>
        <p class="upload-text">Drop files here or click to upload</p>
        <p class="upload-hint">Supported files: PNG, JPG</p>
      </div>
    </div>

    <div v-if="files.length" class="file-list">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        <div class="file-preview">
          <img v-if="file.preview" :src="file.preview" alt="preview" class="preview-image" />
          <div v-else class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ (file.size / 1024).toFixed(1) }} KB</span>
        </div>
        <button class="remove-button" @click.stop="removeFile(index)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #4f46e5;
  background-color: #353535;
}

.upload-zone.dragging {
  border-color: #4f46e5;
  background-color: #353535;
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #6b7280;
}

.upload-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #949494;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.file-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 6px;
  gap: 1rem;
}

.file-preview {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.remove-button:hover {
  color: #ef4444;
}
</style>