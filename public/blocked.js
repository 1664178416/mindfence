function getOriginalUrl() {
  const search = window.location.search
  if (search.startsWith('?url=')) {
    return search.substring(5) + window.location.hash
  }
  return document.referrer || ''
}

function getBlockedHost() {
  const url = getOriginalUrl()
  if (!url) {
    return ''
  }

  try {
    return new URL(url).host
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

// 检查当前网站是否还在屏蔽列表中
async function checkIfStillBlocked() {
  const blockedHost = getBlockedHost()
  if (!blockedHost) {
    return false
  }

  try {
    // 通过扩展消息获取当前屏蔽列表
    const response = await chrome.runtime.sendMessage({ type: 'GET_SITES' })
    const blockedSites = response.sites || []

    // 检查当前域名是否还在屏蔽列表中
    return blockedSites.some(site => {
      let cleanSite = site
      if (site.startsWith('*.')) {
        cleanSite = site.slice(2)
      }
      
      // blockedHost 可能是 www.weibo.com，site 是 weibo.com
      // 我们需要判断 blockedHost 是否完全等于 cleanSite，或者以 '.cleanSite' 结尾
      return blockedHost === cleanSite || blockedHost.endsWith('.' + cleanSite)
    })
  } catch (error) {
    console.error('检查屏蔽状态失败:', error)
    return true // 出错时默认认为仍在屏蔽
  }
}

// 自动检查并跳转
async function autoCheckAndRedirect() {
  const isStillBlocked = await checkIfStillBlocked()
  if (!isStillBlocked) {
    const originalUrl = getOriginalUrl()
    // 如果不再被屏蔽，跳转回原页面
    if (originalUrl) {
      window.location.replace(originalUrl)
    }
  }
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

  // 监听存储变化（当从设置中移除屏蔽网站时触发）
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.blockedSites) {
        autoCheckAndRedirect()
      }
    })
  }

  // 页面加载后立即检查一次，以防在此期间配置已改变
  setTimeout(() => {
    // 只有在没被屏蔽才跳转，不刷新
    autoCheckAndRedirect()
  }, 100)
}

document.addEventListener('DOMContentLoaded', initBlockedPage)
