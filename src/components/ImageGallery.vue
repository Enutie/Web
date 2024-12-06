<script setup>
import { ref, onMounted } from 'vue'

// Import all images from a specific category
const artImages = import.meta.glob('@/assets/images/art/*.{png,jpg,jpeg,gif}', { eager: true })
const gameImages = import.meta.glob('@/assets/images/games/*.{png,jpg,jpeg,gif}', { eager: true })

// Organize by category
const images = {
  art: Object.values(artImages).map(module => module.default),
  games: Object.values(gameImages).map(module => module.default)
}

const selectedCategory = ref('art')
</script>

<template>
  <div class="gallery">
    <!-- Category selector -->
    <div class="controls">
      <button 
        v-for="category in Object.keys(images)" 
        :key="category"
        @click="selectedCategory = category"
        :class="{ active: selectedCategory === category }"
      >
        {{ category }}
      </button>
    </div>

    <!-- Image grid -->
    <div class="image-grid">
      <div v-for="url in images[selectedCategory]" :key="url" class="image-container">
        <img :src="url" :alt="`${selectedCategory} image`" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  padding: 1rem;
}

.controls {
  margin-bottom: 1rem;
}

.controls button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
}

.controls button.active {
  background: #333;
  color: white;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-container img {
  width: 100%;
  height: auto;
  object-fit: cover;
  aspect-ratio: 1;
}
</style>