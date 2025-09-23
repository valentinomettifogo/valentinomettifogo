<template>
  <div class="project-card">
    <div class="project-image">{{ project.icon }}</div>
    <div class="project-content">
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      <div class="project-tags">
        <span 
          v-for="tech in project.technologies" 
          :key="tech" 
          class="tag"
        >
          {{ tech }}
        </span>
      </div>
      <div class="project-links">
        <template v-for="(url, linkType) in project.links" :key="linkType">
          <a 
            :href="url" 
            :target="url.startsWith('http') ? '_blank' : '_self'"
            class="project-link"
            :class="{ 'primary': linkType === 'live' || linkType === 'demo' }"
          >
            {{ formatLinkText(linkType) }}
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})

const formatLinkText = (linkType) => {
  const linkTexts = {
    live: 'View Live',
    demo: 'Demo',
    github: 'GitHub',
    docs: 'API Docs'
  }
  return linkTexts[linkType] || linkType.charAt(0).toUpperCase() + linkType.slice(1)
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: #ddd;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.project-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  border-bottom: 1px solid #eee;
}

.project-content {
  padding: 24px;
}

.project-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.project-card p {
  color: #666;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  padding: 4px 8px;
  background: #f1f3f4;
  border-radius: 4px;
  font-size: 12px;
  color: #5f6368;
  font-weight: 500;
}

.project-links {
  display: flex;
  gap: 12px;
}

.project-link {
  padding: 8px 16px;
  background: #f8f9fa;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #eee;
}

.project-link:hover {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.project-link.primary {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.project-link.primary:hover {
  background: #333;
}
</style>