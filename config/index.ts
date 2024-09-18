import path from 'path'

const config = {
  projectName: 'demo',
  date: '2024-9-18',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  alias: {
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    '@/static': path.resolve(__dirname, '..', 'src/static'),
    '@/stores': path.resolve(__dirname, '..', 'src/stores'),
  },
  framework: 'vue3',
  compiler: 'webpack5',
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  plugins: [
    '@tarojs/plugin-html',
    [
      '@tarojs/plugin-framework-vue3',
      {
        vueLoaderOption: {
          compilerOptions: {
            isCustomElement: (tag) => tag.includes('ec-canvas'),
            whitespace: 'preserve',
            // ...
          },
          reactivityTransform: true, // 开启vue3响应性语法糖
        },
      },
    ],
  ],
  // 给 sass-loader 传递选项 ！！！！ 按需加载方式必须配置
  sass: {
    data: `@import "@nutui/nutui-taro/dist/styles/variables.scss";`,
  },
  mini: {
    imageUrlLoaderOption: {
      limit: false,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    compile: {
      exclude: [path.resolve(__dirname, '..', 'src/components/ec-canvas/echarts.js')],
    },
    webpackChain(chain) {
      chain.merge({
        module: {
          rule: {
            mjsScript: {
              test: /\.mjs$/,
              include: [/pinia/],
              use: {
                babelLoader: {
                  loader: require.resolve('babel-loader')
                }
              }
            }
          }
        },

      })
      // ,chain.plugin('analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 256 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
