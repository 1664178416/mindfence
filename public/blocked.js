function getBlockedHost() {
  if (!document.referrer) {
    return ''
  }

  try {
    return new URL(document.referrer).host
  } catch {
    return ''
  }
}

const warningQuotes = [
  '你不能同时追两只兔子。',
  '凡事预则立，不预则废。',
  '与其临渊羡鱼，不如退而结网。',
  '拖延是最温柔的自我欺骗。',
  '真正的自由，是能控制自己的注意力。',
  '你今天的专注，会变成明天的底气。',
  '把时间花在哪里，人生就长在哪里。',
  '先完成，再完美。',
  '没有纪律，灵感只是借口。',
  '一时放纵，往往换来长久焦虑。',
  '真正拉开差距的，是无人监督时的选择。',
  '把每个 25 分钟守住，结果会替你说话。',
  '专注不是苦行，而是对目标的尊重。',
  '注意力是稀缺资产，请投资在重要的事上。'
]

function showRandomQuote() {
  const quoteText = document.getElementById('quoteText')
  if (!quoteText) {
    return
  }

  const randomIndex = Math.floor(Math.random() * warningQuotes.length)
  quoteText.textContent = warningQuotes[randomIndex]
}

function initBlockedPage() {
  const blockedHost = getBlockedHost()
  if (blockedHost) {
    const siteInfo = document.getElementById('siteInfo')
    if (siteInfo) {
      siteInfo.textContent = `已拦截：${blockedHost}`
    }
  }

  const refreshQuoteBtn = document.getElementById('refreshQuoteBtn')
  if (refreshQuoteBtn) {
    refreshQuoteBtn.addEventListener('click', showRandomQuote)
  }

  showRandomQuote()
}

document.addEventListener('DOMContentLoaded', initBlockedPage)
