'use client'

export default function VideoPlayer({ movie, onClose }) {
  
  const getEmbedUrl = (url) => {
    if (!url) return null
    
    // YouTube
    if (url.includes('youtube.com/embed')) return url
    if (url.includes('youtube.com/watch')) {
      const id = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    
    // Google Drive
    if (url.includes('drive.google.com')) {
      const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]
      return `https://drive.google.com/file/d/${id}/preview`
    }
    
    return url
  }

  const embedUrl = getEmbedUrl(movie.video_url)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold">{movie.title}</h2>
          <button
            onClick={onClose}
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            ✕ ปิด
          </button>
        </div>

        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full rounded-xl"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
              <p className="text-gray-400">ไม่พบวิดีโอ</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-gray-800 rounded-xl p-4">
          <p className="text-gray-300">{movie.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{movie.genre}</span>
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{movie.duration_minutes} นาที</span>
          </div>
        </div>
      </div>
    </div>
  )
}