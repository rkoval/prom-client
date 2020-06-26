'use strict';

const Gauge = require('../gauge');
const v8 = require('v8');

const METRICS = ['total', 'used', 'available'];
const NODEJS_HEAP_SIZE = {};

METRICS.forEach(metricType => {
	NODEJS_HEAP_SIZE[metricType] = `nodejs_heap_space_size_${metricType}_bytes`;
});

module.exports = (registry, config = {}) => {
	const registers = registry ? [registry] : undefined;
	const namePrefix = config.prefix ? config.prefix : '';
	const labels = config.labels ? config.labels : {};
	const labelNames = [...Object.keys(labels), 'space'];

	const gauges = {};

	METRICS.forEach(metricType => {
		gauges[metricType] = new Gauge({
			name: namePrefix + NODEJS_HEAP_SIZE[metricType],
			help: `Process heap space size ${metricType} from Node.js in bytes.`,
			labelNames,
			registers,
		});
	});

	return () => {
		const data = {
			total: {},
			used: {},
			available: {},
		};

		v8.getHeapSpaceStatistics().forEach(space => {
			const spaceName = space.space_name.substr(
				0,
				space.space_name.indexOf('_space'),
			);

			data.total[spaceName] = space.space_size;
			data.used[spaceName] = space.space_used_size;
			data.available[spaceName] = space.space_available_size;

			gauges.total.set(
				Object.assign({ space: spaceName }, labels),
				space.space_size,
			);
			gauges.used.set(
				Object.assign({ space: spaceName }, labels),
				space.space_used_size,
			);
			gauges.available.set(
				Object.assign({ space: spaceName }, labels),
				space.space_available_size,
			);
		});

		return data;
	};
};

module.exports.metricNames = Object.values(NODEJS_HEAP_SIZE);
