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
  const extensionUrl = chrome.runtime.getURL('blocked.html')
  
  // 构建新的规则
  const newRules = sites.map((site, index) => {
    let cleanSite = site
    if (site.startsWith('*.')) {
      cleanSite = site.slice(2)
    }
    // 将域名转换为安全的正则表达式格式，比如 bilibili.com -> bilibili\.com
    const safeRegex = cleanSite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // 匹配该域名下的所有URL，注意转义：\在字符串里要写成\\
    const regexFilter = `^https?://([^/]+\\.)?${safeRegex}(/.*)?$`
    
    return {
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          regexSubstitution: `${extensionUrl}?url=\\0`
        }
      },
      condition: {
        regexFilter: regexFilter,
        resourceTypes: ['main_frame']
      }
    }
  })

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

  // 扫描并锁定已经被打开的对应网页标签
  lockExistingTabs(sites, extensionUrl)
}

async function lockExistingTabs(sites, extensionUrl) {
  try {
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) continue

      try {
        const tabUrl = new URL(tab.url)
        const tabHost = tabUrl.hostname

        const isBlocked = sites.some(site => {
          let cleanSite = site
          if (site.startsWith('*.')) {
            cleanSite = site.slice(2)
          }
          return tabHost === cleanSite || tabHost.endsWith('.' + cleanSite)
        })

        if (isBlocked) {
          chrome.tabs.update(tab.id, {
            url: `${extensionUrl}?url=${tab.url}`
          })
        }
      } catch (e) {
        // 忽略无法解析的URL
      }
    }
  } catch (error) {
    console.error('Failed to query tabs:', error)
  }
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
