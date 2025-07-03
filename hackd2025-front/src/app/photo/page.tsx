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
  const [debugInfo, setDebugInfo] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const startCamera = async () => {
    try {
      setError(null)
      setDebugInfo('カメラ初期化開始...')
      console.log('カメラ初期化開始...')
      
      // 詳細な環境情報をログ出力
      console.log('環境情報:', {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      })
      
      // WebRTC対応チェック
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(`お使いのブラウザはカメラ機能をサポートしていません。プロトコル: ${window.location.protocol}`)
      }
      
      // HTTPS チェック
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setDebugInfo('⚠️ HTTPSではありません。カメラアクセスが制限される可能性があります')
        console.warn('HTTPS以外の環境:', window.location.protocol)
      }
      
      // 最も基本的な制約で開始（成功率を上げるため）
      let constraints = { 
        video: true
      }

      setDebugInfo('基本的なカメラアクセスをテスト中...')
      console.log('基本的なカメラアクセスをテスト中...', constraints)
      
      // まず基本的な設定でテスト
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('カメラストリーム取得成功:', stream)
      
      // ストリームの詳細情報をログ出力
      const tracks = stream.getVideoTracks()
      if (tracks.length > 0) {
        const track = tracks[0]
        const settings = track.getSettings()
        console.log('ビデオトラック設定:', settings)
        setDebugInfo(`カメラストリーム取得成功 - ${settings.width}x${settings.height}`)
      } else {
        console.warn('ビデオトラックが見つかりません')
        setDebugInfo('ビデオトラックが見つかりません')
      }
      
      if (videoRef.current) {
        setDebugInfo('ビデオ要素にストリームを設定中...')
        console.log('ビデオ要素にストリームを設定中...')
        
        const video = videoRef.current
        video.srcObject = stream
        
        // ビデオ要素の状態をチェック
        console.log('ビデオ要素の初期状態:', {
          srcObject: video.srcObject,
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        })
        
        // ビデオが読み込まれるまで待機
        await new Promise((resolve, reject) => {
          let resolved = false
          
          const handleLoad = () => {
            if (!resolved) {
              resolved = true
              console.log('ビデオメタデータ読み込み完了:', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState
              })
              setDebugInfo(`ビデオ表示準備完了 - ${video.videoWidth}x${video.videoHeight}`)
              resolve(true)
            }
          }
          
          const handleError = (e: Event) => {
            if (!resolved) {
              resolved = true
              console.error('ビデオエラー:', e)
              reject(new Error('ビデオの読み込みに失敗しました'))
            }
          }
          
          video.onloadedmetadata = handleLoad
          video.oncanplay = handleLoad
          video.onerror = handleError
          
          // ビデオ要素の属性を強制設定
          video.setAttribute('playsinline', 'true')
          video.setAttribute('autoplay', 'true')
          video.setAttribute('muted', 'true')
          
          // 5秒でタイムアウト
          setTimeout(() => {
            if (!resolved) {
              resolved = true
              console.log('タイムアウトしましたが続行します - ビデオサイズ:', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                srcObject: !!video.srcObject
              })
              setDebugInfo(`タイムアウト - 強制続行 (${video.videoWidth}x${video.videoHeight})`)
              resolve(true)
            }
          }, 5000)
        })
        
        // 明示的に再生を開始（複数回試行）
        let playAttempts = 0
        const maxAttempts = 3
        
        while (playAttempts < maxAttempts) {
          try {
            playAttempts++
            console.log(`ビデオ再生開始 (試行 ${playAttempts}/${maxAttempts})...`)
            setDebugInfo(`ビデオ再生開始 (試行 ${playAttempts}/${maxAttempts})...`)
            
            await video.play()
            
            console.log('ビデオ再生開始成功')
            setDebugInfo('ビデオ再生開始成功')
            break
          } catch (playError) {
            console.warn(`自動再生に失敗 (試行 ${playAttempts}):`, playError)
            
            if (playAttempts >= maxAttempts) {
              setDebugInfo('自動再生失敗（手動再生が必要な可能性）')
              // 最後の試行でも失敗した場合、手動再生を促す可能性がある
            } else {
              // 短い待機後に再試行
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        }
      }
      
      streamRef.current = stream
      setIsCapturing(true)
      setDebugInfo('カメラ初期化完了')
      console.log('カメラ初期化完了')
    } catch (err) {
      let errorMessage = 'カメラへのアクセスが拒否されました'
      let debugMessage = ''
      
      console.error('カメラエラー詳細:', err)
      
      if (err instanceof Error) {
        debugMessage = `エラー名: ${err.name}, メッセージ: ${err.message}`
        
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
      
      setError(errorMessage + ' 代わりにファイル選択をお試しください。')
      setDebugInfo(`❌ ${debugMessage}`)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'
      const response = await fetch(`${API_BASE_URL}/api/beadscount`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} ${errorText}`)
      }

      const data: BeadCountResponse = await response.json()
      console.log('APIから受信したビーズデータ:', data)
      console.log('ビーズの色と個数:', data.beads)
      setBeadCounts(data)
      setDebugInfo(`解析完了: ${Object.keys(data.beads).length}色のビーズを検出`)
    } catch (err) {
      const errorMessage = '画像の処理中にエラーが発生しました。カメラ機能やAPIサーバーが正常に動作していることを確認してください。'
      setError(errorMessage)
      setDebugInfo(`APIエラー: ${err instanceof Error ? err.message : String(err)}`)
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

  const handleFileSelect = (event: any) => {
    try {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string
            setCapturedImage(result)
            setDebugInfo('ファイルから画像を読み込み完了')
          } catch (error) {
            console.error('ファイル読み込みエラー:', error)
            setError('ファイルの読み込みに失敗しました')
            setDebugInfo('ファイル読み込みエラー')
          }
        }
        reader.onerror = () => {
          setError('ファイルの読み込みに失敗しました')
          setDebugInfo('FileReader エラー')
        }
        reader.readAsDataURL(file)
      } else {
        setError('有効な画像ファイルを選択してください')
        setDebugInfo('無効なファイル形式')
      }
    } catch (error) {
      console.error('ファイル選択エラー:', error)
      setError('ファイル選択でエラーが発生しました')
      setDebugInfo('ファイル選択エラー')
    }
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
        console.log('ビーズデータをsessionStorageに保存しました:', beadCounts);
        console.log('保存されたデータ:', dataToSave);
        setDebugInfo('ビーズデータを保存してホームに移動中...');
      } else {
        console.log('保存するビーズデータがありません');
        setDebugInfo('ビーズデータなしでホームに移動中...');
      }
      router.push('/')
    } catch (error) {
      console.error('ホームへの遷移でエラーが発生:', error)
      setDebugInfo('エラーが発生しましたが、ホームに移動します')
      router.push('/')
    }
  }

  return (
    <div className={styles.container}>
      {!capturedImage && !isCapturing && (
        <div className={styles.startSection}>
          <div className={styles.cameraIconContainer}>
            <svg className={styles.cameraIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.bottomControls}>
            <button onClick={() => router.push('/')} className={styles.homeButton}>
              <Image src="/home.png" alt="ホーム" width={128} height={128} priority />
            </button>
            <button onClick={startCamera} className={styles.captureButton}>
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
                transform: 'scaleX(-1)', // フロントカメラの場合にミラー表示
                objectFit: 'cover'
              }}
            />
          </div>
          <div className={styles.bottomControls}>
            <button onClick={stopCamera} className={styles.homeButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
              <svg width="20" height="20" viewBox="-7 -8 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L23 23M16.72 16.72C15.2108 17.5291 13.6225 17.9998 12 18C5.17084 18 0.499847 12 0.499847 12C1.64419 9.21966 3.20467 6.66212 5.09799 4.5M9.87868 6.12C10.5481 5.74174 11.2704 5.50049 12 5.50049C14.5 5.50049 16.5 7.78049 16.5 10.5C16.5 11.3242 16.281 12.0954 15.9026 12.7518M12 18C18.8291 18 23.5001 12 23.5001 12C22.8764 10.45 22.1264 8.97204 21.2655 7.58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
              <Image src="/home.png" alt="ホーム" width={128} height={128} priority />
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

      {debugInfo && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          デバッグ情報: {debugInfo}
        </div>
      )}
    </div>
  )
}