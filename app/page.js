'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import SubscriptionBanner from '../components/SubscriptionBanner'
import VideoPlayer from '../components/VideoPlayer'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('all')

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setMovies(data)
    setLoading(false)
  }

  const filteredMovies = movies.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genre === 'all' || movie.genre === genre
    return matchSearch && matchGenre
  })

  const genres = ['all', ...new Set(movies.map(m => m.genre))]

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <SubscriptionBanner />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-6 py-10">
        <h1 className="text-4xl font-bold text-center">
          🎬 <span className="text-red-500">Crypto</span>Flix
        </h1>
        <p className="text-gray-400 text-center mt-2">ดูหนังด้วย WATCH Token</p>

        {/* Search */}
        <div className="max-w-xl mx-auto mt-6">
          <input
            type="text"
            placeholder="🔍 ค้นหาหนัง..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                genre === g
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {g === 'all' ? 'ทั้งหมด' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="px-6 pb-10">
        {loading ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">🎬</div>
            <p>กำลังโหลด...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p>ไม่พบหนังที่ค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatch={setSelectedMovie}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Player */}
      {selectedMovie && (
        <VideoPlayer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </main>
  )
}