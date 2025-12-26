<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    const giscusContainer = ref<HTMLElement | null>(null);

    onMounted(() => {
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'susitata/Gxu-Tch-Web-discussion');
        script.setAttribute('data-repo-id', 'R_kgDOQuwzKA');
        script.setAttribute('data-category', 'Announcements');
        script.setAttribute('data-category-id', 'DIC_kwDOQuwzKM4C0O3S');
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', 'preferred_color_scheme');
        script.setAttribute('data-lang', 'zh-CN');
        script.crossOrigin = 'anonymous';
        script.async = true;

        const embedContainer = document.getElementById('giscus-embed');
        if (embedContainer) {
            embedContainer.appendChild(script);
        }
    });
</script>

<template>
    <div class="giscus-container">
        <div id="giscus-embed"></div>
    </div>
</template>

<style scoped>
    .giscus-container {
        padding: 2rem;
        max-width: 1200px;
        margin : 2rem auto;
        background: rgba(21, 21, 21, 0);
        border-radius: 8px;
    }
</style>
