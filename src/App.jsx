import React, { useState, useEffect } from 'react'
import { ShieldCheck, Lock, Unlock, Plus, Trash2 } from 'lucide-react'
import { getSites, addSite, removeSite } from './utils/storage'

function App() {
  const [isLocked, setIsLocked] = useState(true)
  const [password, setPassword] = useState('')
  const [sites, setSites] = useState([])
  const [newSite, setNewSite] = useState('')
  const [loading, setLoading] = useState(true)

  // 组件挂载时加载网站列表
  useEffect(() => {
    const loadSites = async () => {
      const loadedSites = await getSites()
      setSites(loadedSites)
      setLoading(false)
    }

    loadSites()
  }, [])

  const handleUnlock = () => {
    // 这里的 1234 就是你的二级密码
    if (password === '1234') {
      setIsLocked(false)
      setPassword('')
    } else {
      alert('密码错误！')
    }
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
          <input
            type="password"
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            placeholder="默认密码：1234"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <button 
            onClick={() => setIsLocked(true)}
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