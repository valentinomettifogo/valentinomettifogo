<template>
    <div class="post">
        <div class="header">
            <div class="avatar">{{ project.icon }}</div>
            <div>
                <h3>{{ project.title }}</h3>
                <span class="date">{{ project.date || 'Data non disponibile' }}</span>
            </div>
        </div>
        <div class="content">
            <p>{{ project.description }}</p>
        </div>
        <div class="tags">
            <span v-for="tech in project.technologies" :key="tech" class="tag">#{{ tech }}</span>
        </div>
        <div class="links">
            <a v-if="project.links?.url" :href="project.links.url" class="link" target="_blank">Sito</a>
            <a v-if="project.links?.github" :href="project.links.github" class="link" target="_blank">GitHub</a>
            <a v-if="project.links?.docs" :href="project.links.docs" class="link" target="_blank">Docs</a>
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
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.post {
    background: white;
    border-radius: $radius;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: $shadow;
    transition: box-shadow 0.3s ease, transform 0.3s ease;

    &:hover {
        box-shadow: $shadow-hover;
        transform: translateY(-2px);
    }

    .header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, $primary, $secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            margin-right: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        h3 {
            color: $text-main;
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 4px;
        }

        .date {
            color: $text-light;
            font-size: 14px;
            font-weight: 400;
        }
    }

    .content {
        color: $text-content;
        line-height: 1.6;
        margin-bottom: 16px;
        font-size: 14px;
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;

        .tag {
            background: $tag-bg;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            color: #616161;
            font-weight: 500;
            border: 1px solid $tag-border;
        }
    }

    .links {
        display: flex;
        gap: 12px;

        .link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: $danger;
            color: white;
            padding: 10px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: background 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

            &:hover {
                background: $danger-dark;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
        }
    }
}
</style>