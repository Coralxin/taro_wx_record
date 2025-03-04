function PCMPlayer(option) {
  this.init(option)
}

PCMPlayer.prototype.init = function (option) {
  console.log('pcm init')
  const defaults = {
    encoding: '16bitInt',
    channels: 1,
    sampleRate: 8000,
    flushingTime: 1000
  }
  this.option = Object.assign({}, defaults, option)
  this.samples = new Float32Array()
  this.flush = this.flush.bind(this)
  // console.log('this.flush', this.flush, this.samples.length)
  this.interval = setInterval(this.flush, this.option.flushingTime)
  this.maxValue = this.getMaxValue()
  this.typedArray = this.getTypedArray()
  this.createContext()
}

PCMPlayer.prototype.getMaxValue = function () {
  const encodings = {
    '8bitInt': 128,
    '16bitInt': 32768,
    '32bitInt': 2147483648,
    '32bitFloat': 1
  }

  return encodings[this.option.encoding] ? encodings[this.option.encoding] : encodings['16bitInt']
}

PCMPlayer.prototype.getTypedArray = function () {
  const typedArrays = {
    '8bitInt': Int8Array,
    '16bitInt': Int16Array,
    '32bitInt': Int32Array,
    '32bitFloat': Float32Array
  }

  return typedArrays[this.option.encoding] ? typedArrays[this.option.encoding] : typedArrays['16bitInt']
}

PCMPlayer.prototype.createContext = function () {
  this.audioCtx = wx.createWebAudioContext()
  // console.log('---this.audioCtx', this.audioCtx)
  // this.audioCtx.state !== 'suspended' && this.audioCtx.suspend()
  this.gainNode = this.audioCtx.createGain()
  // console.log('---this.gainNode', this.gainNode)
  this.gainNode.gain.value = 1
  this.gainNode.connect(this.audioCtx.destination)
  // console.log('---this.gainNode.connect')
  this.startTime = this.audioCtx.currentTime
}

PCMPlayer.prototype.isTypedArray = function (data) {
  // console.log(data.buffer.constructor == ArrayBuffer,typeof data.buffer.constructor, '--', data.byteLength, '--', data.buffer, '--', data.buffer.constructor)
  return (data.byteLength && data.buffer)
}

PCMPlayer.prototype.feed = function (data) {
  if (!this.isTypedArray(data)) return
  // console.log('feed', new Date(), Date.now(), data, data.length)
  data = this.getFormatedValue(data)
  const tmp = new Float32Array(this.samples.length + data.length)
  tmp.set(this.samples, 0)
  tmp.set(data, this.samples.length)
  this.samples = tmp
}

PCMPlayer.prototype.getFormatedValue = function (data) {
  var data = new this.typedArray(data.buffer)
  const float32 = new Float32Array(data.length)
  let i

  for (i = 0; i < data.length; i++) {
    float32[i] = data[i] / this.maxValue
  }
  return float32
}

PCMPlayer.prototype.volume = function (volume) {
  this.gainNode.gain.value = volume
}

PCMPlayer.prototype.destroy = function () {
  console.log('destroy')
  if (this.interval) {
    clearInterval(this.interval)
  }
  this.samples = null
  if (this.audioCtx) this.audioCtx.close()
  this.audioCtx = null
}

PCMPlayer.prototype.flush = function () {
  // console.log('flush', this.samples.length)
  if (!this.samples.length) return
  const bufferSource = this.audioCtx.createBufferSource()
  const length = this.samples.length / this.option.channels
  const audioBuffer = this.audioCtx.createBuffer(this.option.channels, length, this.option.sampleRate)
  let audioData
  let channel
  let offset
  let i
  let decrement

  for (channel = 0; channel < this.option.channels; channel++) {
    audioData = audioBuffer.getChannelData(channel)
    offset = channel
    decrement = 50
    for (i = 0; i < length; i++) {
      audioData[i] = this.samples[offset]
      /* fadein */
      if (i < 50) {
        audioData[i] = (audioData[i] * i) / 50
      }
      /* fadeout */
      if (i >= (length - 51)) {
        audioData[i] = (audioData[i] * decrement--) / 50
      }
      offset += this.option.channels
    }
  }

  if (this.startTime < this.audioCtx.currentTime) {
    this.startTime = this.audioCtx.currentTime
  }
  // console.log('start vs current ' + this.startTime + ' vs ' + this.audioCtx.currentTime + ' duration: ' + audioBuffer.duration);
  bufferSource.buffer = audioBuffer
  bufferSource.connect(this.gainNode)
  bufferSource.start(this.startTime)
  this.startTime += audioBuffer.duration
  this.samples = new Float32Array()
}

export default PCMPlayer
