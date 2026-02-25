'use client'
import { useRef } from 'react'
import MovieCard from './MovieCard'

export default function MovieRow({ title, movies, onWatch }) {
  const rowRef = useRef(null)

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = 600
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (movies.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 px-2">{title}</h2>
      <div className="relative group">
        {/* ปุ่มซ้าย */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black bg-opacity-50 hover:bg-opacity-80 text-white text-2xl flex items-center justify-center opacity-100 transition-opacity rounded-r-lg"
        >
          ❮
        </button>

        {/* แถวหนัง */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth px-14"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {movies.map(movie => (
            <div key={movie.id} className="min-w-[200px] max-w-[200px]">
              <MovieCard movie={movie} onWatch={onWatch} />
            </div>
          ))}
        </div>

        {/* ปุ่มขวา */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black bg-opacity-50 hover:bg-opacity-80 text-white text-2xl flex items-center justify-center opacity-100 transition-opacity rounded-l-lg"
        >
          ❯
        </button>
      </div>
    </div>
  )
}