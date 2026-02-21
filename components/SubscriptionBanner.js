'use client'
import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { WATCH_TOKEN_ADDRESS, WATCH_TOKEN_ABI, STREAMING_CONTRACT_ADDRESS, STREAMING_ABI } from '../lib/contracts'

export default function SubscriptionBanner() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)

  const { data: isSubscribed, refetch } = useReadContract({
    address: STREAMING_CONTRACT_ADDRESS,
    abi: STREAMING_ABI,
    functionName: 'isSubscribed',
    args: [address],
    query: { enabled: !!address }
  })

  const { data: expiry } = useReadContract({
    address: STREAMING_CONTRACT_ADDRESS,
    abi: STREAMING_ABI,
    functionName: 'subscriptionExpiry',
    args: [address],
    query: { enabled: !!address }
  })

  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isConnected) return null

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const amount = parseEther('200')
      await writeContractAsync({
        address: WATCH_TOKEN_ADDRESS,
        abi: WATCH_TOKEN_ABI,
        functionName: 'approve',
        args: [STREAMING_CONTRACT_ADDRESS, amount],
      })
      await writeContractAsync({
        address: STREAMING_CONTRACT_ADDRESS,
        abi: STREAMING_ABI,
        functionName: 'subscribe',
      })
      await refetch()
      alert('สมัคร Subscription สำเร็จ! ดูหนังได้ 30 วันเลยครับ 🎉')
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const expiryDate = expiry ? new Date(Number(expiry) * 1000).toLocaleDateString('th-TH') : null

  return (
    <div className={`mx-6 mt-4 rounded-xl p-6 ${isSubscribed ? 'bg-green-900' : 'bg-gradient-to-r from-red-900 to-yellow-900'}`}>
      {isSubscribed ? (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white text-xl font-bold">✅ Subscription Active</h3>
            <p className="text-green-300 mt-1">ดูหนังได้ทั้งหมดถึงวันที่ {expiryDate}</p>
          </div>
          <span className="text-green-400 text-4xl">👑</span>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white text-xl font-bold">🎬 สมัคร Subscription</h3>
            <p className="text-yellow-300 mt-1">ดูหนังได้ทั้งหมด 30 วัน ในราคา 200 WATCH</p>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : 'สมัครเลย 200 WATCH'}
          </button>
        </div>
      )}
    </div>
  )
}