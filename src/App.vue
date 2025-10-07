<template>
  <div class="container">
    <Sidebar />
    <main>
      <About />
      <section class="projects-section">
        <header class="section-header">
          <h2 class="section-title">Featured Projects</h2>
          <p class="section-subtitle">Open source projects and experiments</p>
        </header>
        <Post v-for="post in posts" :key="post.id" :post="post" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import About from './components/About.vue';
import Post from './components/Post.vue';

const posts = ref([]);

onMounted(async () => {
  const res = await fetch('src/data/post.json');
  const data = await res.json();
  posts.value = data.posts;
});
</script>

<style>
:root {
  --main-color: #42b883;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  background: #ffffff;
  color: #24292f;
  line-height: 1.5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  padding: 24px;
}

.about-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #d1d9e0;
}

.main-title {
  color: #24292f;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.about-text {
  color: #656d76;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.about-text strong {
  color: var(--main-color);
  font-weight: 600;
}

.projects-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  color: #24292f;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.section-subtitle {
  color: #656d76;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr !important;
    padding: 12px;
  }

  aside.sidebar {
    position: relative !important;
    top: 0 !important;
  }
}
</style>