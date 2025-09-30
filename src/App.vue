<template>
  <div class="container">
    <Sidebar />
    <main class="main-content">
      <header>
        <h1>I Miei Progetti</h1>
        <p class="subtitle">Portfolio & Blog Creativo</p>
      </header>
      <div class="posts-container">
        <Post v-for="project in projects" :key="project.id" :project="project" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Post from './components/Post.vue';

const projects = ref([]);

onMounted(async () => {
  const res = await fetch('src/data/projects.json');
  const data = await res.json();
  projects.value = data.projects;
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
@import "./styles/variables";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Roboto', sans-serif;
  background: #fafafa;
  min-height: 100vh;
  padding: 24px;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
}
.main-content {
  min-width: 0;
  header {
    margin-bottom: 32px;
    h1 {
      color: $text-main;
      font-size: 34px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    .subtitle {
      color: $text-light;
      font-size: 16px;
      font-weight: 400;
    }
  }
}
@media (max-width: 968px) {
  .container {
    grid-template-columns: 1fr;
  }
  aside {
    position: relative;
    top: 0;
  }
}
@media (max-width: 768px) {
  body {
    padding: 16px;
  }
  h1 {
    font-size: 28px;
  }
  .post {
    padding: 16px;
  }
}
</style>