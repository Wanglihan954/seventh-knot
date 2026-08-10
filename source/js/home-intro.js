(() => {
  let loadingTimer
  let revealTimer

  const initHomeSequence = () => {
    const sequence = document.getElementById('home-sequence')
    if (!sequence) return

    window.clearTimeout(loadingTimer)
    window.clearTimeout(revealTimer)
    sequence.classList.remove('home-sequence--loading')
    sequence.classList.remove('home-sequence--profile')

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const loadingDelay = reduceMotion ? 0 : 2200
    const revealDelay = reduceMotion ? 0 : 4000

    loadingTimer = window.setTimeout(() => {
      sequence.classList.add('home-sequence--loading')
    }, loadingDelay)

    revealTimer = window.setTimeout(() => {
      sequence.classList.remove('home-sequence--loading')
      sequence.classList.add('home-sequence--profile')
    }, revealDelay)

    sequence.querySelector('.home-profile__down')?.addEventListener('click', (event) => {
      const articles = document.getElementById('recent-posts')
      if (!articles) return
      event.preventDefault()
      articles.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }, { once: true })
  }

  document.addEventListener('DOMContentLoaded', initHomeSequence)
  document.addEventListener('pjax:success', initHomeSequence)
})()
