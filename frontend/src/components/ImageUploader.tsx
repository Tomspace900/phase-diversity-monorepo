import React, { useState, useRef, useEffect } from 'react'
import { type UploadResponse } from '../api'

interface ImageUploaderProps {
  onUploadComplete: (sessionId: string, data: UploadResponse) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-upload when files are selected
  useEffect(() => {
    if (files.length > 0 && !uploading) {
      handleUpload()
    }
  }, [files])

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Upload failed (HTTP ${response.status})`)
      }

      const data: UploadResponse = await response.json()
      setUploading(false)
      onUploadComplete(data.session_id, data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setUploading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const fileList = e.target.files
    if (fileList) {
      setFiles(Array.from(fileList))
      setError(null)
    }
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(droppedFiles)
    setError(null)
  }

  // Reset and select new files
  const handleSelectNew = (): void => {
    setFiles([])
    setUploading(false)
    setError(null)
    fileInputRef.current?.click()
  }

  // Trigger file input click
  const handleBrowseClick = (): void => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">
        📁 Upload Images
      </h2>
      <p className="text-gray-300 mb-4 text-sm leading-relaxed">
        Drop defocused images here
        <br />
        <br />
        <span className="font-semibold">Accepted formats:</span>
        <br />• Single FITS file with 2+ image extensions
        <br />• Three separate FITS files
        <br />• NumPy array (.npy) with shape (N, H, W)
      </p>

      {/* Drag & Drop Zone */}
      {!uploading && files.length === 0 && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition mb-4 ${
            isDragging
              ? 'border-science-accent bg-science-accent/10'
              : 'border-gray-600 hover:border-science-blue hover:bg-gray-700/50'
          }`}
        >
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-3"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm">
              <span className="text-science-accent font-semibold">
                Click to browse
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs mt-1">FITS (.fits, .fit) or NumPy (.npy)</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".fits,.fit,.npy"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Uploading State - Simple spinner */}
      {uploading && (
        <div className="mb-4 text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-science-accent mb-4"></div>
          <p className="text-gray-300 text-sm">Processing images...</p>
        </div>
      )}

      {/* Error Display */}
      {error && !uploading && (
        <div className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-4">
          <p className="text-red-400 font-semibold mb-2">❌ Upload failed</p>
          <p className="text-red-300 text-sm mb-3">{error}</p>
          <button
            onClick={handleSelectNew}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
          >
            Select New Files
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
