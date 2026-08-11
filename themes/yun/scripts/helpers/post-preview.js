'use strict'

const { escapeHTML, stripHTML, truncate } = require('hexo-util')

const BLOCK_PATTERN = /<(p|blockquote|pre|figure|ul|ol|h[2-4])\b[^>]*>[\s\S]*?<\/\1>/gi

function cleanPreviewHtml(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\s(?:id|onclick)=(['"])[\s\S]*?\1/gi, '')
    .replace(/<img(?![^>]*\sloading=)/gi, '<img loading="lazy"')
}

function buildPreview(source, maxChars, maxBlocks) {
  const blocks = []
  let textLength = 0
  let match
  let truncated = false
  let lastMatchEnd = 0

  BLOCK_PATTERN.lastIndex = 0
  while ((match = BLOCK_PATTERN.exec(source)) !== null) {
    lastMatchEnd = BLOCK_PATTERN.lastIndex
    const blockHtml = cleanPreviewHtml(match[0])
    const blockText = stripHTML(blockHtml).replace(/\s+/g, ' ').trim()
    const hasMedia = /<(?:img|video|audio)\b/i.test(blockHtml)

    if (!blockText && !hasMedia) continue
    if (blocks.length >= maxBlocks) {
      truncated = true
      break
    }

    const remaining = maxChars - textLength
    if (blockText.length > remaining) {
      if (remaining > 40) {
        const shortened = truncate(blockText, { length: remaining, omission: '…' })
        blocks.push(`<p>${escapeHTML(shortened)}</p>`)
      }
      truncated = true
      break
    }

    blocks.push(blockHtml)
    textLength += blockText.length
  }

  if (!blocks.length) {
    const plainText = stripHTML(source).replace(/\s+/g, ' ').trim()
    if (plainText) {
      truncated = plainText.length > maxChars
      blocks.push(`<p>${escapeHTML(truncate(plainText, { length: maxChars, omission: '…' }))}</p>`)
    }
  }

  if (!truncated && lastMatchEnd < source.length) {
    const remainingText = stripHTML(source.slice(lastMatchEnd)).trim()
    truncated = Boolean(remainingText)
  }

  return { html: blocks.join(''), truncated }
}

hexo.extend.helper.register('post_preview', function (post) {
  const options = this.theme?.post_card?.preview || {}
  if (options.enable === false)
    return { html: '', truncated: false }

  const maxChars = Number(options.max_chars) || 620
  const maxBlocks = Number(options.max_blocks) || 4
  const content = String(post.content || '')
  const excerpt = String(post.excerpt || '')
  const source = excerpt && stripHTML(excerpt).trim() ? excerpt : content
  const preview = buildPreview(source, maxChars, maxBlocks)

  if (excerpt && stripHTML(content).trim().length > stripHTML(excerpt).trim().length)
    preview.truncated = true

  return preview
})
