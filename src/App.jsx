import React, { useState, useEffect } from 'react'
import { ShieldCheck, Lock, Unlock, Plus, Trash2 } from 'lucide-react'
import {
  getSites,
  addSite,
  removeSite,
  verifyManagementPassword,
  updateManagementPassword,
  getManagementPassword
} from './utils/storage'

function App() {
  const [isLocked, setIsLocked] = useState(true)
  const [password, setPassword] = useState('')
  const [sites, setSites] = useState([])
  const [newSite, setNewSite] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordEditor, setShowPasswordEditor] = useState(false)
  const [isDefaultPassword, setIsDefaultPassword] = useState(false)
  const [loading, setLoading] = useState(true)

  // 组件挂载时加载网站列表
  useEffect(() => {
    const loadSites = async () => {
      const loadedSites = await getSites()
      const savedPassword = await getManagementPassword()
      setSites(loadedSites)
      setIsDefaultPassword(savedPassword === '1234')
      setLoading(false)
    }

    loadSites()
  }, [])

  const handleUnlock = async () => {
    const verified = await verifyManagementPassword(password)

    if (verified) {
      setIsLocked(false)
      setPassword('')
    } else {
      alert('密码错误！')
    }
  }

  const handleUnlockKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !nextPassword || !confirmPassword) {
      alert('请填写完整的密码信息')
      return
    }

    if (nextPassword !== confirmPassword) {
      alert('两次输入的新密码不一致')
      return
    }

    const result = await updateManagementPassword(currentPassword, nextPassword)

    if (result.success) {
      setCurrentPassword('')
      setNextPassword('')
      setConfirmPassword('')
      setShowPasswordEditor(false)
      setIsDefaultPassword(false)
    }

    alert(result.message)
  }

  const handleAddSite = async () => {
    if (!newSite.trim()) {
      alert('请输入域名')
      return
    }
    
    // 验证域名格式
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainPattern.test(newSite.trim())) {
      alert('请输入有效的域名（例如：example.com）')
      return
    }

    const updatedSites = await addSite(newSite.trim())
    setSites(updatedSites)
    setNewSite('')
  }

  const handleRemoveSite = async (site) => {
    const updatedSites = await removeSite(site)
    setSites(updatedSites)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSite()
    }
  }

  return (
    <div className="w-[350px] min-h-[400px] bg-slate-50 p-6 font-sans text-slate-900">
      {/* 顶部标题栏 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">MindFence</h1>
      </div>

      {isLocked ? (
        /* 锁定状态：显示二级密码输入框 */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-slate-700">管理权限已锁定</h2>
            <p className="text-sm text-slate-400">请输入密码以修改拦截名单</p>
          </div>
          {isDefaultPassword && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
              当前是默认密码 1234，建议解锁后立即修改。
            </p>
          )}
          <input
            type="password"
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            placeholder="输入管理密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleUnlockKeyDown}
          />
          <button
            onClick={handleUnlock}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <Unlock size={18} /> 验证并解锁
          </button>
        </div>
      ) : (
        /* 解锁状态：显示黑名单管理界面 */
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="添加要拦截的域名..." 
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              onClick={handleAddSite}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-slate-400">加载中...</div>
          ) : sites.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">还没有拦截的网站</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {sites.map((site) => (
                <div key={site} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all">
                  <span className="text-sm font-medium text-slate-600">{site}</span>
                  <button 
                    onClick={() => handleRemoveSite(site)}
                    className="text-slate-300 hover:text-red-500 transition-colors active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <button
              onClick={() => setShowPasswordEditor((prev) => !prev)}
              className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors active:scale-95"
            >
              {showPasswordEditor ? '收起密码修改' : '点击修改管理密码'}
            </button>

            {showPasswordEditor && (
              <>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="当前密码"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                />
                <input
                  type="password"
                  value={nextPassword}
                  onChange={(e) => setNextPassword(e.target.value)}
                  placeholder="新密码（至少4位）"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="确认新密码"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  onClick={handleChangePassword}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors active:scale-95"
                >
                  更新密码
                </button>
              </>
            )}
          </div>

          <button 
            onClick={() => {
              setIsLocked(true)
              setShowPasswordEditor(false)
            }}
            className="w-full py-3 mt-4 text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
          >
            <Lock size={12} /> 重新锁定管理权限
          </button>
        </div>
      )}
    </div>
  )
}

export default App