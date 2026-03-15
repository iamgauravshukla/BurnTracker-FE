import { useState } from 'react'
import { uploadDocument } from '../services/documents'

const acceptedFileTypes = '.pdf,.docx,image/png,image/jpeg,image/webp,image/gif'

function renderValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'None'
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  if (value === null || value === undefined || value === '') {
    return 'Not available'
  }

  return String(value)
}

export default function DocumentUploadSection({ selectedProject }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedFile) {
      setError('Choose a PDF, image, or DOCX file first.')
      return
    }

    if (!selectedProject) {
      setError('Select a project first before uploading a document.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await uploadDocument(selectedFile, selectedProject.id)
      setResult(response)
    } catch (submitError) {
      setError(submitError.message)
      setResult(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const extractedEntries = result?.extracted ? Object.entries(result.extracted) : []

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm lg:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Documents</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Upload and extract document data</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Upload PDF, image, or DOCX files. Each file is sent to the backend and the extracted structured response is shown below.
        </p>
        {selectedProject ? (
          <p className="mt-3 text-sm text-slate-600">Current project context: {selectedProject.name}</p>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Upload file</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Send to backend extractor</h3>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block rounded-[1.6rem] border border-dashed border-slate-300 bg-[#f9fafb] px-5 py-10 text-center transition hover:border-slate-500 hover:bg-white">
              <span className="block text-sm font-medium text-slate-700">Choose PDF, image, or DOCX</span>
              <span className="mt-2 block text-sm text-slate-500">
                Supported: PDF, DOCX, JPG, PNG, WEBP, GIF
              </span>
              <input
                accept={acceptedFileTypes}
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                type="file"
              />
            </label>

            <div className="rounded-[1.2rem] border border-slate-100 bg-[#f9fafb] px-4 py-3 text-sm text-slate-600">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected yet.'}
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button
              className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || !selectedFile}
              type="submit"
            >
              {isSubmitting ? 'Uploading...' : 'Upload document'}
            </button>
          </form>
        </article>

        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Extracted data</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Structured response</h3>
            </div>
            {result?.message ? (
              <span className="rounded-full border border-slate-100 bg-[#f9fafb] px-3 py-1 text-xs font-medium text-slate-700">
                Processed
              </span>
            ) : null}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-slate-100 bg-[#f9fafb] p-4">
            {result?.extracted ? (
              <div className="space-y-4">
                {extractedEntries.map(([key, value]) => (
                  <div className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-4 shadow-sm" key={key}>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{key}</p>
                    {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">{renderValue(value)}</pre>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-700">{renderValue(value)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center text-center text-sm text-slate-500">
                Upload a document to see the backend's extracted structured data here.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}