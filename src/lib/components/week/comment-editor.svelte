<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { ENTRY_EMOJIS, MAX_COMMENT_LENGTH } from '#lib/constants.js';
	import { cn } from '#lib/utils.js';

	type Props = {
		date: string;
		slot: string;
		name: string;
		color: string;
		comment: string | null;
		emojis: string[];
	};

	let { date, slot, name, color, comment, emojis }: Props = $props();

	let open = $state(false);
	let text = $state('');
	let picked = $state<string[]>([]);
	let error = $state('');
</script>

<Popover
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) return;
		text = comment ?? '';
		picked = [...emojis];
		error = '';
	}}
>
	<PopoverTrigger class="cursor-pointer" aria-label="Edit your note">
		<Chip {color} own note={Boolean(comment)}>{[name, ...emojis].join(' ')}</Chip>
	</PopoverTrigger>
	<PopoverContent>
		<form
			method="POST"
			action="?/comment"
			class="space-y-3"
			use:enhance={() =>
				async ({ result, update }) => {
					if (result.type === 'failure') {
						error = String(result.data?.error ?? 'Could not save the note.');
						return;
					}
					await update({ reset: false });
					open = false;
				}}
		>
			<input type="hidden" name="date" value={date} />
			<input type="hidden" name="slot" value={slot} />
			<div class="flex gap-2" role="group" aria-label="Emojis">
				{#each ENTRY_EMOJIS as emoji (emoji)}
					{@const on = picked.includes(emoji)}
					<label
						class={cn(
							'flex size-10 cursor-pointer items-center justify-center border border-foreground text-xl has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
							on ? 'bg-foreground' : 'hover:bg-muted'
						)}
					>
						<input
							type="checkbox"
							name="emojis"
							value={emoji}
							checked={on}
							class="sr-only"
							onchange={() => {
								picked = on ? picked.filter((e) => e !== emoji) : [...picked, emoji];
								if (picked.length) text = '';
							}}
						/>
						{emoji}
					</label>
				{/each}
			</div>
			<Textarea
				name="comment"
				bind:value={text}
				maxlength={MAX_COMMENT_LENGTH}
				placeholder={picked.length ? 'Emojis replace the note' : 'Add a short note'}
				disabled={picked.length > 0}
				aria-label="Your note"
			/>
			<p class="text-right font-mono text-xs text-muted-foreground">
				{text.length}/{MAX_COMMENT_LENGTH}
			</p>
			{#if error}
				<p class="text-sm font-bold text-destructive">{error}</p>
			{/if}
			<div class="flex gap-2">
				<Button type="submit" size="sm">Save</Button>
				{#if comment}
					<Button type="submit" name="remove" value="1" variant="outline" size="sm">Remove</Button>
				{/if}
			</div>
		</form>
	</PopoverContent>
</Popover>
