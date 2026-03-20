/* global chrome */

// 与 Chrome Storage 交互的工具函数
const DEFAULT_MANAGEMENT_PASSWORD = '1234'

export async function getSites() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['blockedSites'], (data) => {
      resolve(data.blockedSites || [])
    })
  })
}

export async function getManagementPassword() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['managementPassword'], (data) => {
      if (data.managementPassword) {
        resolve(data.managementPassword)
        return
      }

      chrome.storage.sync.set(
        { managementPassword: DEFAULT_MANAGEMENT_PASSWORD },
        () => {
          resolve(DEFAULT_MANAGEMENT_PASSWORD)
        }
      )
    })
  })
}

export async function verifyManagementPassword(password) {
  const savedPassword = await getManagementPassword()
  return password === savedPassword
}

export async function updateManagementPassword(currentPassword, newPassword) {
  const savedPassword = await getManagementPassword()

  if (currentPassword !== savedPassword) {
    return { success: false, message: '当前密码错误' }
  }

  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: '新密码至少需要 4 位' }
  }

  return new Promise((resolve) => {
    chrome.storage.sync.set({ managementPassword: newPassword }, () => {
      resolve({ success: true, message: '密码修改成功' })
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
