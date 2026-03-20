/* global chrome */

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_RULES') {
    updateRules(request.sites)
    sendResponse({ success: true })
  } else if (request.type === 'GET_SITES') {
    chrome.storage.sync.get(['blockedSites'], (data) => {
      sendResponse({ sites: data.blockedSites || [] })
    })
    return true // 异步响应
  }
})

// 更新 declarativeNetRequest 规则
async function updateRules(sites) {
  // 构建新的规则
  const newRules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'block',
      // 或使用 'redirect' 并指向拦截页面
      // type: 'redirect',
      // redirect: { extensionPath: '/blocked.html' }
    },
    condition: {
      urlFilter: site,
      resourceTypes: ['main_frame'],
      isUrlFilterCaseSensitive: false
    }
  }))

  // 保存规则到 storage（因为 declarativeNetRequest 需要静态规则）
  // 我们使用 session storage 来动态管理
  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1),
      addRules: newRules
    })
  } catch (error) {
    console.error('Failed to update rules:', error)
  }

  // 同时保存到 sync storage 做备份
  chrome.storage.sync.set({ blockedSites: sites })
}

// 扩展安装时初始化默认数据
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedSites'], (data) => {
    if (!data.blockedSites) {
      const defaultSites = ['bilibili.com', 'weibo.com']
      chrome.storage.sync.set({ blockedSites: defaultSites })
      updateRules(defaultSites)
    }
  })
})
