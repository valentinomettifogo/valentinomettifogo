<template>
  <div>
    <header>
      <Navbar />
    </header>
    
    <HeroSection />
    
    <section class="projects" id="projects">
      <h2 class="section-title">Projects</h2>
      <div class="projects-grid">
        <ProjectCard 
          v-for="project in projects" 
          :key="project.id" 
          :project="project" 
        />
      </div>
    </section>
    
    <ContactSection />
    
    <Footer />
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import HeroSection from './components/HeroSection.vue'
import ProjectCard from './components/ProjectCard.vue'
import ContactSection from './components/ContactSection.vue'
import Footer from './components/Footer.vue'
import projectsData from './data/projects.json'

const projects = ref([])

onMounted(() => {
  // Load projects data
  projects.value = projectsData.projects
  
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = 80;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Header background on scroll
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(250, 250, 250, 0.98)';
      header.style.borderBottomColor = '#ddd';
    } else {
      header.style.background = 'rgba(250, 250, 250, 0.95)';
      header.style.borderBottomColor = '#eee';
    }
  });
});
</script>

<style scoped>
.projects {
  padding: 80px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

@media (max-width: 768px) {
  .projects {
    padding: 60px 20px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>