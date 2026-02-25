'use client'
import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { createPublicClient, http, formatEther } from 'viem'
import { bscTestnet } from 'viem/chains'
import { WATCH_TOKEN_ADDRESS, STREAMING_CONTRACT_ADDRESS, STREAMING_ABI } from '../../lib/contracts'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://bsc-testnet-rpc.publicnode.com'),
})

const BALANCE_ABI = [{
  name: 'balanceOf',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: 'owner', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}]

export default function SettingsPage() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [savedUsername, setSavedUsername] = useState('')
  const [balance, setBalance] = useState('0')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subExpiry, setSubExpiry] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!address) return

    // โหลด username จาก localStorage
    const name = localStorage.getItem(`username_${address}`) || ''
    setUsername(name)
    setSavedUsername(name)

    fetchData()
  }, [address])

    const fetchData = async () => {
    try {
        const bal = await publicClient.readContract({
        address: WATCH_TOKEN_ADDRESS,
        abi: BALANCE_ABI,
        functionName: 'balanceOf',
        args: [address],
        })
        setBalance(Number(formatEther(bal)).toLocaleString())

        const subExp = await publicClient.readContract({
        address: STREAMING_CONTRACT_ADDRESS,
        abi: STREAMING_ABI,
        functionName: 'subscriptionExpiry',
        args: [address],
        })
        const subActive = Number(subExp) * 1000 > Date.now()
        setIsSubscribed(subActive)
        if (subActive) setSubExpiry(subExp)

        // โหลด username จาก Supabase
        const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('wallet_address', address.toLowerCase())
        .single()

        if (data?.username) {
        setUsername(data.username)
        setSavedUsername(data.username)
        }
    } catch (err) {
        console.error(err)
    }
    }

    const handleSaveUsername = async () => {
    if (!address) return
    await supabase
        .from('profiles')
        .upsert({ wallet_address: address.toLowerCase(), username })
    setSavedUsername(username)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    }

  const handleClearMyList = () => {
    if (!address) return
    if (confirm('ต้องการล้าง My List ทั้งหมดไหมครับ?')) {
      localStorage.removeItem(`mylist_${address}`)
      alert('ล้าง My List แล้วครับ!')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  if (!mounted) return null

  if (!isConnected) return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-400 text-xl">กรุณา Connect MetaMask ก่อนครับ</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">⚙️ Settings</h1>

        {/* Profile */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👤 Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">ชื่อที่แสดง</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ใส่ชื่อของคุณ..."
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleSaveUsername}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl"
                >
                  {saved ? '✅ บันทึกแล้ว' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">💼 Wallet Info</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
              <span className="text-gray-400">Address</span>
              <span className="text-white font-mono text-sm">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
              <span className="text-gray-400">WATCH Balance</span>
              <span className="text-yellow-400 font-bold">{balance} WATCH</span>
            </div>
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
              <span className="text-gray-400">Subscription</span>
              <span className={isSubscribed ? 'text-green-400 font-bold' : 'text-red-400'}>
                {isSubscribed ? `✅ Active ถึง ${new Date(Number(subExpiry) * 1000).toLocaleDateString('th-TH')}` : '❌ ไม่ได้สมัคร'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
              <span className="text-gray-400">Network</span>
              <span className="text-blue-400 font-bold">BSC Testnet</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🗂️ จัดการข้อมูล</h2>
          <div className="space-y-3">
            <button
              onClick={handleClearMyList}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl text-left px-4"
            >
              🗑️ ล้าง My List ทั้งหมด
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(`username_${address}`)
                setUsername('')
                setSavedUsername('')
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl text-left px-4"
            >
              🗑️ ล้างชื่อ Profile
            </button>
          </div>
        </div>

        {/* Disconnect */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">🔌 Wallet</h2>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </main>
  )
}