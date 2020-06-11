'use strict';

const Gauge = require('../gauge');
const version = process.version;
const versionSegments = version.slice(1).split('.').map(Number);

const NODE_VERSION_INFO = 'nodejs_version_info';

module.exports = (registry, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';
	const labels = config.labels ? config.labels : {};
	const labelNames = Object.keys(labels);

	const nodeVersionGauge = new Gauge({
		name: namePrefix + NODE_VERSION_INFO,
		help: 'Node.js version info.',
		labelNames: ['version', 'major', 'minor', 'patch'].concat(labelNames),
		registers: registry ? [registry] : undefined,
		aggregator: 'first',
	});

	return () => {
		const labelValues = [
			version,
			versionSegments[0],
			versionSegments[1],
			versionSegments[2],
		].concat(Object.values(labels));
		nodeVersionGauge.labels.apply(nodeVersionGauge, labelValues).set(1);
	};
};

module.exports.metricNames = [NODE_VERSION_INFO];
