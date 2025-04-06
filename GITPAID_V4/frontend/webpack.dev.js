const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    open: true,
    port: 5173, // Matching the GitHub callback URL port
    client: {
      overlay: true // Show application errors
    },
    historyApiFallback: {
      index: 'index.html'
    },
    static: './public',
    // Add proxy configuration to forward API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  
        secure: false,
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:8080',
        secure: false,
        changeOrigin: true
      }
    }
  },
  devtool: 'inline-source-map'
})