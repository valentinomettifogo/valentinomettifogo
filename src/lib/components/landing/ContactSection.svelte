<script lang="ts">
  let { email }: { email: string } = $props();
</script>

<section id="contatti" class="container mx-auto px-6 py-24 md:px-16">
  <div class="mx-auto max-w-4xl rounded-lg border border-slate-100 bg-white p-12 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg md:p-20">
    <h2 class="mb-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Lavoriamo insieme?</h2>
    <p class="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-500">
      Al momento sono aperto a nuove opportunita e collaborazioni. Se hai un'idea in mente, un progetto da sviluppare o vuoi solo fare rete, scrivimi!
    </p>
    <a href={`mailto:${email}`} class="btn h-14 rounded-lg border-none bg-slate-900 px-10 text-lg font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl">
      Mandami un'email
    </a>
  </div>
</section>
