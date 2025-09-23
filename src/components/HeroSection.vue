<template>
  <section class="hero" id="home">
    <h1>Hi, I'm a developer</h1>
    <p>I create web applications and simple but effective digital solutions. I love experimenting with new technologies and building projects that solve real problems.</p>
  </section>
</template>

<style scoped>
.hero {
  padding: 140px 40px 80px;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero p {
  font-size: 20px;
  color: #666;
  margin-bottom: 32px;
  max-width: 600px;
}

@media (max-width: 768px) {
  .hero {
    padding: 120px 20px 60px;
  }
  
  .hero h1 {
    font-size: 36px;
  }
  
  .hero p {
    font-size: 18px;
  }
}
</style>