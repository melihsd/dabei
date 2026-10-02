<script lang="ts">
	import { enhance } from '$app/forms';
	import { scale } from 'svelte/transition';
	import { Card, CardContent, CardHeader } from '#lib/components/ui/card/index.js';
	import { Bubble } from '#lib/components/ui/bubble/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import CommentEditor from './comment-editor.svelte';
	import { cn } from '#lib/utils.js';
	import type { WeekDay } from '#lib/dates.js';

	type Entry = { memberId: number; name: string; color: string; comment: string | null };

	type Props = {
		me: { id: number; name: string; color: string };
		mode: 'day' | 'slots';
		slots: string[];
		days: WeekDay[];
		presence: (Entry & { date: string; slot: string })[];
	};

	let { me, mode, slots, days, presence }: Props = $props();

	/** Optimistic overlay: key "date|slot" -> whether my entry should currently show. */
	let pending = $state<Record<string, boolean>>({});

	function entries(date: string, slot: string): Entry[] {
		const rows = presence.filter((p) => p.date === date && p.slot === slot);
		const want = pending[`${date}|${slot}`];
		if (want === undefined) return rows;
		const others = rows.filter((r) => r.memberId !== me.id);
		return want
			? [...others, { memberId: me.id, name: me.name, color: me.color, comment: null }]
			: others;
	}

	function isMine(date: string, slot: string) {
		return entries(date, slot).some((e) => e.memberId === me.id);
	}

	function submit(date: string, slot: string) {
		const key = `${date}|${slot}`;
		pending[key] = !isMine(date, slot);
		return async ({ update }: { update: (o?: { reset?: boolean }) => Promise<void> }) => {
			await update({ reset: false });
			delete pending[key];
		};
	}
</script>

{#snippet toggle(date: string, slot: string, label: string, aside: string, class_: string)}
	{@const mine = isMine(date, slot)}
	<form method="POST" action="?/toggle" use:enhance={() => submit(date, slot)}>
		<input type="hidden" name="date" value={date} />
		<input type="hidden" name="slot" value={slot} />
		<button
			type="submit"
			aria-pressed={mine}
			class={cn(
				'flex min-h-11 w-full cursor-pointer items-baseline justify-between gap-2 p-3 text-left motion-safe:transition-colors motion-safe:duration-100',
				mine
					? 'bg-foreground text-background hover:bg-background hover:text-foreground'
					: 'hover:bg-foreground hover:text-background',
				class_
			)}
		>
			<span class="font-bold uppercase">{label}</span>
			<span class="font-mono text-sm">{aside}</span>
		</button>
	</form>
{/snippet}

{#snippet chips(date: string, slot: string)}
	<div class="flex min-h-16 flex-wrap content-start gap-2 p-3">
		{#each entries(date, slot) as entry (entry.memberId)}
			<span
				out:scale={{ duration: 120, start: 0.8 }}
				class="flex max-w-full flex-col items-start gap-2"
			>
				{#if entry.comment}
					<Bubble class="max-w-full">{entry.comment}</Bubble>
				{/if}
				{#if entry.memberId === me.id}
					<CommentEditor
						{date}
						{slot}
						name={entry.name}
						color={entry.color}
						comment={entry.comment}
					/>
				{:else}
					<Chip color={entry.color}>{entry.name}</Chip>
				{/if}
			</span>
		{:else}
			<span class="font-mono text-sm text-muted-foreground">–</span>
		{/each}
	</div>
{/snippet}

<div class="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
	{#each days as day (day.iso)}
		<Card>
			{#if mode === 'day'}
				{@render toggle(day.iso, '', day.label, day.dateLabel, 'border-b-2 border-foreground')}
				{@render chips(day.iso, '')}
			{:else}
				<CardHeader>
					<span class="font-bold uppercase">{day.label}</span>
					<span class="font-mono text-sm">{day.dateLabel}</span>
				</CardHeader>
				<CardContent class="p-0">
					{#each slots as slot (slot)}
						<div class="not-first:border-t-2 not-first:border-foreground">
							{@render toggle(day.iso, slot, slot, '', '')}
							{@render chips(day.iso, slot)}
						</div>
					{/each}
				</CardContent>
			{/if}
		</Card>
	{/each}
</div>
