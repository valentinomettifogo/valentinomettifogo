<script lang="ts">
  import type { Project } from '$lib/data/site';

  let { project }: { project: Project } = $props();
</script>

<div class="card group overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
  <figure class="relative h-56 overflow-hidden">
    <div class="absolute inset-0 z-10 bg-black/5 transition-colors duration-300 group-hover:bg-transparent"></div>
    <img src={project.image} alt={project.title} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
  </figure>
  <div class="flex grow flex-col p-8">
    <h3 class="mb-3 text-2xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-emerald-500">{project.title}</h3>
    <p class="mb-6 grow leading-relaxed text-slate-500">{project.description}</p>
    <div class="mt-auto border-t border-slate-100 pt-4">
      <a href={project.link} class="inline-flex items-center gap-2 font-medium text-emerald-500 transition-colors duration-300 hover:text-slate-900">
        Scopri il progetto
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </a>
    </div>
  </div>
</div>
