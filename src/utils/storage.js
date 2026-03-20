/* global chrome */

// 与 Chrome Storage 交互的工具函数

export async function getSites() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['blockedSites'], (data) => {
      resolve(data.blockedSites || [])
    })
  })
}

export async function saveSites(sites) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ blockedSites: sites }, () => {
      // 发送消息给后台脚本更新规则
      chrome.runtime.sendMessage(
        { type: 'UPDATE_RULES', sites },
        (response) => {
          resolve(response?.success || false)
        }
      )
    })
  })
}

export async function addSite(site) {
  const sites = await getSites()
  if (!sites.includes(site)) {
    sites.push(site)
    await saveSites(sites)
  }
  return sites
}

export async function removeSite(site) {
  const sites = await getSites()
  const filtered = sites.filter((s) => s !== site)
  await saveSites(filtered)
  return filtered
}
