'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { createPublicClient, http, parseEther } from 'viem'
import { bscTestnet } from 'viem/chains'
import { WATCH_TOKEN_ADDRESS, WATCH_TOKEN_ABI, STREAMING_CONTRACT_ADDRESS, STREAMING_ABI } from '../lib/contracts'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://bsc-testnet-rpc.publicnode.com'),
})

const getTimeLeft = (expiry) => {
  const diff = Number(expiry) * 1000 - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `เหลือ ${days}วัน ${hours}ชม ${mins}นาที`
  if (hours > 0) return `เหลือ ${hours}ชม ${mins}นาที`
  return `เหลือ ${mins}นาที`
}

export default function MovieCard({ movie, onWatch }) {
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [inMyList, setInMyList] = useState(false)
  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    if (!address) return
    const checkMyList = async () => {
      const { data } = await supabase
        .from('watchlist')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .eq('movie_id', movie.id)
        .single()
      setInMyList(!!data)
    }
    checkMyList()
  }, [address, movie.id])

  const toggleMyList = async () => {
    if (!address) return
    if (inMyList) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('wallet_address', address.toLowerCase())
        .eq('movie_id', movie.id)
      setInMyList(false)
    } else {
      await supabase
        .from('watchlist')
        .insert({ wallet_address: address.toLowerCase(), movie_id: movie.id })
      setInMyList(true)
    }
  }

  const handleApproveAndBuy = async (type) => {
    try {
      setLoading(true)
      const amount = type === 'buy' ? parseEther('40') : parseEther('20')

      await writeContractAsync({
        address: WATCH_TOKEN_ADDRESS,
        abi: WATCH_TOKEN_ABI,
        functionName: 'approve',
        args: [STREAMING_CONTRACT_ADDRESS, amount],
      })

      if (type === 'buy') {
        await writeContractAsync({
          address: STREAMING_CONTRACT_ADDRESS,
          abi: STREAMING_ABI,
          functionName: 'buyMovie',
          args: [BigInt(movie.id)],
        })
      } else {
        await writeContractAsync({
          address: STREAMING_CONTRACT_ADDRESS,
          abi: STREAMING_ABI,
          functionName: 'rentMovie',
          args: [BigInt(movie.id)],
        })
      }

      setHasAccess(true)
      alert(type === 'buy' ? 'ซื้อสำเร็จ!' : 'เช่าสำเร็จ!')
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200">
      <img
        src={movie.thumbnail_url}
        alt={movie.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = `https://placehold.co/400x300/1a1a2e/white?text=${encodeURIComponent(movie.title)}`
        }}
      />
      <div className="p-4">
        <h3 className="text-white font-bold text-lg">{movie.title}</h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{movie.description}</p>
        <div className="flex gap-2 mt-2">
          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{movie.genre}</span>
          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{movie.duration_minutes} นาที</span>
        </div>

        <div className="mt-4 space-y-2">
          {hasAccess ? (
            <div>
              <button
                onClick={() => onWatch(movie)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg"
              >
                ▶ ดูเลย
              </button>
              {timeLeft && (
                <p className="text-yellow-400 text-xs text-center mt-2">{timeLeft}</p>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => handleApproveAndBuy('buy')}
                disabled={loading || !isConnected}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'กำลังดำเนินการ...' : `ซื้อ ${movie.buy_price} WATCH`}
              </button>
              <button
                onClick={() => handleApproveAndBuy('rent')}
                disabled={loading || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'กำลังดำเนินการ...' : `เช่า ${movie.rent_price} WATCH`}
              </button>
            </>
          )}

          {/* My List Button */}
          <button
            onClick={toggleMyList}
            disabled={!isConnected}
            className={`w-full font-bold py-2 rounded-lg text-sm disabled:opacity-50 ${
              inMyList
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {inMyList ? '✅ อยู่ใน My List' : '+ เพิ่มใน My List'}
          </button>
        </div>
      </div>
    </div>
  )
}