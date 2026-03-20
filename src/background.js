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
      type: 'redirect',
      redirect: { extensionPath: '/blocked.html' }
    },
    condition: {
      urlFilter: site,
      resourceTypes: ['main_frame'],
      isUrlFilterCaseSensitive: false
    }
  }))

  // 使用 dynamic rules，确保重启浏览器后规则仍然存在
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const removeRuleIds = existingRules.map((rule) => rule.id)

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: newRules
    })
  } catch (error) {
    console.error('Failed to update rules:', error)
  }

  // 同时保存到 sync storage 做备份
  chrome.storage.sync.set({ blockedSites: sites })
}

function initializeRules() {
  chrome.storage.sync.get(['blockedSites', 'managementPassword'], (data) => {
    const sites = data.blockedSites && data.blockedSites.length > 0
      ? data.blockedSites
      : ['bilibili.com', 'weibo.com']

    if (!data.blockedSites) {
      chrome.storage.sync.set({ blockedSites: sites })
    }

    if (!data.managementPassword) {
      chrome.storage.sync.set({ managementPassword: '1234' })
    }

    updateRules(sites)
  })
}

// 扩展安装时初始化默认数据
chrome.runtime.onInstalled.addListener(() => {
  initializeRules()
})

// 浏览器重启后也自动恢复规则
chrome.runtime.onStartup.addListener(() => {
  initializeRules()
})
