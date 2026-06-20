// Simple, dependency-free horizontal bar chart (pure CSS, no JS at runtime).
//
// Usage in markdown:
//
//   :::bar-chart[Coverage holds steady]
//   Before | 60 | neutral
//   After  | 72 | good
//   :::
//
// Each row is "label | value | colour". Colour is optional and one of:
// good (green), bad (red), neutral (grey), accent. Bars are scaled to the
// largest value in the chart. The [title] is optional.

const startReg = /^:::bar-chart(?:\[(.*?)\])?\s*$/;
const endReg = /^:::$/;
const rowReg = /^(.+?)\s*\|\s*([\d.]+)\s*(?:\|\s*(good|bad|neutral|accent))?\s*$/;

export const barChart = {
	name: 'barChart',
	level: 'block',
	start(this, src: string) {
		return src.match(/(^|[\r\n]):::bar-chart/)?.index;
	},
	tokenizer(this, src: string, _tokens) {
		const lines = src.split(/\n/);
		const m0 = startReg.exec(lines[0]);
		if (!m0) return;

		let end = -1;
		for (let i = 1; i < lines.length; i++) {
			if (endReg.test(lines[i])) {
				end = i;
				break;
			}
		}
		if (end === -1) return;

		const rows: { label: string; value: number; color: string }[] = [];
		for (const line of lines.slice(1, end)) {
			const m = rowReg.exec(line.trim());
			if (m) rows.push({ label: m[1].trim(), value: parseFloat(m[2]), color: m[3] || '' });
		}

		return {
			type: 'barChart',
			raw: lines.slice(0, end + 1).join('\n'),
			title: m0[1] || '',
			rows,
			tokens: [],
		};
	},
	renderer(this, token) {
		const max = Math.max(...token.rows.map((r) => r.value), 0) || 1;
		const rows = token.rows
			.map((r) => {
				const pct = Math.max(3, (r.value / max) * 100).toFixed(1);
				const cc = r.color ? ` ${r.color}` : '';
				return `<div class="bar-row"><span class="bar-label">${r.label}</span><span class="bar-track"><span class="bar-fill${cc}" style="width:${pct}%"><span class="bar-value">${r.value}</span></span></span></div>`;
			})
			.join('');
		const title = token.title ? `<div class="bar-chart-title">${token.title}</div>` : '';
		return `<figure class="bar-chart">${title}${rows}</figure>`;
	},
};
