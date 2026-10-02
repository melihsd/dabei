<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader } from '#lib/components/ui/card/index.js';
	import { ColorPicker } from '#lib/components/ui/color-picker/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { WEEKDAYS, parseSlots, parseWorkdays } from '#lib/dates.js';
	import { MAX_NAME_LENGTH } from '#lib/settings.js';

	let { data, form } = $props();

	const chipLabel =
		'flex min-h-11 cursor-pointer items-center border-2 border-foreground px-4 font-mono text-sm font-bold uppercase has-checked:bg-foreground has-checked:text-background has-focus-visible:outline-2 has-focus-visible:outline-offset-2';
</script>

<main class="mx-auto max-w-3xl space-y-8 p-4 sm:p-8">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-4xl font-bold tracking-tight">Settings</h1>
		<div class="flex gap-3">
			<Button href={resolve('/')} variant="outline" size="sm">Back</Button>
			{#if data.admin}
				<form method="POST" action="?/logout" use:enhance>
					<Button type="submit" variant="outline" size="sm">Sign out</Button>
				</form>
			{/if}
		</div>
	</header>

	{#if !data.admin}
		{#if !data.configured}
			<p class="border-2 border-destructive p-4 font-bold text-destructive">
				ADMIN_PASSWORD and COOKIE_SECRET are not set on the server.
			</p>
		{:else}
			<form method="POST" action="?/login" use:enhance class="max-w-sm space-y-4">
				<label class="block space-y-2">
					<span class="font-mono text-sm font-bold uppercase">Admin password</span>
					<Input type="password" name="password" autocomplete="current-password" required />
				</label>
				{#if form?.scope === 'login'}
					<p class="font-bold text-destructive">{form.error}</p>
				{/if}
				<Button type="submit">Sign in</Button>
			</form>
		{/if}
	{:else}
		<section class="space-y-4">
			<h2 class="text-2xl font-bold">Planner</h2>
			<form
				method="POST"
				action="?/saveSettings"
				use:enhance={() =>
					({ update }) =>
						update({ reset: false })}
				class="space-y-6"
			>
				<fieldset class="space-y-2">
					<legend class="font-mono text-sm font-bold uppercase">Mode</legend>
					<div class="flex flex-wrap gap-2">
						{#each [['day', 'Full days'], ['slots', 'Time slots']] as [value, label] (value)}
							<label class={chipLabel}>
								<input
									type="radio"
									name="mode"
									{value}
									checked={data.settings?.mode === value}
									class="sr-only"
								/>
								{label}
							</label>
						{/each}
					</div>
				</fieldset>

				<fieldset class="space-y-2">
					<legend class="font-mono text-sm font-bold uppercase">Workdays</legend>
					<div class="flex flex-wrap gap-2">
						{#each WEEKDAYS as day (day)}
							<label class={chipLabel}>
								<input
									type="checkbox"
									name="workdays"
									value={day}
									checked={parseWorkdays(data.settings?.workdays ?? '').includes(day)}
									class="sr-only"
								/>
								{day}
							</label>
						{/each}
					</div>
				</fieldset>

				<label class="block space-y-2">
					<span class="font-mono text-sm font-bold uppercase">Time slots (one per line)</span>
					<Textarea
						name="slots"
						rows={3}
						value={parseSlots(data.settings?.slots ?? '').join('\n')}
						placeholder="09:00-13:00"
						class="max-w-xs font-mono"
					/>
				</label>

				{#if form?.scope === 'settings'}
					{#if form.error}
						<p class="font-bold text-destructive">{form.error}</p>
					{:else if form.saved}
						<p class="font-mono text-sm font-bold">Saved.</p>
					{/if}
				{/if}
				<Button type="submit">Save planner</Button>
			</form>
		</section>

		<section class="space-y-4">
			<h2 class="text-2xl font-bold">Team members</h2>
			<div class="space-y-4">
				{#each data.members as member (member.id)}
					<Card>
						<CardHeader>
							<span class="font-bold">{member.name}</span>
							<span class="font-mono text-xs text-muted-foreground">
								{member.active ? 'active' : 'inactive'}
							</span>
						</CardHeader>
						<CardContent>
							<form
								method="POST"
								action="?/updateMember"
								use:enhance={() =>
									({ update }) =>
										update({ reset: false })}
								class="space-y-4"
							>
								<input type="hidden" name="id" value={member.id} />
								<div class="grid gap-4 sm:grid-cols-[1fr_6rem]">
									<label class="space-y-1">
										<span class="font-mono text-xs font-bold uppercase">Name</span>
										<Input name="name" value={member.name} maxlength={MAX_NAME_LENGTH} required />
									</label>
									<label class="space-y-1">
										<span class="font-mono text-xs font-bold uppercase">Order</span>
										<Input type="number" name="sortOrder" value={member.sortOrder} step="1" />
									</label>
								</div>
								<ColorPicker name="color" value={member.color} />
								<label class="flex items-center gap-3">
									<Switch name="active" checked={member.active} />
									<span class="font-mono text-sm">Active</span>
								</label>
								{#if form?.scope === 'member' && form.id === member.id}
									{#if 'error' in form}
										<p class="font-bold text-destructive">{form.error}</p>
									{:else}
										<p class="font-mono text-sm font-bold">Saved.</p>
									{/if}
								{/if}
								<Button type="submit" size="sm">Save</Button>
							</form>
						</CardContent>
					</Card>
				{/each}
			</div>
		</section>

		<section class="space-y-4">
			<h2 class="text-2xl font-bold">Add member</h2>
			<form method="POST" action="?/addMember" use:enhance class="max-w-md space-y-4">
				<label class="block space-y-1">
					<span class="font-mono text-xs font-bold uppercase">Name</span>
					<Input name="name" maxlength={MAX_NAME_LENGTH} required />
				</label>
				<input type="hidden" name="sortOrder" value={data.members.length} />
				<ColorPicker name="color" />
				{#if form?.scope === 'new' && form.error}
					<p class="font-bold text-destructive">{form.error}</p>
				{/if}
				<Button type="submit">Add member</Button>
			</form>
		</section>
	{/if}
</main>
