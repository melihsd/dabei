<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { Card, CardContent, CardHeader } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
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

	let week = $state('this');
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
		<h2 class="text-2xl font-bold">Button</h2>
		<div class="flex flex-wrap gap-4">
			<Button>Default</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="destructive">Destructive</Button>
			<Button disabled>Disabled</Button>
		</div>
		<div class="flex flex-wrap items-center gap-4">
			<Button size="sm">Small</Button>
			<Button size="icon" aria-label="Add">+</Button>
			<Button href="/styleguide" variant="outline">As link</Button>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Tabs</h2>
		<Tabs bind:value={week}>
			<TabsList>
				<TabsTrigger value="this">This week</TabsTrigger>
				<TabsTrigger value="next">Next week</TabsTrigger>
				<TabsTrigger value="past" disabled>Past</TabsTrigger>
			</TabsList>
			<TabsContent value="this">Content of this week</TabsContent>
			<TabsContent value="next">Content of next week</TabsContent>
		</Tabs>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Chip</h2>
		<div class="flex flex-wrap gap-4">
			<Chip color="#ff3b00" own>Anna (own)</Chip>
			<Chip color="#0057ff">Ben</Chip>
			<Chip color="#00b84a">Cem</Chip>
			<Chip color="#ffd600">Dana</Chip>
			<Chip color="#a100ff">Eli</Chip>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-bold">Card</h2>
		<div class="grid gap-6 sm:grid-cols-2">
			<Card>
				<CardHeader>
					<span class="font-bold uppercase">Mon</span>
					<span class="font-mono text-sm">05.10.</span>
				</CardHeader>
				<CardContent>Default card with header</CardContent>
			</Card>
			<Card shadow>
				<CardContent>Card with hard shadow, no header</CardContent>
			</Card>
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
