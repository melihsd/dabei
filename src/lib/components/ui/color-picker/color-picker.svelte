<script lang="ts">
	import { MEMBER_COLORS as SWATCHES } from '#lib/constants.js';
	import { cn } from '#lib/utils.js';

	type Props = { name: string; value?: string; class?: string };

	let { name, value = $bindable(SWATCHES[0]), class: className }: Props = $props();
</script>

<fieldset class={cn('flex flex-wrap gap-2', className)}>
	<legend class="sr-only">Color</legend>
	{#each SWATCHES as swatch (swatch)}
		<label
			class="size-8 cursor-pointer border border-foreground has-checked:shadow-hard has-checked:outline-2 has-checked:outline-offset-2 has-checked:outline-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
			style="background: {swatch}"
		>
			<input type="radio" {name} value={swatch} bind:group={value} class="sr-only" />
			<span class="sr-only">{swatch}</span>
		</label>
	{/each}
</fieldset>
