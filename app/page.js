'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import SubscriptionBanner from '../components/SubscriptionBanner'
import VideoPlayer from '../components/VideoPlayer'
import MovieRow from '../components/MovieRow'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [heroMovie, setHeroMovie] = useState(null)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) {
      setMovies(data)
      setHeroMovie(data[0])
    }
    setLoading(false)
  }

  const genres = [...new Set(movies.map(m => m.genre))]

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero Banner */}
      {heroMovie && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <img
            src={heroMovie.thumbnail_url}
            alt={heroMovie.title}
            className="w-full h-full object-cover opacity-50"
            onError={(e) => e.target.src = `https://placehold.co/1280x720/1a1a2e/white?text=${encodeURIComponent(heroMovie.title)}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          <div className="absolute bottom-16 left-10 max-w-lg">
            <h1 className="text-5xl font-bold mb-3">{heroMovie.title}</h1>
            <p className="text-gray-300 text-lg mb-6 line-clamp-3">{heroMovie.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMovie(heroMovie)}
                className="bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                ▶ ดูเลย
              </button>
              <button
                onClick={() => setSelectedMovie(heroMovie)}
                className="bg-gray-600 bg-opacity-70 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-500 flex items-center gap-2"
              >
                ℹ️ ข้อมูลเพิ่มเติม
              </button>
            </div>
          </div>
        </div>
      )}

      <SubscriptionBanner />

      {/* Movie Rows by Genre */}
      <div className="px-6 py-6 space-y-10">
        {loading ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">🎬</div>
            <p>กำลังโหลด...</p>
          </div>
        ) : (
          <>



            {/* All Movies Row */}
            <MovieRow title="🔥 หนังทั้งหมด" movies={movies} onWatch={setSelectedMovie} />

            {/* Genre Rows */}
            {genres.map(genre => (
              <MovieRow
                key={genre}
                title={`🎭 ${genre}`}
                movies={movies.filter(m => m.genre === genre)}
                onWatch={setSelectedMovie}
              />
            ))}

          </>
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