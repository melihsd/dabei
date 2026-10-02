<script lang="ts">
	import { cn } from '#lib/utils.js';

	// Saturated swatches to pick from; the chosen value is stored on the member.
	const SWATCHES = [
		'#FF3B00',
		'#FF7A00',
		'#FFC800',
		'#9ACD00',
		'#00B84A',
		'#00B8A9',
		'#00A3FF',
		'#0057FF',
		'#5B2BFF',
		'#A100FF',
		'#FF00A8',
		'#E0003C'
	];

	type Props = { name: string; value?: string; class?: string };

	let { name, value = $bindable(SWATCHES[0]), class: className }: Props = $props();
</script>

<fieldset class={cn('flex flex-wrap gap-2', className)}>
	<legend class="sr-only">Color</legend>
	{#each SWATCHES as swatch (swatch)}
		<label
			class="border- size-8 cursor-pointer border-foreground has-checked:shadow-hard has-checked:outline-2 has-checked:outline-offset-2 has-checked:outline-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
			style="background: {swatch}"
		>
			<input type="radio" {name} value={swatch} bind:group={value} class="sr-only" />
			<span class="sr-only">{swatch}</span>
		</label>
	{/each}
</fieldset>
