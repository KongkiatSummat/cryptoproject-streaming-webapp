'use client'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import MovieCard from '../../components/MovieCard'
import VideoPlayer from '../../components/VideoPlayer'
import { supabase } from '../../lib/supabase'

export default function MyListPage() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [myList, setMyList] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!address) return
    loadMyList()
  }, [address])

  const loadMyList = async () => {
    // ดึงจาก localStorage
    const saved = localStorage.getItem(`mylist_${address}`)
    if (!saved) return

    const ids = JSON.parse(saved)
    if (ids.length === 0) return

    const { data } = await supabase
      .from('movies')
      .select('*')
      .in('id', ids)

    setMyList(data || [])
  }

  const removeFromList = (movieId) => {
    const saved = localStorage.getItem(`mylist_${address}`)
    const ids = saved ? JSON.parse(saved) : []
    const newIds = ids.filter(id => id !== movieId)
    localStorage.setItem(`mylist_${address}`, JSON.stringify(newIds))
    setMyList(prev => prev.filter(m => m.id !== movieId))
  }

  if (!mounted) return null

  if (!isConnected) return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-400 text-xl">กรุณา Connect MetaMask ก่อนครับ</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">❤️ My List</h1>
        <p className="text-gray-400 mb-8">หนังที่คุณบันทึกไว้ {myList.length} เรื่อง</p>

        {myList.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl mb-4">ยังไม่มีหนังใน List ครับ</p>
            <button
              onClick={() => router.push('/movies')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl"
            >
              ไปเพิ่มหนังเลย
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {myList.map(movie => (
              <div key={movie.id} className="relative">
                <MovieCard movie={movie} onWatch={setSelectedMovie} />
                <button
                  onClick={() => removeFromList(movie.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-lg z-10"
                >
                  ✕ ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <VideoPlayer movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </main>
  )
}