<template>
  <header>
    <nav>
      <div class="logo">Portfolio</div>
      <ul class="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 20px 40px;
  background: rgba(250, 250, 250, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eee;
  z-index: 1000;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 32px;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #1a1a1a;
}

@media (max-width: 768px) {
  header {
    padding: 16px 20px;
  }
  
  .nav-links {
    display: none;
  }
}
</style>