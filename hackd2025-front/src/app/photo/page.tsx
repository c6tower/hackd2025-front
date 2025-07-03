'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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

    const video = videoRef.current
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    
    // 正方形にクロップするための計算
    const size = Math.min(videoWidth, videoHeight)
    const offsetX = (videoWidth - size) / 2
    const offsetY = (videoHeight - size) / 2

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 正方形にクロップして描画
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)
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
      {!capturedImage && !isCapturing && (
        <div className={styles.startSection}>
          <div className={styles.cameraIconContainer}>
            <Image 
              src="/camera.png" 
              alt="カメラ" 
              width={150} 
              height={150} 
              className={styles.cameraIcon}
            />
          </div>
          <div className={styles.bottomControls}>
            <button onClick={() => router.push('/')} className={styles.homeButton}>
              <Image src="/home.png" alt="ホーム" width={24} height={24} />
              <span>ホーム</span>
            </button>
            <button onClick={startCamera} className={styles.captureButton}>
              撮影
            </button>
          </div>
        </div>
      )}

      {isCapturing && (
        <div className={styles.cameraSection}>
          <div className={styles.videoContainer}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={styles.video}
            />
          </div>
          <div className={styles.bottomControls}>
            <button onClick={stopCamera} className={styles.homeButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>戻る</span>
            </button>
            <button onClick={capturePhoto} className={styles.captureButton}>
              撮影
            </button>
          </div>
        </div>
      )}

      {capturedImage && !beadCounts && (
        <div className={styles.previewSection}>
          <img src={capturedImage} alt="Captured" className={styles.preview} />
          <div className={styles.bottomControls}>
            <button onClick={retakePhoto} disabled={isLoading} className={styles.homeButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L23 23M16.72 16.72C15.2108 17.5291 13.6225 17.9998 12 18C5.17084 18 0.499847 12 0.499847 12C1.64419 9.21966 3.20467 6.66212 5.09799 4.5M9.87868 6.12C10.5481 5.74174 11.2704 5.50049 12 5.50049C14.5 5.50049 16.5 7.78049 16.5 10.5C16.5 11.3242 16.281 12.0954 15.9026 12.7518M12 18C18.8291 18 23.5001 12 23.5001 12C22.8764 10.45 22.1264 8.97204 21.2655 7.58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>撮り直す</span>
            </button>
            <button onClick={sendImageToAPI} disabled={isLoading} className={styles.captureButton}>
              {isLoading ? '処理中...' : '解析'}
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
          <div className={styles.bottomControls}>
            <button onClick={goToHome} className={styles.homeButton}>
              <Image src="/home.png" alt="ホーム" width={24} height={24} />
              <span>ホーム</span>
            </button>
            <button onClick={retakePhoto} className={styles.captureButton}>
              撮り直す
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