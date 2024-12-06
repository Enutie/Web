<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  bgColor: {
    type: String,
    default: '#ffffff'
  }
})
</script>

<template>
  <div 
    class="slide" 
    :class="{ 'slide--active': isActive }"
    :style="{ 
      backgroundColor: bgColor,
      transform: `translateY(${isActive ? '0' : '100%'})`
    }"
  >
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1);
}

.content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 2rem;
}
</style>