<template>
  <section class="contact" id="contact">
    <div class="contact-content">
      <h2>Contact</h2>
      <p>Interested in collaborating or have questions about my projects? Get in touch!</p>
      <div class="contact-links">
        <a 
          v-for="link in contactLinks" 
          :key="link.name"
          :href="link.url" 
          class="contact-link"
          :target="link.url.startsWith('http') ? '_blank' : '_self'"
        >
          {{ link.name }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const contactLinks = [
  {
    name: 'Email',
    url: 'mailto:your.email@example.com'
  },
  {
    name: 'LinkedIn',
    url: '#'
  },
  {
    name: 'GitHub',
    url: '#'
  },
  {
    name: 'Twitter',
    url: '#'
  }
]
</script>

<style scoped>
.contact {
  padding: 80px 40px;
  background: white;
  border-top: 1px solid #eee;
}

.contact-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.contact h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.contact p {
  color: #666;
  margin-bottom: 32px;
  font-size: 18px;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.contact-link {
  padding: 12px 20px;
  background: #f8f9fa;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #eee;
}

.contact-link:hover {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .contact {
    padding: 60px 20px;
  }
  
  .contact-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>