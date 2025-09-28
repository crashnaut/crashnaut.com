<script>
	import { variables } from '$lib/variables';
</script>

<div>
	<a
		href="https://github.com/crashnaut/crashnaut.com/commit/{variables.hash}"
		rel="noreferrer"
		target="_blank">{variables.hash?.substring(0, 6) ?? 'local'}</a
	>
	hosted on
	<a
		href="https://firebase.google.com"
		rel="noreferrer"
		target="_blank">Firebase</a
	>
	({variables.timestamp.toISOString()})
</div>
