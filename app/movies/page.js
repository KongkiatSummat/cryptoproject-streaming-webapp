'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import MovieCard from '../../components/MovieCard'
import VideoPlayer from '../../components/VideoPlayer'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('all')
  const [sort, setSort] = useState('newest')

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

  const genres = ['all', ...new Set(movies.map(m => m.genre))]

  const filteredMovies = movies
    .filter(movie => {
      const matchSearch = movie.title.toLowerCase().includes(search.toLowerCase())
      const matchGenre = genre === 'all' || movie.genre === genre
      return matchSearch && matchGenre
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sort === 'price_low') return a.buy_price - b.buy_price
      if (sort === 'price_high') return b.buy_price - a.buy_price
      return 0
    })

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">🎬 หนังทั้งหมด</h1>

        {/* Search + Filter + Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="🔍 ค้นหาหนัง..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {genres.map(g => (
              <option key={g} value={g}>{g === 'all' ? 'ทุก Genre' : g}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="newest">ใหม่ล่าสุด</option>
            <option value="oldest">เก่าสุด</option>
            <option value="price_low">ราคาต่ำ-สูง</option>
            <option value="price_high">ราคาสูง-ต่ำ</option>
          </select>
        </div>

        {/* Results Count */}
        <p className="text-gray-400 mb-4">พบ {filteredMovies.length} เรื่อง</p>

        {/* Grid */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onWatch={setSelectedMovie} />
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