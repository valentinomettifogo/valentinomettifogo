<template>
    <div class="post-card">
        <div class="post-image-wrapper">
            <img class="post-image" src="https://picsum.photos/300/200" alt="Post image" />
        </div>
        <div class="post">
            <div class="post-header">
                <h3 class="post-title">{{ post.title }}</h3>
                <span v-if="post.visibility === 'Public'" class="badge">Public</span>
            </div>
            <p class="post-description">{{ post.description }}</p>
            <div class="post-meta">
                <span v-for="tech in post.technologies?.slice(0, 1)" :key="tech" class="post-tech">
                    <span class="tech-dot"></span>
                    {{ tech }}
                </span>
            </div>
            <div class="post-actions">
                <div style="flex:1"></div>
                <a v-if="post.links?.url" :href="post.links.url"
                    target="_blank" class="btn">Link pubblico</a>
                <a v-if="post.links?.github" :href="post.links.github" target="_blank"
                    class="btn">Repository</a>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    post: {
        type: Object,
        required: true
    }
})
</script>

<style scoped>
.post-card {
    display: flex;
    flex-direction: row;
    width: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #d1d9e0;
    margin-bottom: 16px;
    overflow: hidden;
    min-height: 180px;
    padding: 0;
}

.post-image-wrapper {
    flex: 0 0 300px;
    height: 100%;
    display: flex;
    align-items: stretch;
}

.post-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    margin: 0;
    background: #f0f0f0;
    display: block;
}

.post {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.post-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.post-title {
    color: #212529;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.badge {
    display: inline-block;
    padding: 0.35em 0.65em;
    font-size: 0.70em;
    font-weight: 700;
    color: #fff;
    background-color: var(--main-color);
    border-radius: 0.25rem;
}

.post-description {
    color: #656d76;
    line-height: 1.4;
    margin-bottom: 12px;
    font-size: 14px;
}

.post-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.95em;
    color: #656d76;
    margin-bottom: 12px;
}

.post-tech {
    display: flex;
    align-items: center;
    gap: 4px;
}

.tech-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--main-color);
    display: inline-block;
}

.post-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn {
    display: inline-block;
    font-weight: 400;
    color: var(--main-color);
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: transparent;
    border: 1px solid var(--main-color);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    text-decoration: none;
    transition: background-color 0.15s, color 0.15s;
    color: var(--main-color);
    background-color: #fff;
    border-color: var(--main-color);
}

.btn:hover {
    background-color: var(--main-color);
    color: #fff;
}
</style>
