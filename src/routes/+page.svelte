<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
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

<main class="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
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
		<header class="flex flex-wrap items-center justify-between gap-4">
			<Tabs value={data.week} onValueChange={(week) => goto(`?week=${week}`, { reset: false })}>
				<TabsList>
					<TabsTrigger value="this">This week</TabsTrigger>
					<TabsTrigger value="next">Next week</TabsTrigger>
				</TabsList>
			</Tabs>
			<div class="flex items-center gap-3">
				<Chip color={data.member.color} own>{data.member.name}</Chip>
				<form method="POST" action="?/switch" use:enhance>
					<Button type="submit" variant="outline" size="sm">Not you?</Button>
				</form>
			</div>
		</header>

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
