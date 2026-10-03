<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { WEEKDAYS, parseSlots, parseWorkdays } from '#lib/dates.js';
	import { MAX_NAME_LENGTH } from '#lib/constants.js';

	let { data, form } = $props();

	let mode = $derived(data.settings?.mode);

	const chipLabel =
		'flex min-h-11 cursor-pointer items-center border border-foreground px-4 font-mono text-sm font-bold uppercase has-checked:bg-foreground has-checked:text-background has-focus-visible:outline-2 has-focus-visible:outline-offset-2';
</script>

<main class="mx-auto max-w-3xl space-y-8 p-4 sm:p-8">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-4xl font-bold tracking-tight">Settings</h1>
		<div class="flex gap-3">
			<Button href={resolve('/')} variant="outline" size="sm">Back</Button>
			{#if data.admin && !data.sso}
				<form method="POST" action="?/logout" use:enhance>
					<Button type="submit" variant="outline" size="sm">Sign out</Button>
				</form>
			{/if}
		</div>
	</header>

	{#if !data.admin}
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

				<div class="flex items-center gap-3">
					<Switch
						checked={mode === 'slots'}
						onCheckedChange={(on) => (mode = on ? 'slots' : 'day')}
						aria-labelledby="slots-switch-label"
					/>
					<span id="slots-switch-label" class="font-mono text-sm font-bold uppercase">
						Enable time slots
					</span>
					<input type="hidden" name="mode" value={mode} />
				</div>

				<label class={['block space-y-2', mode !== 'slots' && 'opacity-40']}>
					<span class="font-mono text-sm font-bold uppercase">Slots (one per line)</span>
					<Textarea
						name="slots"
						rows={3}
						value={parseSlots(data.settings?.slots ?? '').join('\n')}
						placeholder="09:00-13:00"
						readonly={mode !== 'slots'}
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
			<h2 class="text-2xl font-bold">Login</h2>
			<div class="max-w-xl space-y-4">
				<p class="text-sm">
					Login via Outline:
					<strong class={data.outline.configured ? '' : 'text-muted-foreground'}>
						{data.outline.configured ? 'on' : 'off'}
					</strong>
				</p>
				<p class="text-sm text-muted-foreground">
					Turns on automatically once OUTLINE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET and
					OAUTH_REDIRECT_URI are set. People then sign in with Outline instead of picking a name;
					their Outline name becomes their dabei name (an existing name with the same spelling is
					linked on first login). While it is on, only Outline admins can open this page; the admin
					password is not used.
				</p>
				{#if data.outline.redirectUri}
					<p class="text-sm">
						<span class="text-muted-foreground">Redirect URI to register in Outline:</span><br />
						<code class="break-all">{data.outline.redirectUri}</code>
					</p>
				{/if}
			</div>
		</section>

		<section class="space-y-4">
			<h2 class="text-2xl font-bold">Team names</h2>
			<p class="text-sm text-muted-foreground">
				{#if data.outline.configured}
					Names are created automatically when people sign in with Outline. You can remove people
					here.
				{:else}
					People pick their name on their first visit and choose their own color. They can also add
					themselves.
				{/if}
			</p>
			<ul class="max-w-md divide-y divide-foreground border border-foreground">
				{#each data.members as member (member.id)}
					<li class="flex items-center justify-between gap-3 p-3">
						<span class="flex items-center gap-3">
							<span class="size-4" style="background: {member.color}"></span>
							<span class="font-bold">{member.name}</span>
						</span>
						<form
							method="POST"
							action="?/removeMember"
							use:enhance={({ cancel }) => {
								if (!confirm(`Remove ${member.name} and all their entries?`)) cancel();
								return ({ update }) => update({ reset: false });
							}}
						>
							<input type="hidden" name="id" value={member.id} />
							<Button type="submit" variant="destructive" size="sm">Remove</Button>
						</form>
					</li>
				{:else}
					<li class="p-3 text-sm text-muted-foreground">No names yet.</li>
				{/each}
			</ul>
		</section>

		{#if !data.outline.configured}
			<section class="space-y-4">
				<h2 class="text-2xl font-bold">Add name</h2>
				<form method="POST" action="?/addMember" use:enhance class="max-w-md space-y-4">
					<Input
						name="name"
						maxlength={MAX_NAME_LENGTH}
						placeholder="Name"
						aria-label="Name"
						required
					/>
					{#if form?.scope === 'new' && 'error' in form}
						<p class="font-bold text-destructive">{form.error}</p>
					{/if}
					<Button type="submit">Add name</Button>
				</form>
			</section>
		{/if}
	{/if}
</main>
