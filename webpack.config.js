const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	output: {
		path: __dirname,
		publicPath: '/',
		filename: 'dist/build.js',
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.css$/,
				use: [
					'vue-style-loader',
					{
						loader: 'css-loader',
						options: {
							esModule: false,
						},
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					{
						loader: 'css-loader',
						options: {
							esModule: false,
						},
					},
					'sass-loader',
				],
			},
			{
				test: /\.sass$/,
				use: [
					'vue-style-loader',
					{
						loader: 'css-loader',
						options: {
							esModule: false,
						},
					},
					'sass-loader?indentedSyntax',
				],
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(?:png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					esModule: false,
					name: '[name].[ext]?[hash]',
				},
			},
		],
	},
	resolve: {
		alias: {
			vue$: 'vue/dist/vue.esm.js',
		},
		extensions: ['*', '.js', '.vue', '.json'],
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		overlay: true,
		open: true,
		hot: true,
	},
	performance: {
		hints: false,
	},
	devtool: 'eval-source-map',
	plugins: [
		new VueLoaderPlugin(),
	],
};

if (process.env.NODE_ENV === 'production') {
	module.exports.mode = 'production';
	module.exports.devtool = 'source-map';
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	]);
}
