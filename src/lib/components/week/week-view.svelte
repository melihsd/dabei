<script lang="ts">
	import { enhance } from '$app/forms';
	import { scale } from 'svelte/transition';
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

	/** Note currently shown by a tap (touch screens have no hover). */
	let shownNote = $state<string | null>(null);

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

{#snippet chips(date: string, slot: string)}
	<div class="pointer-events-none relative flex flex-wrap gap-2">
		{#each entries(date, slot) as entry (entry.memberId)}
			{@const noteKey = `${date}|${slot}|${entry.memberId}`}
			<span out:scale={{ duration: 120, start: 0.8 }} class="group pointer-events-auto relative">
				{#if entry.comment}
					<Bubble
						class={cn(
							'pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-max max-w-56 text-foreground group-hover:block group-has-[[data-state=open]]:hidden',
							shownNote === noteKey && 'block'
						)}
					>
						{entry.comment}
					</Bubble>
				{/if}
				{#if entry.memberId === me.id}
					<CommentEditor
						{date}
						{slot}
						name={entry.name}
						color={entry.color}
						comment={entry.comment}
					/>
				{:else if entry.comment}
					<!-- Hover shows the note; a tap toggles it on touch screens. -->
					<button
						type="button"
						class="cursor-default"
						aria-label={`${entry.name}: ${entry.comment}`}
						onclick={() => (shownNote = shownNote === noteKey ? null : noteKey)}
						onblur={() => (shownNote = null)}
					>
						<Chip color={entry.color} note>{entry.name}</Chip>
					</button>
				{:else}
					<Chip color={entry.color}>{entry.name}</Chip>
				{/if}
			</span>
		{/each}
	</div>
{/snippet}

{#snippet overlay(date: string, slot: string, label: string, mine: boolean)}
	<form method="POST" action="?/toggle" use:enhance={() => submit(date, slot)}>
		<input type="hidden" name="date" value={date} />
		<input type="hidden" name="slot" value={slot} />
		<button
			type="submit"
			aria-pressed={mine}
			aria-label={label}
			class={cn(
				'group absolute inset-0 cursor-pointer motion-safe:transition-colors motion-safe:duration-100',
				mine ? 'hover:bg-background/10' : 'hover:bg-foreground/5'
			)}
		>
			<span
				aria-hidden="true"
				class={cn(
					'absolute top-2 right-3 text-xl leading-none font-bold opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-100',
					mine ? 'text-background/60' : 'text-foreground/40'
				)}
			>
				{mine ? '−' : '+'}
			</span>
		</button>
	</form>
{/snippet}

<div
	class="flex flex-col gap-px overflow-x-auto border border-foreground bg-foreground sm:flex-row"
>
	{#each days as day (day.iso)}
		{#if mode === 'day'}
			{@const mine = isMine(day.iso, '')}
			<div
				class={cn(
					'relative flex min-h-40 min-w-36 flex-1 flex-col gap-3 p-4',
					mine ? 'bg-foreground text-background' : 'bg-background'
				)}
			>
				{@render overlay(day.iso, '', `${day.label} ${day.dateLabel}`, mine)}
				<div class="pointer-events-none relative">
					<div class="text-2xl leading-none font-bold">{day.label}</div>
					<div class={cn('mt-1 text-xs', mine ? 'text-background/60' : 'text-muted-foreground')}>
						{day.dateLabel}
					</div>
				</div>
				<div class="mt-auto">{@render chips(day.iso, '')}</div>
			</div>
		{:else}
			<div class="flex min-h-40 min-w-36 flex-1 flex-col gap-4 bg-background p-4">
				<div>
					<div class="text-2xl leading-none font-bold">{day.label}</div>
					<div class="mt-1 text-xs text-muted-foreground">{day.dateLabel}</div>
				</div>
				{#each slots as slot (slot)}
					{@const mine = isMine(day.iso, slot)}
					<div
						class={cn(
							'relative flex min-h-24 flex-col gap-3 p-3',
							mine ? 'bg-foreground text-background' : 'bg-muted'
						)}
					>
						{@render overlay(day.iso, slot, `${day.label} ${slot}`, mine)}
						<div class="pointer-events-none relative text-xs font-bold">{slot}</div>
						<div class="mt-auto">{@render chips(day.iso, slot)}</div>
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</div>
