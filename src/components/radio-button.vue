<template>
    <div class="radio-group">
        <template v-for="type in xcreenTypes" :key="type.id">
            <label class="xcreen-radio-label">
                <input type="radio" name="type" :value="type.id" v-model="selected" @click="selectedType">
                <span class="xcreen-radio"></span>
                <span class="radio-label">{{ type.name }}</span>
            </label>
        </template>
    </div>

</template>

<script setup lang="ts">

const xcreenTypes = [
    { id: 'png', name: 'PNG' },
    { id: 'jpeg', name: 'JPEG' },
    { id: 'svg', name: 'SVG' },
    { id: 'txt', name : 'TXT' },
];

const emit = defineEmits(['selectedType']);
import { ref } from 'vue';

const selected = ref('png');

const selectedType = (e: Event) => {
    const target = e.target as HTMLInputElement;
    emit('selectedType', target.value);
};
</script>


<style scoped>
.radio-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    margin-bottom: 2em;
}

/* Hide the default radio button */
input[type="radio"] {
    display: none;
}

.xcreen-radio-label {
    display: flex;
    align-items: center;
}

/* Create a custom radio button */
.xcreen-radio {
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.3s ease;
}

/* Checked state styling */
input[type="radio"]:checked + .xcreen-radio::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background-color: #4CAF50;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}

/* Hover effect */
.xcreen-radio:hover {
    background-color: #f0f0f0;
}

/* Label styling */
.radio-label {
    margin-left: 8px;
    cursor: pointer;
}
</style>