/* Lightweight Vue 2 / ElementUI notification replacement for Fomalhaut. */
(() => {
  const styleId = 'fomal-notification-style'
  const stacks = new Map()

  const ensureStyle = () => {
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `.fomal-notification{position:fixed;z-index:2147483000;box-sizing:border-box;width:330px;max-width:calc(100vw - 32px);padding:14px 38px 14px 16px;border-radius:8px;color:#303133;background:rgba(255,255,255,.96);box-shadow:0 2px 12px rgba(0,0,0,.12);backdrop-filter:blur(8px);transition:opacity .28s ease,transform .28s ease}.fomal-notification--dark{color:#e5e7eb;background:rgba(31,31,31,.96)}.fomal-notification--success{border-left:4px solid #67c23a}.fomal-notification--warning{border-left:4px solid #e6a23c}.fomal-notification__title{margin:0 0 6px;font-size:16px;font-weight:700}.fomal-notification__message{margin:0;font-size:13px;line-height:1.5}.fomal-notification__close{position:absolute;top:10px;right:12px;padding:0;border:0;color:inherit;background:transparent;font-size:20px;line-height:1;cursor:pointer;opacity:.65}.fomal-notification__close:hover{opacity:1}@media(max-width:480px){.fomal-notification{left:16px!important;right:16px!important;width:auto}}`
    document.head.appendChild(style)
  }

  window.fomalNotify = (options = {}) => {
    ensureStyle()
    const element = document.createElement('section')
    const dark = document.documentElement.getAttribute('data-theme') === 'dark'
    const position = options.position || 'top-right'
    const offset = Number(options.offset) || 16
    const stack = stacks.get(position) || []
    const stackOffset = stack.reduce((total, item) => total + item.offsetHeight + 12, offset)

    element.className = `fomal-notification fomal-notification--${options.type || 'success'}${dark ? ' fomal-notification--dark' : ''}`
    element.innerHTML = `<h2 class="fomal-notification__title"></h2><p class="fomal-notification__message"></p>${options.showClose === false ? '' : '<button class="fomal-notification__close" type="button" aria-label="Close">×</button>'}`
    element.querySelector('.fomal-notification__title').textContent = options.title || ''
    const message = element.querySelector('.fomal-notification__message')
    if (options.dangerouslyUseHTMLString || options.html) message.innerHTML = options.message || ''
    else message.textContent = options.message || ''

    if (position.endsWith('left')) element.style.left = `${offset}px`
    else element.style.right = `${offset}px`
    if (position.startsWith('bottom')) element.style.bottom = `${stackOffset}px`
    else element.style.top = `${stackOffset}px`
    document.body.appendChild(element)
    stack.push(element)
    stacks.set(position, stack)

    const close = () => {
      if (!element.parentNode) return
      const index = stack.indexOf(element)
      if (index >= 0) stack.splice(index, 1)
      element.style.opacity = '0'
      element.style.transform = position.startsWith('bottom') ? 'translateY(8px)' : 'translateY(-8px)'
      window.setTimeout(() => element.remove(), 280)
    }
    element.querySelector('.fomal-notification__close')?.addEventListener('click', close)
    const duration = options.duration === undefined ? 4500 : Number(options.duration)
    if (duration > 0) window.setTimeout(close, duration)
  }

  // Keeps the existing ten call sites compact without loading Vue.
  window.fomalNotificationBridge = (options) => options.data.call({ $notify: window.fomalNotify })
})()