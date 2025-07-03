'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'
import { useBeadCount } from '../../hooks/useBeadCount'

export default function PhotoPage() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  // ビーズカウント機能をhookから取得
  const { beadCounts, isLoading, error: apiError, getBeadCount, reset: resetBeadCount } = useBeadCount()
  
  // カメラ関連のエラー状態（APIエラーとは分離）
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 統合されたエラー表示用
  const error = apiError || cameraError

  // ページマウント時に自動でカメラを起動
  useEffect(() => {
    startCamera()
  }, [])

  // ストリームの設定を監視するuseEffect
  useEffect(() => {
    if (isCapturing && videoRef.current && streamRef.current) {
      const video = videoRef.current
      const stream = streamRef.current
      
      // 定期的にsrcObjectの状態をチェック
      const checkInterval = setInterval(() => {
        if (!video.srcObject && stream && stream.active) {
          try {
            video.srcObject = stream as MediaProvider
          } catch {
            const videoElement = video as HTMLVideoElement & { srcObject: MediaStream }
            videoElement.srcObject = stream
          }
        }
      }, 1000)
      
      return () => {
        clearInterval(checkInterval)
      }
    }
  }, [isCapturing])

  const startCamera = async () => {
    try {
      setCameraError(null)
      setIsCapturing(true) // カメラボタンを押した瞬間に状態を変更
      
      // WebRTC対応チェック
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(`お使いのブラウザはカメラ機能をサポートしていません。プロトコル: ${window.location.protocol}`)
      }
      
      // 最も基本的な制約で開始（成功率を上げるため）
      const constraints = { 
        video: {
          facingMode: 'environment' // 可能であれば背面カメラを使用
        }
      }

      // まず基本的な設定でテスト
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        const video = videoRef.current
        
        // ストリームが有効か確認
        if (stream && stream.active) {
          // ビデオ要素の設定
          video.setAttribute('playsinline', 'true')
          video.setAttribute('autoplay', 'true')
          video.setAttribute('muted', 'true')
          
          // srcObjectを設定
          try {
            video.srcObject = stream as MediaProvider
          } catch {
            const videoElement = video as HTMLVideoElement & { srcObject: MediaStream }
            videoElement.srcObject = stream
          }
          
          // 再生を開始
          video.play().catch(() => {
            // 自動再生に失敗した場合でも続行
          })
        } else {
          setIsCapturing(false)
          return
        }
      }
      
      streamRef.current = stream
      // setIsCapturing(true) // 既に上で設定済み
    } catch (err) {
      setIsCapturing(false) // エラー時は状態をリセット
      let errorMessage = 'カメラへのアクセスが拒否されました'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'カメラの使用許可が必要です。ブラウザの設定でカメラアクセスを許可してください。'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されているか確認してください。'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'カメラが他のアプリケーションで使用されています。'
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'カメラの設定に問題があります。'
        } else if (err.message.includes('タイムアウト')) {
          errorMessage = 'カメラの初期化がタイムアウトしました。再度お試しください。'
        } else {
          errorMessage = `カメラエラー: ${err.message}`
        }
      }
      
      setCameraError(errorMessage + ' カメラを手動で起動するか、ファイル選択をお試しください。')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    
    // 正方形にクロップするための計算
    const size = Math.min(videoWidth, videoHeight)
    const offsetX = (videoWidth - size) / 2
    const offsetY = (videoHeight - size) / 2

    // APIに送信する画像のサイズを512x512に統一
    const targetSize = 512
    const canvas = document.createElement('canvas')
    canvas.width = targetSize
    canvas.height = targetSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 正方形にクロップして、指定サイズにリサイズして描画
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, targetSize, targetSize)
    const imageData = canvas.toDataURL('image/jpeg', 0.8) // 品質を0.8に設定
    setCapturedImage(imageData)
    stopCamera()
    
    // 自動的に解析を開始
    await getBeadCount(imageData)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    resetBeadCount()
    setCameraError(null)
    // カメラを再起動
    startCamera()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith('image/')) {
        // ファイルが選択されたらカメラを停止
        stopCamera()
        setCameraError(null)
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string
            
            // 画像を正方形にクロップ・リサイズ
            const img = document.createElement('img')
            img.onload = async () => {
              const targetSize = 512
              const canvas = document.createElement('canvas')
              canvas.width = targetSize
              canvas.height = targetSize
              const ctx = canvas.getContext('2d')
              if (!ctx) return
              
              // 正方形にクロップするための計算
              const size = Math.min(img.width, img.height)
              const offsetX = (img.width - size) / 2
              const offsetY = (img.height - size) / 2
              
              // 正方形にクロップして、指定サイズにリサイズして描画
              ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, targetSize, targetSize)
              const processedImageData = canvas.toDataURL('image/jpeg', 0.8)
              setCapturedImage(processedImageData)
              
              // 自動的に解析を開始
              await getBeadCount(processedImageData)
            }
            img.src = result
          } catch {
            setCameraError('ファイルの読み込みに失敗しました')
          }
        }
        reader.onerror = () => {
          setCameraError('ファイルの読み込みに失敗しました')
        }
        reader.readAsDataURL(file)
      } else {
        setCameraError('有効な画像ファイルを選択してください')
      }
    } catch {
      setCameraError('ファイル選択でエラーが発生しました')
    }
    
    // ファイル入力をリセット（同じファイルを再選択できるようにする）
    event.target.value = ''
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const goToHome = () => {
    try {
      if (beadCounts) {
        // ビーズカウントデータをセッションストレージに保存
        const dataToSave = JSON.stringify(beadCounts);
        sessionStorage.setItem('beadCounts', dataToSave);
      }
      router.push('/')
    } catch {
      router.push('/')
    }
  }

  const goToBeadInput = () => {
    try {
      console.log('goToBeadInput実行開始');
      console.log('beadCounts:', beadCounts);
      
      if (beadCounts) {
        // ビーズカウントデータをセッションストレージに保存
        const dataToSave = JSON.stringify(beadCounts);
        console.log('保存するデータ:', dataToSave);
        
        // 保存前にクリア
        sessionStorage.removeItem('beadCounts');
        
        // 保存
        sessionStorage.setItem('beadCounts', dataToSave);
        console.log('sessionStorageに保存完了');
        
        // 保存後に確認
        const saved = sessionStorage.getItem('beadCounts');
        console.log('保存確認:', saved);
        
        // URLパラメータも併用（バックアップ）
        const encodedData = encodeURIComponent(dataToSave);
        console.log('URLパラメータ用データ:', encodedData);
        
        // 少し待ってから遷移
        setTimeout(() => {
          console.log('ホーム画面に遷移します');
          router.push(`/?camera_data=${encodedData}`);
        }, 100);
      } else {
        console.log('beadCountsが空です');
        router.push('/');
      }
    } catch (error) {
      console.error('goToBeadInputでエラー:', error);
      router.push('/');
    }
  }

  return (
    <div className={styles.container}>
      {isCapturing && (
        <div className={styles.cameraSection}>
          <div className={styles.videoContainer}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={styles.video}
              style={{
                objectFit: 'cover',
                display: 'block',
                visibility: 'visible',
                opacity: 1
              }}
            />
            {/* 20x20 格子オーバーレイ */}
            <div className={styles.gridOverlay}>
              <svg className={styles.grid} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,255,255,1)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
          <div className={styles.bottomControls}>
            <button onClick={() => router.push('/')} className={styles.homeButton}>
              <Image src="/home.png" alt="ホーム" width={128} height={128} priority />
            </button>
            <button onClick={capturePhoto} className={styles.captureButton}>
              撮影
            </button>
            <button onClick={openFileDialog} className={styles.fileButton}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {capturedImage && !beadCounts && isLoading && (
        <div className={styles.previewSection}>
          <Image 
            src={capturedImage} 
            alt="Captured" 
            className={styles.preview}
            width={400}
            height={400}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: 'auto'
            }}
          />
          <div className={styles.resultTitle}>
            解析中...
          </div>
          <div className={styles.bottomControls}>
            <button onClick={() => router.push('/')} className={styles.homeButton}>
              <Image src="/home.png" alt="ホーム" width={128} height={128} priority />
            </button>
          </div>
        </div>
      )}

      {beadCounts && capturedImage && (
        <div className={styles.resultSection}>
          <Image 
            src={capturedImage} 
            alt="Analyzed" 
            className={styles.resultImage}
            width={400}
            height={400}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: 'auto'
            }}
          />
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
              <Image src="/home.png" alt="ホーム" width={128} height={128} priority />
            </button>
            <button onClick={retakePhoto} className={styles.captureButton}>
              撮り直す
            </button>
            <button onClick={goToBeadInput} className={styles.decisionButton}>
              決定
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
