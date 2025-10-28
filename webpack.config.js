const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'woocommerce-integration': path.resolve(process.cwd(), 'src/woocommerce', 'woocommerce-integration.js'),
	},
	plugins: [
		...defaultConfig.plugins.filter(
			plugin => !(plugin instanceof DependencyExtractionWebpackPlugin)
		),
		new DependencyExtractionWebpackPlugin({
			requestToExternal(request) {
				if (request === 'jquery') {
					return 'jQuery';
				}
			},
			requestToHandle(request) {
				if (request === 'jquery') {
					return 'jquery';
				}
			},
		}),
	],
};
