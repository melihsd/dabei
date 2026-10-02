<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Chip } from '#lib/components/ui/chip/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { MAX_COMMENT_LENGTH } from '#lib/constants.js';

	type Props = {
		date: string;
		slot: string;
		name: string;
		color: string;
		comment: string | null;
	};

	let { date, slot, name, color, comment }: Props = $props();

	let open = $state(false);
	let text = $state('');
	let error = $state('');
</script>

<Popover
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) return;
		text = comment ?? '';
		error = '';
	}}
>
	<PopoverTrigger class="cursor-pointer" aria-label="Edit your note">
		<Chip {color} own>{name}</Chip>
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
			<Textarea
				name="comment"
				bind:value={text}
				maxlength={MAX_COMMENT_LENGTH}
				placeholder="Add a short note"
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
