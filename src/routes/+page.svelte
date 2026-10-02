<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';

	let { data, form } = $props();
</script>

<main class="mx-auto max-w-2xl space-y-8 p-4 sm:p-8">
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
			<p class="flex items-center gap-3">
				<Chip color={data.member.color} own>{data.member.name}</Chip>
			</p>
			<form method="POST" action="?/switch" use:enhance>
				<Button type="submit" variant="outline" size="sm">Not you?</Button>
			</form>
		</header>
	{/if}
</main>
