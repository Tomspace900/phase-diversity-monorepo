import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type UploadResponse } from '../api'
import ImageUploader from '../components/ImageUploader'
import ImagePreview from '../components/ImagePreview'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null)

  const handleUploadComplete = (id: string, data: UploadResponse): void => {
    setSessionId(id)
    setUploadData(data)
  }

  const handleNextStep = (): void => {
    if (sessionId) {
      navigate(`/configure/${sessionId}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-science-accent">
        Defocused Image Upload
      </h1>
      <p className="text-gray-300 mb-6">
        Upload focal plane images for phase diversity analysis
      </p>

      {!sessionId ? (
        <ImageUploader onUploadComplete={handleUploadComplete} />
      ) : (
        <>
          {uploadData && (
            <ImagePreview
              sessionId={sessionId}
              numImages={uploadData.num_images}
              imageShape={uploadData.image_shape}
              thumbnails={uploadData.thumbnails}
              stats={uploadData.stats}
            />
          )}

          <div className="text-center">
            <button
              onClick={handleNextStep}
              className="bg-science-blue hover:bg-science-accent text-white font-bold py-3 px-8 rounded transition inline-flex items-center gap-2"
            >
              Next: Configure Setup
              <span className="text-xl">→</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default HomePage
