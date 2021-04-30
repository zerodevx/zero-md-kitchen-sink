import Tweezer from 'tweezer.js'
import TheilSenRegression from 'ml-regression-theil-sen'
import mean from 'ml-array-mean'

const Linear = (t, b, c, d) => c * t / d + b

let cnt = 0

const css = (scope, color) => `
<style data-scope="${scope}">
.${scope} {
  display: block;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: transparent;
  z-index: 9999;
}
.${scope}::-webkit-progress-bar {
  background: transparent;
}
.${scope}::-webkit-progress-value {
  background: ${color};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.${scope}::-moz-progress-bar {
  background: ${color};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
`

export default class Barnone {
  constructor (options) {
    this.opts = {
      target: document.body,
      color: '#1C75BC',
      initial: 4000,
      manual: false,
      ...options
    }
    this.scope = `_bar-${cnt++}`
    document.head.insertAdjacentHTML('beforeend', css(this.scope, this.opts.color))
    this.node = document.createElement('progress')
    this.node.classList.add(this.scope)
    this.node.id = this.opts.id || ''
    this.node.value = 0
    this.data = []
    this.next = this.opts.initial
    if (!this.opts.manual) {
      this.listen()
    }
  }

  attach () {
    this.opts.target.appendChild(this.node)
  }

  detach () {
    this.node.remove()
    this.node.value = 0
  }

  tick () {
    return new Promise(resolve => requestAnimationFrame(resolve))
  }

  listen () {
    window.addEventListener('popstate', () => {
      this.start()
    })
    this.po = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'fetch') {
          this.stop()
        }
      }
    })
    this.po.observe({ type: 'resource', buffered: true })
  }

  // Prediction model to guess next duration
  predict () {
    if (this.data.length < 5) {
      this.next = mean(this.data)
    } else {
      const regression = new TheilSenRegression([...Array(this.data.length).keys()], this.data)
      window.r = regression
      this.next = regression.predict(this.data.length)
      console.log(this.next)
    }
  }

  async go (val, duration) {
    if (this.tweening) {
      this.tween.stop()
      await this.tick()
    }
    if (!this.node.value) this.attach()
    this.tweening = true
    return new Promise(resolve => {
      this.tween = new Tweezer({
        decimal: true,
        start: this.node.value,
        end: val,
        duration: duration || 100,
        easing: Linear
      }).on('tick', v => {
        this.node.value = v
      }).on('done', () => {
        if (val === 1 || val === 0) {
          this.detach()
        }
        this.tweening = false
        resolve()
      }).begin()
    })
  }

  async start () {
    if (this.started) return
    this.started = Date.now()
    let val = 0
    while (this.started) {
      await this.go(0.8 * (1 - val) + val, this.next)
      val = this.node.value
    }
  }

  async stop () {
    if (!this.started) return
    this.data.push(Date.now() - this.started)
    this.started = 0
    await this.go(1)
    this.predict()
  }
}
