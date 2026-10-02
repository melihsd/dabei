<script lang="ts">
	import { enhance } from '$app/forms';
	import { scale } from 'svelte/transition';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { cn } from '#lib/utils.js';
	import type { WeekDay } from '#lib/dates.js';

	type Entry = { memberId: number; name: string; color: string };

	type Props = {
		me: { id: number; name: string; color: string };
		days: WeekDay[];
		presence: (Entry & { date: string; slot: string })[];
	};

	let { me, days, presence }: Props = $props();

	/** Optimistic overlay: key "date|slot" -> whether my entry should currently show. */
	let pending = $state<Record<string, boolean>>({});

	function entries(date: string, slot: string): Entry[] {
		const rows = presence.filter((p) => p.date === date && p.slot === slot);
		const want = pending[`${date}|${slot}`];
		if (want === undefined) return rows;
		const others = rows.filter((r) => r.memberId !== me.id);
		return want ? [...others, { memberId: me.id, name: me.name, color: me.color }] : others;
	}

	function isMine(date: string, slot: string) {
		return entries(date, slot).some((e) => e.memberId === me.id);
	}
</script>

<div class="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
	{#each days as day (day.iso)}
		{@const slot = ''}
		{@const mine = isMine(day.iso, slot)}
		<Card>
			<form
				method="POST"
				action="?/toggle"
				use:enhance={() => {
					const key = `${day.iso}|${slot}`;
					pending[key] = !isMine(day.iso, slot);
					return async ({ update }) => {
						await update({ reset: false });
						delete pending[key];
					};
				}}
			>
				<input type="hidden" name="date" value={day.iso} />
				<input type="hidden" name="slot" value={slot} />
				<button
					type="submit"
					class={cn(
						'flex min-h-11 w-full cursor-pointer items-baseline justify-between gap-2 border-b-2 border-foreground p-3 text-left motion-safe:transition-colors motion-safe:duration-100',
						mine
							? 'bg-foreground text-background hover:bg-background hover:text-foreground'
							: 'hover:bg-foreground hover:text-background'
					)}
					aria-pressed={mine}
				>
					<span class="font-bold uppercase">{day.label}</span>
					<span class="font-mono text-sm">{day.dateLabel}</span>
				</button>
			</form>
			<CardContent class="flex min-h-16 flex-wrap content-start gap-2">
				{#each entries(day.iso, slot) as entry (entry.memberId)}
					<span out:scale={{ duration: 120, start: 0.8 }}>
						<Chip color={entry.color} own={entry.memberId === me.id}>{entry.name}</Chip>
					</span>
				{:else}
					<span class="font-mono text-sm text-muted-foreground">–</span>
				{/each}
			</CardContent>
		</Card>
	{/each}
</div>
