(async () => {
  const { default: Barnone } = await import(location.protocol === 'http:' ? './build/barnone.js' : 'https://cdn.jsdelivr.net/npm/barnone.js/dist/barnone.min.js')
  const bar = new Barnone()

  window.bar = bar

  document.querySelector('.btn-start').addEventListener('click', () => {
    bar.start()
  })

  document.querySelector('.btn-stop').addEventListener('click', () => {
    bar.stop()
  })
})()
