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

{#snippet overlay(date: string, slot: string, label: string, mine: boolean)}
	<form
		method="POST"
		action="?/toggle"
		use:enhance={() => submit(date, slot)}
		class="absolute inset-0"
	>
		<input type="hidden" name="date" value={date} />
		<input type="hidden" name="slot" value={slot} />
		<button
			type="submit"
			aria-pressed={mine}
			aria-label={label}
			class={cn(
				'group absolute inset-0 cursor-pointer motion-safe:transition-colors motion-safe:duration-150',
				mine ? 'hover:bg-background/10' : 'hover:bg-foreground/5'
			)}
		>
			<span
				aria-hidden="true"
				class={cn(
					'absolute top-3 right-4 text-2xl leading-none font-black opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-150',
					mine ? 'text-background/60' : 'text-foreground/30'
				)}
			>
				{mine ? '−' : '+'}
			</span>
		</button>
	</form>
{/snippet}

{#snippet chips(date: string, slot: string, mine: boolean)}
	<div class="pointer-events-none relative mt-auto flex flex-wrap gap-2 pt-4">
		{#each entries(date, slot) as entry (entry.memberId)}
			<span
				out:scale={{ duration: 120, start: 0.8 }}
				class="pointer-events-auto flex max-w-full flex-col items-start gap-2"
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
						onInverted={mine}
					/>
				{:else}
					<Chip color={entry.color} onInverted={mine}>{entry.name}</Chip>
				{/if}
			</span>
		{/each}
	</div>
{/snippet}

<div
	class="flex flex-col gap-px overflow-x-auto border border-foreground bg-foreground sm:flex-row"
>
	{#each days as day (day.iso)}
		{#if mode === 'day'}
			{@const mine = isMine(day.iso, '')}
			<div
				class={cn(
					'relative flex min-h-64 min-w-36 flex-1 flex-col gap-2 p-5',
					mine ? 'bg-foreground text-background' : 'bg-background'
				)}
			>
				{@render overlay(day.iso, '', `${day.label} ${day.dateLabel}`, mine)}
				<div class="pointer-events-none relative">
					<div class="text-5xl leading-none font-black">{day.label}</div>
					<div class={cn('mt-2 text-xs', mine ? 'text-background/60' : 'text-muted-foreground')}>
						{day.dateLabel}
					</div>
				</div>
				{@render chips(day.iso, '', mine)}
			</div>
		{:else}
			<div class="flex min-w-36 flex-1 flex-col bg-background">
				<div class="p-5 pb-3">
					<div class="text-5xl leading-none font-black">{day.label}</div>
					<div class="mt-2 text-xs text-muted-foreground">{day.dateLabel}</div>
				</div>
				{#each slots as slot (slot)}
					{@const mine = isMine(day.iso, slot)}
					<div
						class={cn(
							'relative flex min-h-28 flex-1 flex-col gap-2 border-t border-foreground p-3',
							mine ? 'bg-foreground text-background' : 'bg-background'
						)}
					>
						{@render overlay(day.iso, slot, `${day.label} ${slot}`, mine)}
						<div class="pointer-events-none relative font-mono text-xs font-bold">{slot}</div>
						{@render chips(day.iso, slot, mine)}
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</div>
