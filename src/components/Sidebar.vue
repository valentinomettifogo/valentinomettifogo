<template>
  <aside class="sidebar">
    <div class="profile-card">
      <div class="profile-image">
        <img src="https://avatars.githubusercontent.com/u/102023558?v=4" alt="Valentino Mettifogo avatar" class="avatar-img" />
      </div>
      <h2 class="profile-name">Valentino Mettifogo</h2>
      <p class="profile-title">BI Developer & Team Leader</p>
      <p class="profile-location">📍 Padua, Italy</p>
      <div class="divider"></div>
      <div class="profile-section">
        <h3 class="section-title">Skills</h3>
        <div class="skills">
          <span class="skill-tag">Qlik Sense</span>
          <span class="skill-tag">SQL</span>
          <span class="skill-tag">Vue.js</span>
          <span class="skill-tag">JavaScript</span>
          <span class="skill-tag">Python</span>
          <span class="skill-tag">Data Modeling</span>
        </div>
      </div>
      <div class="divider"></div>
      <div class="profile-section">
        <h3 class="section-title">Languages</h3>
        <p class="language">🇮🇹 Italian — Native</p>
        <p class="language">🇬🇧 English — B2</p>
      </div>
      <div class="divider"></div>
      <div class="profile-section">
        <h3 class="section-title">Interests</h3>
        <p class="interests">☕ Coffee • 🖥️ IT • 🐈 Cats</p>
      </div>
      <div class="divider"></div>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">8+</div>
          <div class="stat-label">Years</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">4</div>
          <div class="stat-label">Repos</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">2</div>
          <div class="stat-label">Certs</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 24px;
  min-height: 400px;
  height: 90vh;
  display: flex;
  align-items: flex-start;
}
.profile-card {
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.profile-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 0 auto 16px;
  background: var(--main-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  color: white;
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}
.profile-name {
  color: #24292f;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  text-align: center;
}
.profile-title {
  color: #656d76;
  font-size: 16px;
  text-align: center;
  margin-bottom: 8px;
  font-weight: 600;
}
.profile-location {
  color: #656d76;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
}
.divider {
  height: 1px;
  background: #d1d9e0;
  margin: 16px 0;
}
.profile-section {
  margin-bottom: 8px;
}
.section-title {
  color: #24292f;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}
.skill-tag {
  background: #f0f8f4;
  color: var(--main-color);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--main-color);
}
.language, .interests {
  color: #656d76;
  font-size: 12px;
  text-align: center;
  margin: 2px 0;
}
.stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}
.stat-item {
  flex: 1;
}
.stat-number {
  color: var(--main-color);
  font-size: 18px;
  font-weight: 600;
}
.stat-label {
  color: #656d76;
  font-size: 12px;
}
</style>