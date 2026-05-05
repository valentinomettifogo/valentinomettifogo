<script lang="ts">
  import type { Person } from '$lib/data/site';

  let { me }: { me: Person } = $props();
</script>

<section id="home" class="container mx-auto flex flex-col items-center gap-12 px-6 py-16 md:flex-row md:gap-20 md:px-16 md:py-32">
  <div class="flex w-full justify-center md:w-5/12 md:justify-start">
    <div class="w-72 overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl md:w-96" style="aspect-ratio: 3 / 4;">
      <img src={me.photo} alt={`Ritratto di ${me.name}`} class="h-full w-full object-cover" />
    </div>
  </div>

  <div class="flex w-full flex-col items-start gap-6 md:w-7/12">
    <div class="badge rounded-lg border-none bg-emerald-100/60 px-4 py-3 font-medium text-emerald-600 shadow-sm transition-all duration-300">
      Disponibile per nuove sfide
    </div>
    <h1 class="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-7xl">
      Ciao, sono <br />
      <span class="text-emerald-500">{me.name}</span>
    </h1>
    <p class="max-w-lg text-lg leading-relaxed text-slate-500 md:text-xl">
      {me.role}. {me.bio}
    </p>

    <div class="mt-6 flex flex-wrap gap-4">
      <a href="#progetti" class="btn h-12 rounded-lg border-none bg-emerald-500 px-8 font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-md">
        Vedi i progetti
      </a>
      <a href="#contatti" class="btn h-12 rounded-lg border border-transparent bg-white px-8 font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 hover:shadow-md">
        Contattami
      </a>
    </div>
  </div>
</section>
