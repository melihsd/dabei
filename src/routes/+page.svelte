<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ColorPicker } from '#lib/components/ui/color-picker/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover/index.js';
	import { MAX_NAME_LENGTH } from '#lib/constants.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import WeekView from '#lib/components/week/week-view.svelte';

	let { data, form } = $props();

	let colorOpen = $state(false);

	// Live updates: refresh every 10 s while the tab is visible.
	$effect(() => {
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible') invalidateAll();
		}, 10_000);
		return () => clearInterval(timer);
	});
</script>

<main class="space-y-8 p-4 sm:p-8">
	{#if !data.member && data.authRequired}
		<section class="mx-auto max-w-md space-y-6 pt-12">
			<h1 class="text-4xl font-bold tracking-tight">Sign in</h1>
			{#if !data.loginConfigured}
				<p class="font-bold text-destructive">
					Login is turned on but Outline is not configured. Ask an admin.
				</p>
			{:else}
				{#if data.loginFailed}
					<p class="font-bold text-destructive">Login failed. Please try again.</p>
				{/if}
				<Button href="/auth/login" data-sveltekit-reload>Sign in with Outline</Button>
			{/if}
		</section>
	{:else if !data.member}
		<section class="mx-auto max-w-2xl space-y-8">
			{#if data.members.length > 0}
				<div class="space-y-6">
					<h1 class="text-4xl font-bold tracking-tight">Who are you?</h1>
					<form method="POST" action="?/pick" use:enhance class="flex flex-wrap gap-3">
						{#each data.members as member (member.id)}
							<button
								type="submit"
								name="memberId"
								value={member.id}
								class="cursor-pointer"
								aria-label={member.name}
							>
								<Chip color={member.color}>{member.name}</Chip>
							</button>
						{/each}
					</form>
				</div>
			{/if}

			<div class="space-y-4">
				<h2
					class={data.members.length > 0
						? 'text-xl font-bold'
						: 'text-4xl font-bold tracking-tight'}
				>
					{data.members.length > 0 ? 'Not in the list?' : 'Add your name'}
				</h2>
				<form method="POST" action="?/register" use:enhance class="max-w-sm space-y-4">
					<Input
						name="name"
						maxlength={MAX_NAME_LENGTH}
						placeholder="Your name"
						aria-label="Your name"
						required
					/>
					<ColorPicker name="color" />
					<Button type="submit">Join</Button>
				</form>
			</div>

			{#if form?.error}
				<p class="font-bold text-destructive">{form.error}</p>
			{/if}
		</section>
	{:else}
		<header class="flex flex-wrap items-center justify-between gap-4 pb-2">
			<h1 class="text-2xl font-bold">dabei</h1>
			<div class="flex items-center gap-4 text-sm">
				<ThemeToggle />
				{#if data.isAdmin}
					<a href={resolve('/settings')} class="text-muted-foreground hover:text-foreground">
						Settings
					</a>
				{/if}
				<Popover bind:open={colorOpen}>
					<PopoverTrigger
						class="flex cursor-pointer items-center gap-2"
						aria-label="Edit your name and color"
					>
						<span class="size-4" style="background: {data.member.color}"></span>
						<span class="text-muted-foreground">{data.member.name}</span>
					</PopoverTrigger>
					<PopoverContent class="w-auto space-y-3">
						{#if data.profileUrl}
							<a
								href={data.profileUrl}
								target="_blank"
								rel="noreferrer"
								class="block underline hover:text-muted-foreground"
							>
								Change username
							</a>
						{:else}
							<form method="POST" action="?/rename" use:enhance class="flex gap-2">
								<Input
									name="name"
									value={data.member.name}
									maxlength={MAX_NAME_LENGTH}
									required
									aria-label="Your name"
								/>
								<Button type="submit">Save</Button>
							</form>
						{/if}
						<form
							method="POST"
							action="?/color"
							use:enhance={() =>
								async ({ update }) => {
									await update({ reset: false });
									colorOpen = false;
								}}
							onchange={(e) => e.currentTarget.requestSubmit()}
						>
							<ColorPicker name="color" value={data.member.color} />
						</form>
					</PopoverContent>
				</Popover>
				{#if data.authRequired}
					<form method="POST" action="/auth/logout">
						<button
							type="submit"
							class="cursor-pointer text-muted-foreground underline hover:text-foreground"
						>
							Sign out
						</button>
					</form>
				{:else}
					<form method="POST" action="?/switch" use:enhance>
						<button
							type="submit"
							class="cursor-pointer text-muted-foreground underline hover:text-foreground"
						>
							Not you?
						</button>
					</form>
				{/if}
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
