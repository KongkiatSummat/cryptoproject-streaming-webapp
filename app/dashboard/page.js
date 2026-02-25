'use client'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, formatEther } from 'viem'
import { bscTestnet } from 'viem/chains'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { STREAMING_CONTRACT_ADDRESS, STREAMING_ABI, WATCH_TOKEN_ADDRESS } from '../../lib/contracts'
import Navbar from '../../components/Navbar'

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

const getTimeLeft = (expiry) => {
  const diff = Number(expiry) * 1000 - Date.now()
  if (diff <= 0) return 'หมดอายุแล้ว'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `เหลือ ${days}วัน ${hours}ชม`
  if (hours > 0) return `เหลือ ${hours}ชม ${mins}นาที`
  return `เหลือ ${mins}นาที`
}

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [balance, setBalance] = useState('0')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subExpiry, setSubExpiry] = useState(null)
  const [ownedMovies, setOwnedMovies] = useState([])
  const [rentedMovies, setRentedMovies] = useState([])
  const [movies, setMovies] = useState([])
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!address) return
    fetchAll()
  }, [address])

  const fetchAll = async () => {
    try {
      // ดึงหนังทั้งหมด
      const { data } = await supabase.from('movies').select('*')
      setMovies(data || [])

      // balance
      const bal = await publicClient.readContract({
        address: WATCH_TOKEN_ADDRESS,
        abi: BALANCE_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      setBalance(Number(formatEther(bal)).toLocaleString())

      // subscription
      const subExp = await publicClient.readContract({
        address: STREAMING_CONTRACT_ADDRESS,
        abi: STREAMING_ABI,
        functionName: 'subscriptionExpiry',
        args: [address],
      })
      const subActive = Number(subExp) * 1000 > Date.now()
      setIsSubscribed(subActive)
      if (subActive) setSubExpiry(subExp)

      // เช็คหนังที่ซื้อและเช่า
      const owned = []
      const rented = []
      for (const movie of data || []) {
        const isOwned = await publicClient.readContract({
          address: STREAMING_CONTRACT_ADDRESS,
          abi: STREAMING_ABI,
          functionName: 'movieOwned',
          args: [address, BigInt(movie.id)],
        })
        if (isOwned) owned.push(movie)

        const rentExp = await publicClient.readContract({
          address: STREAMING_CONTRACT_ADDRESS,
          abi: STREAMING_ABI,
          functionName: 'rentExpiry',
          args: [address, BigInt(movie.id)],
        })
        if (Number(rentExp) * 1000 > Date.now()) {
          rented.push({ ...movie, rentExpiry: rentExp })
        }
      }
      setOwnedMovies(owned)
      setRentedMovies(rented)

    } catch (err) {
      console.error(err)
    }
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">👤 Dashboard</h1>

        {/* Wallet Info */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">💼 Wallet</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Address</p>
              <p className="text-white font-mono text-sm mt-1">{address?.slice(0, 10)}...{address?.slice(-8)}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">WATCH Balance</p>
              <p className="text-yellow-400 font-bold text-xl mt-1">{balance} WATCH</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className={`rounded-xl p-6 mb-6 ${isSubscribed ? 'bg-green-900' : 'bg-gray-800'}`}>
          <h2 className="text-xl font-bold mb-2">👑 Subscription</h2>
          {isSubscribed ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-300 font-semibold">✅ Active</p>
                <p className="text-green-400 text-sm mt-1">{getTimeLeft(subExpiry)}</p>
                <p className="text-gray-400 text-xs mt-1">
                  หมดอายุ {new Date(Number(subExpiry) * 1000).toLocaleDateString('th-TH')}
                </p>
              </div>
              <span className="text-5xl">🎬</span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-400">ยังไม่ได้สมัคร Subscription</p>
              <button
                onClick={() => router.push('/')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg"
              >
                สมัครเลย
              </button>
            </div>
          )}
        </div>

        {/* Owned Movies */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🎥 หนังที่ซื้อแล้ว ({ownedMovies.length})</h2>
          {ownedMovies.length === 0 ? (
            <p className="text-gray-400">ยังไม่มีหนังที่ซื้อครับ</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ownedMovies.map(movie => (
                <div key={movie.id} className="bg-gray-700 rounded-lg p-3 flex gap-3 items-center">
                  <img src={movie.thumbnail_url} className="w-12 h-12 rounded object-cover" 
                    onError={(e) => e.target.src = `https://placehold.co/48x48/1a1a2e/white?text=🎬`}
                  />
                  <div>
                    <p className="text-white text-sm font-semibold line-clamp-1">{movie.title}</p>
                    <p className="text-green-400 text-xs">✅ ซื้อแล้ว</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rented Movies */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">⏳ หนังที่เช่าอยู่ ({rentedMovies.length})</h2>
          {rentedMovies.length === 0 ? (
            <p className="text-gray-400">ไม่มีหนังที่เช่าอยู่ครับ</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {rentedMovies.map(movie => (
                <div key={movie.id} className="bg-gray-700 rounded-lg p-3 flex gap-3 items-center">
                  <img src={movie.thumbnail_url} className="w-12 h-12 rounded object-cover"
                    onError={(e) => e.target.src = `https://placehold.co/48x48/1a1a2e/white?text=🎬`}
                  />
                  <div>
                    <p className="text-white text-sm font-semibold line-clamp-1">{movie.title}</p>
                    <p className="text-yellow-400 text-xs">{getTimeLeft(movie.rentExpiry)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
        >
          ← กลับหน้าหลัก
        </button>
      </div>
    </main>
  )
}