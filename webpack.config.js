var inProduction = process.env.NODE_ENV === 'production';

var path = require('path');
var glob = require('glob');

var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanWebpackPlugin = require('clean-webpack-plugin');
var PurifyCSSPlugin = require('purifycss-webpack');

var loadJS = function(file) {
  // DOM: Create the script element
  var jsElm = document.createElement("script");
  // set the type attribute
  jsElm.type = "application/javascript";
  // make the script element load file
  jsElm.src = file;
  // finally insert the element to the body element in order to load the script
  document.body.appendChild(jsElm);
}

// [chunkhash], [hash], [name], [ext]
module.exports = {
  // Where are original files
  entry: {
    app: './src/index.js',
  },
  // Where to store modified files
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        //https://github.com/webpack-contrib/extract-text-webpack-plugin
        
      },
      // Clean webpack plugin * npm i clean-webpack-plugin --save-dev

      {
        // npm install sass-loader node-sass --save-dev
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          // use: ['css-loader', 'sass-loader'],
          // Ignore image or we can use raw-loader or 
          use: [
            {
              loader:'css-loader',
              options: { url: false }
            },
            'sass-loader'
          ],
          fallback: 'style-loader' 
        })

      },

      { 
        // All .js files should be processed from babel,
        // but we could set settings like a .babelrc and Babel CLI
        // npm install --save-dev babel-preset-es2015
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    // puryfiCSSPlugin

    new ExtractTextPlugin('[name].css'),
    new webpack.LoaderOptionsPlugin({
      minimize: inProduction
    }),

    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, 'src/index.html')), // return everything in array in this path with .html app/*.html
      minimize: inProduction
    }),

    new CleanWebpackPlugin(['dist'], {
      root: __dirname,
      verbose: true,
      dry: false
    }),

    // minify js code for production purpose.
    // new webpack.optimize.UglifyJsPlugin()


    // Our custom plugin to load hased files, manifest.json give to us a lot of information
    function () {
      // When compileing is done
      this.plugin('done', stats => {
        // fs - file system
        require('fs').writeFileSync(
          path.join(__dirname, 'dist/manifest.json'),
          
          console.log('TESTING', JSON.stringify(stats.toJson().assetsByChunkName))
        )
      })
    }
  ]
};

// If we whant to change current ENV, we can do this with: NODE_ENV=production node_modules/.bin/webpack
if (inProduction) {
  // This part of code inport new webpack.optimize.UglifyJsPlugin() to plugins: []
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  );
}