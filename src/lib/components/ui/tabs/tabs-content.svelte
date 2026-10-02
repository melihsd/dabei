<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className, ref = $bindable(null), ...rest }: TabsPrimitive.ContentProps = $props();
</script>

<TabsPrimitive.Content bind:ref class={cn(className)} {...rest} />
