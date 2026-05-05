<script lang="ts">
  import ProjectCard from './ProjectCard.svelte';
  import type { Project } from '$lib/data/site';

  let { projects }: { projects: Project[] } = $props();
</script>

<section id="progetti" class="container mx-auto px-6 py-20 md:px-16">
  <div class="mb-12">
    <h2 class="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">I miei Progetti</h2>
    <div class="h-1.5 w-16 rounded-lg bg-emerald-500"></div>
  </div>

  <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
    {#each projects as project (project.title)}
      <ProjectCard {project} />
    {/each}
  </div>
</section>
