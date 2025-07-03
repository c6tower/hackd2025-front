'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

interface BeadCountResponse {
  beads: {
    [key: string]: number
  }
}

export default function PhotoPage() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [beadCounts, setBeadCounts] = useState<BeadCountResponse | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      streamRef.current = stream
      setIsCapturing(true)
      setError(null)
    } catch (err) {
      setError('カメラへのアクセスが拒否されました')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageData)
    stopCamera()
  }

  const sendImageToAPI = async () => {
    if (!capturedImage) return

    setIsLoading(true)
    setError(null)

    try {
      const blob = await fetch(capturedImage).then(r => r.blob())
      const formData = new FormData()
      formData.append('image', blob, 'photo.jpg')

      const response = await fetch('http://localhost:8001/api/beadscount', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data: BeadCountResponse = await response.json()
      setBeadCounts(data)
    } catch (err) {
      setError('画像の処理中にエラーが発生しました')
      console.error('API error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setBeadCounts(null)
    setError(null)
  }

  const goToHome = () => {
    if (beadCounts) {
      // ビーズカウントデータをセッションストレージに保存
      sessionStorage.setItem('beadCounts', JSON.stringify(beadCounts))
    }
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>写真からビーズ数を計算</h1>

      {!capturedImage && !isCapturing && (
        <div className={styles.startSection}>
          <button onClick={startCamera} className={styles.button}>
            カメラを起動
          </button>
          <button onClick={() => router.push('/')} className={styles.button}>
            ホームに戻る
          </button>
        </div>
      )}

      {isCapturing && (
        <div className={styles.cameraSection}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={styles.video}
          />
          <div className={styles.cameraControls}>
            <button onClick={capturePhoto} className={styles.captureButton}>
              撮影
            </button>
            <button onClick={stopCamera} className={styles.button}>
              キャンセル
            </button>
          </div>
        </div>
      )}

      {capturedImage && !beadCounts && (
        <div className={styles.previewSection}>
          <img src={capturedImage} alt="Captured" className={styles.preview} />
          <div className={styles.previewControls}>
            <button onClick={sendImageToAPI} disabled={isLoading} className={styles.button}>
              {isLoading ? '処理中...' : 'ビーズ数を計算'}
            </button>
            <button onClick={retakePhoto} disabled={isLoading} className={styles.button}>
              撮り直す
            </button>
          </div>
        </div>
      )}

      {beadCounts && (
        <div className={styles.resultSection}>
          <img src={capturedImage} alt="Analyzed" className={styles.resultImage} />
          <h2 className={styles.resultTitle}>ビーズ数の計算結果</h2>
          <div className={styles.beadCounts}>
            {Object.entries(beadCounts.beads).map(([color, count]) => (
              <div key={color} className={styles.beadItem}>
                <span className={styles.colorName}>{color}</span>
                <span className={styles.count}>{count}個</span>
              </div>
            ))}
          </div>
          <div className={styles.resultControls}>
            <button onClick={goToHome} className={styles.button}>
              ホームで結果を確認
            </button>
            <button onClick={retakePhoto} className={styles.button}>
              別の写真を撮る
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  )
}