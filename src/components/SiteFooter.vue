<script setup lang="ts">
const BLOG = 'https://blog.enutie.com'
const GITHUB = 'https://github.com/Enutie'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div>© enutie {{ year }}</div>
    <div class="links">
      <a :href="`${BLOG}/index.xml`">rss</a>
      <a :href="GITHUB">github</a>
      <a href="https://enutie.github.io">bachelor project</a>
      <a href="https://sketcheduler.enutie.com">sketcheduler</a>
      <a :href="BLOG">blog.enutie.com</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--border);
  padding: 16px var(--page-x);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--muted);
}

.links {
  display: flex;
  gap: 14px;
}

.links a {
  color: var(--muted);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.links a:hover {
  color: var(--red-text);
}
</style>
