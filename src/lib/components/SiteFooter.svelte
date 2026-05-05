<script lang="ts">
  let { name }: { name: string } = $props();

  const year = new Date().getFullYear();
</script>

<footer class="container mx-auto mt-8 border-t border-slate-200/70 px-6 py-10 text-center text-sm text-slate-400 md:px-16">
  <p>© {year} {name}.</p>
</footer>
