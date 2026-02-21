'use client'
import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { WATCH_TOKEN_ADDRESS } from '../lib/contracts'
import { createPublicClient, http, formatEther } from 'viem'
import { bscTestnet } from 'viem/chains'

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

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [balance, setBalance] = useState('0')
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!address) return
    const fetchBalance = async () => {
      try {
        const result = await publicClient.readContract({
          address: WATCH_TOKEN_ADDRESS,
          abi: BALANCE_ABI,
          functionName: 'balanceOf',
          args: [address],
        })
        setBalance(Number(formatEther(result)).toFixed(0))
      } catch (err) {
        console.error('Balance error:', err)
      }
    }
    fetchBalance()
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [address])

  if (!mounted) return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <span className="text-red-500 text-2xl font-bold">🎬 CryptoFlix</span>
    </nav>
  )

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-red-500 text-2xl font-bold">🎬 CryptoFlix</span>
      </div>
      <div className="flex items-center gap-4">
        {isConnected ? (
          <>
            <span className="text-yellow-400 font-semibold">
              💰 {balance} WATCH
            </span>
            <span className="text-gray-400 text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg"
          >
            Connect MetaMask
          </button>
        )}
      </div>
    </nav>
  )
}