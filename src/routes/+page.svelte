<script lang="ts">
  import ContactSection from '$lib/components/landing/ContactSection.svelte';
  import HeroSection from '$lib/components/landing/HeroSection.svelte';
  import ProjectsSection from '$lib/components/landing/ProjectsSection.svelte';
  import { me, projects } from '$lib/data/site';
</script>

<HeroSection {me} />
<ProjectsSection {projects} />
<ContactSection email={me.email} />
