import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Taro from '@tarojs/taro'


const App = createApp({
  onShow(options) {
   
  },
  onLoad(options) {
    // 设置是否保存常量状态
    Taro.setKeepScreenOn({
      keepScreenOn: false,
    })
    Taro.setInnerAudioOption({
      mixWithOther: false, // 是否与其他音频混播，设置为 true 之后，不会终止其他应用或微信内的音乐
      obeyMuteSwitch: false, // （仅在 iOS 生效）是否遵循静音开关，设置为 false 之后，即使是在静音模式下，也能播放声音
    })
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

App.use(createPinia())


export default App
