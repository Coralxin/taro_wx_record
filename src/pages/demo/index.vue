<template>
  <view>
    <button v-if="!isPlaying"
            @click="startRecord">录音</button>
    <button v-else
            @click="stopRecord">结束</button>

    <button :disabled="!(buffers.length >0 && !isPlaying)"
            @click="playRecord">播放</button>
  </view>
</template>

<script setup
        lang="ts">
        import './index.scss'
        import { ref } from 'vue'
        import Taro from '@tarojs/taro'
        import PCMPlayer from '../../pcm-player'

        const isPlaying = ref(false)
        let recorderManager = ref()
        let buffers: any = ref([])
        let player: any = ref('')

        const stopRecord = () => {
          recorderManager.value.stop()
          isPlaying.value = false
        }

        const startRecord = () => {
          player.value && player.value.destroy()
          buffers.value = []
          isPlaying.value = true
          const options = {
            duration: 10 * 60 * 1000,
            sampleRate: 8000,
            numberOfChannels: 1,
            format: 'PCM',
            frameSize: 2
          }
          recorderManager.value = Taro.getRecorderManager()
          if (!recorderManager.value) return
          recorderManager.value.start(options)

          recorderManager.value.onStart(() => {
            console.log('坐席说话 start')

            player = new PCMPlayer({
              encoding: '16bitInt',
              channels: 1,
              sampleRate: 8000,
              flushingTime: 1
            })
          })


          recorderManager.value.onFrameRecorded((res) => {
            const {
              frameBuffer,
              isLastFrame
            } = res
            if (isLastFrame) return
            buffers.value.push(frameBuffer)
          })

          recorderManager.value.onStop((res) => {
            console.log('说话onStop', res)

          })
        }
        const playRecord = () => {
          try {
            buffers.value.forEach(value => {
              player && player.feed(new Int16Array(value))
            });
          } catch (e) {
            console.warn('robot play error:', e)
          }
        }
</script>
<style>
button {
  width: 80%;
  margin: 10px auto;
}

button[disabled] {
  color: hsl(0deg 0% 52% / 60%);
}
</style>