<script setup>
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const content = ref('')

// Function to load markdown file
const loadMarkdown = async (fileName) => {
  try {
    const response = await fetch(`/content/${fileName}.md`)
    const text = await response.text()
    content.value = md.render(text)
  } catch (error) {
    console.error('Error loading markdown:', error)
  }
}

onMounted(() => {
  loadMarkdown('test') // Load a test file
})
</script>

<template>
  <div class="markdown-content" v-html="content"></div>
</template>

<style scoped>
.markdown-content :deep(h1) {
  font-size: 2em;
  margin-bottom: 1rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.2em;
  margin-bottom: 1rem;
}
</style>