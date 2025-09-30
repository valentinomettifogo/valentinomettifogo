<template>
    <aside>
        <div class="profile-card">
            <div class="profile-image">👨‍💻</div>
            <h2 class="profile-name">Mario Rossi</h2>
            <p class="profile-title">Full-Stack Developer</p>
            <div class="divider"></div>
            <p class="profile-bio">
                Sviluppatore appassionato di design e tecnologia.
                Creo esperienze digitali che uniscono estetica e funzionalità.
                Sempre alla ricerca di nuove sfide creative! 🚀
            </p>
            <div class="divider"></div>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">24</div>
                    <div class="stat-label">Progetti</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">3</div>
                    <div class="stat-label">Anni</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">12</div>
                    <div class="stat-label">Skills</div>
                </div>
            </div>
        </div>
    </aside>
</template>

<style lang="scss" scoped>
@import "../styles/variables";

aside {
  position: sticky;
  top: 24px;
  height: fit-content;
  .profile-card {
    background: white;
    border-radius: $radius;
    padding: 24px;
    box-shadow: $shadow;
    transition: box-shadow 0.3s ease;
    &:hover {
      box-shadow: $shadow-hover;
    }
    .profile-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, $primary, $secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3em;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .profile-name {
      color: $text-main;
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 8px;
      text-align: center;
    }
    .profile-title {
      color: $danger;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .profile-bio {
      color: #616161;
      line-height: 1.6;
      font-size: 14px;
      text-align: center;
    }
    .divider {
      height: 1px;
      background: $tag-border;
      margin: 20px 0;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
      .stat-item {
        flex: 1;
        .stat-number {
          color: $primary;
          font-size: 24px;
          font-weight: 500;
        }
        .stat-label {
          color: $text-light;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
  }
}
</style>