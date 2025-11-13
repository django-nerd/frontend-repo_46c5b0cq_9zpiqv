import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const emptyForm = {
    title: '',
    author: '',
    category: '',
    description: '',
    text_summary: '',
    cover_image_url: '',
    audio_summary_url: '',
  }

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [books, setBooks] = useState([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (categoryFilter) params.set('category', categoryFilter)
      const res = await fetch(`${baseUrl}/api/books?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load books')
      const data = await res.json()
      setBooks(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // Basic validation
      if (!form.title || !form.author || !form.category) {
        throw new Error('Please fill title, author and category')
      }
      const res = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to add book')
      }
      setForm(emptyForm)
      await fetchBooks()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const categories = useMemo(() => {
    const set = new Set(books.map(b => (b.category || '').trim()).filter(Boolean))
    return Array.from(set).sort()
  }, [books])

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return
    try {
      await fetch(`${baseUrl}/api/books/${id}`, { method: 'DELETE' })
      await fetchBooks()
    } catch (e) {
      setError('Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <header className="px-6 py-6 sticky top-0 bg-white/70 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Book Summaries + Audio</h1>
            <p className="text-sm text-gray-500">Add books, read summaries, and listen to audio highlights</p>
          </div>
          <a href="/test" className="text-sm text-blue-600 hover:text-blue-700">Check backend</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <section className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add a new book</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Title</label>
                  <input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Atomic Habits" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Author</label>
                  <input value={form.author} onChange={(e)=>setForm({ ...form, author: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="James Clear" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <input value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Self-help" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cover Image URL</label>
                  <input value={form.cover_image_url} onChange={(e)=>setForm({ ...form, cover_image_url: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="https://...jpg" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Audio Summary URL</label>
                  <input value={form.audio_summary_url} onChange={(e)=>setForm({ ...form, audio_summary_url: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="https://...mp3" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Short Description</label>
                  <input value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="One line about the book" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Text Summary</label>
                <textarea value={form.text_summary} onChange={(e)=>setForm({ ...form, text_summary: e.target.value })} rows={5} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Write or paste the summary..." />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={()=>setForm(emptyForm)} className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-50">Clear</button>
                <button disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Add Book'}</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Browse</h2>
              <div className="flex gap-2">
                <input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && fetchBooks()} placeholder="Search title, author..." className="border rounded-md px-3 py-2 w-56" />
                <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2">
                  <option value="">All categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button onClick={fetchBooks} className="px-3 py-2 bg-gray-800 text-white rounded-md">Search</button>
              </div>
            </div>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : books.length === 0 ? (
              <p className="text-gray-500">No books yet. Add one on the left.</p>
            ) : (
              <ul className="space-y-4">
                {books.map((b) => (
                  <li key={b.id} className="border rounded-lg p-4 flex gap-4">
                    {b.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.cover_image_url} alt={b.title} className="w-20 h-28 object-cover rounded-md border" onError={(e)=>{e.currentTarget.style.display='none'}} />
                    ) : (
                      <div className="w-20 h-28 rounded-md bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 truncate">{b.title}</h3>
                          <p className="text-sm text-gray-600">{b.author} • <span className="text-gray-500">{b.category}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={()=>setExpandedId(expandedId===b.id?null:b.id)} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">{expandedId===b.id ? 'Hide' : 'Read'}</button>
                          <button onClick={()=>handleDelete(b.id)} className="px-3 py-1 text-sm rounded border text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      </div>
                      {b.description && (
                        <p className="mt-1 text-sm text-gray-700 line-clamp-2">{b.description}</p>
                      )}
                      {b.audio_summary_url && (
                        <div className="mt-3">
                          <audio controls className="w-full">
                            <source src={b.audio_summary_url} />
                          </audio>
                        </div>
                      )}
                      {expandedId === b.id && (
                        <div className="mt-3 bg-gray-50 border rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap text-sm text-gray-800">
                          {b.text_summary || 'No text summary provided.'}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">Built for sharing knowledge through reading and listening.</footer>
    </div>
  )
}

export default App
