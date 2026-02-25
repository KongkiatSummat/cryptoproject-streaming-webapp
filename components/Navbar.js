'use client'
import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { WATCH_TOKEN_ADDRESS } from '../lib/contracts'
import { createPublicClient, http, formatEther } from 'viem'
import { bscTestnet } from 'viem/chains'
import { useRouter, usePathname } from 'next/navigation'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const pathname = usePathname()
  const [username, setUsername] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
  if (!address) return
    const name = localStorage.getItem(`username_${address}`) || ''
    setUsername(name)
  }, [address])

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
        setBalance(Number(formatEther(result)).toLocaleString())
      } catch (err) {
        console.error('Balance error:', err)
      }
    }
    fetchBalance()
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [address])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/my-list', label: 'My List' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/settings', label: 'Settings' },
  ]

  if (!mounted) return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <span className="text-red-500 text-2xl font-bold">🎬 CryptoFlix</span>
    </nav>
  )

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span
            onClick={() => router.push('/')}
            className="text-red-500 text-2xl font-bold cursor-pointer"
          >
            🎬 CryptoFlix
          </span>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`text-sm font-medium hover:text-white transition ${
                  pathname === link.href ? 'text-white' : 'text-gray-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <span className="text-yellow-400 font-semibold hidden sm:block">
                💰 {balance} WATCH
              </span>

              <span className="text-gray-400 text-sm hidden sm:block">
                {username || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
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

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-2xl"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-700 pt-4">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => { router.push(link.href); setMenuOpen(false) }}
              className={`text-left text-sm font-medium hover:text-white transition ${
                pathname === link.href ? 'text-white' : 'text-gray-400'
              }`}
            >
              {link.label}
            </button>
          ))}
          {isConnected && (
            <div className="text-yellow-400 text-sm pt-2 border-t border-gray-700">
              💰 {balance} WATCH
            </div>
          )}
        </div>
      )}
    </nav>
  )
}