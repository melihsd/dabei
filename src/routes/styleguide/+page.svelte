<script lang="ts">
	const colors = [
		'background',
		'foreground',
		'card',
		'primary',
		'secondary',
		'muted',
		'muted-foreground',
		'accent',
		'destructive',
		'border',
		'ring'
	];

	let dark = $state(false);

	function toggleDark() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
	}
</script>

<main class="mx-auto max-w-4xl space-y-12 p-4 sm:p-8">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-4xl font-bold tracking-tight">Styleguide</h1>
		<button
			type="button"
			onclick={toggleDark}
			class="min-h-11 border-2 border-foreground px-4 font-mono text-sm uppercase hover:bg-foreground hover:text-background"
		>
			{dark ? 'Light' : 'Dark'} mode
		</button>
	</header>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Colors</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			{#each colors as name (name)}
				<div class="border-2 border-foreground">
					<div class="h-16 border-b-2 border-foreground" style="background: var(--{name})"></div>
					<p class="p-2 font-mono text-xs">--{name}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Typography</h2>
		<p class="text-4xl font-bold">Geist Sans – Same minimal planner.</p>
		<p class="text-xl">Geist Sans regular – More range.</p>
		<p class="font-mono text-sm">Geist Mono – 09:00-13:00 · Mon 05.10.</p>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Border and shadow</h2>
		<div class="flex flex-wrap gap-6">
			<div class="border-2 border-foreground p-4">border-2</div>
			<div class="border-2 border-foreground p-4 shadow-hard">shadow-hard</div>
			<div class="border-2 border-foreground bg-muted p-4">bg-muted</div>
			<div class="border-2 border-destructive p-4 text-destructive">destructive</div>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Motion</h2>
		<div class="flex gap-4">
			<span class="animate-chip-in border-2 border-foreground px-3 py-1 font-mono text-sm"
				>chip-in</span
			>
			<span class="animate-chip-out border-2 border-foreground px-3 py-1 font-mono text-sm"
				>chip-out</span
			>
		</div>
	</section>
</main>
