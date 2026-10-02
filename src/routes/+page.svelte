<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import WeekView from '#lib/components/week/week-view.svelte';

	let { data, form } = $props();

	// Live updates: refresh every 30 s while the tab is visible.
	$effect(() => {
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible') invalidateAll();
		}, 30_000);
		return () => clearInterval(timer);
	});
</script>

<main class="space-y-8 p-4 sm:p-8">
	{#if !data.member}
		<section class="space-y-6">
			<h1 class="text-4xl font-bold tracking-tight">Who are you?</h1>
			<form method="POST" action="?/pick" use:enhance class="flex flex-wrap gap-3">
				{#each data.members as member (member.id)}
					<button
						type="submit"
						name="memberId"
						value={member.id}
						class="cursor-pointer hover:shadow-hard"
					>
						<Chip color={member.color} class="min-h-11 px-4 text-base">{member.name}</Chip>
					</button>
				{/each}
			</form>
			{#if form?.error}
				<p class="font-bold text-destructive">{form.error}</p>
			{/if}
		</section>
	{:else}
		<header class="flex flex-wrap items-center justify-between gap-4 pb-2">
			<h1 class="text-2xl font-bold">dabei</h1>
			<div class="flex items-center gap-4 text-sm">
				<ThemeToggle />
				<a href={resolve('/settings')} class="text-muted-foreground hover:text-foreground">
					Settings
				</a>
				<span class="flex items-center gap-2">
					<span class="size-4" style="background: {data.member.color}"></span>
					<span class="text-muted-foreground">{data.member.name}</span>
				</span>
				<form method="POST" action="?/switch" use:enhance>
					<button
						type="submit"
						class="cursor-pointer text-muted-foreground underline hover:text-foreground"
					>
						Not you?
					</button>
				</form>
			</div>
		</header>

		<Tabs
			value={data.week}
			onValueChange={(week) => goto(`?week=${week}`, { reset: false })}
			class="items-center"
		>
			<TabsList>
				<TabsTrigger value="this">This week</TabsTrigger>
				<TabsTrigger value="next">Next week</TabsTrigger>
			</TabsList>
		</Tabs>

		<WeekView
			me={data.member}
			mode={data.mode}
			slots={data.slots}
			days={data.days}
			presence={data.presence}
		/>

		{#if form?.error}
			<p class="font-bold text-destructive">{form.error}</p>
		{/if}
	{/if}
</main>
