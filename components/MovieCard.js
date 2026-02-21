'use client'
import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { createPublicClient, http, parseEther } from 'viem'
import { bscTestnet } from 'viem/chains'
import { WATCH_TOKEN_ADDRESS, WATCH_TOKEN_ABI, STREAMING_CONTRACT_ADDRESS, STREAMING_ABI } from '../lib/contracts'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://bsc-testnet-rpc.publicnode.com'),
})

export default function MovieCard({ movie, onWatch }) {
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    if (!address) return
    const checkAccess = async () => {
      try {
        const result = await publicClient.readContract({
          address: STREAMING_CONTRACT_ADDRESS,
          abi: STREAMING_ABI,
          functionName: 'hasAccess',
          args: [address, BigInt(movie.id)],
        })
        setHasAccess(result)
      } catch (err) {
        console.error('Access check error:', err)
      }
    }
    checkAccess()
  }, [address, movie.id])

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
            <button
              onClick={() => onWatch(movie)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg"
            >
              ▶ ดูเลย
            </button>
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
        </div>
      </div>
    </div>
  )
}