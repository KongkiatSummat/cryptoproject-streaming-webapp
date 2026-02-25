'use client'
import { useRef } from 'react'
import MovieCard from './MovieCard'

export default function MovieRow({ title, movies, onWatch }) {
  const rowRef = useRef(null)

  const scroll = (direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: direction === 'left' ? -600 : 600,
        behavior: 'smooth'
      })
    }
  }

  if (movies.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 px-2">{title}</h2>
      <div className="flex items-center gap-2">
        {/* ปุ่มซ้าย */}
        <button
          onClick={() => scroll('left')}
          className="flex-shrink-0 w-10 h-10 bg-gray-700 hover:bg-red-600 text-white text-xl font-bold rounded-full flex items-center justify-center transition-colors"
        >
          ❮
        </button>

        {/* แถวหนัง */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
          className="flex-shrink-0 w-10 h-10 bg-gray-700 hover:bg-red-600 text-white text-xl font-bold rounded-full flex items-center justify-center transition-colors"
        >
          ❯
        </button>
      </div>
    </div>
  )
}