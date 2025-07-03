import { useState, useCallback } from 'react'
import { BeadCountResponse, ApiError } from '../types'
import { beadCountRepository } from '../repository/beadCount'

/**
 * ビーズカウント処理用のカスタムhook
 */
export const useBeadCount = () => {
  const [beadCounts, setBeadCounts] = useState<BeadCountResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 画像からビーズカウントを取得
   * @param imageDataUrl 画像のData URL
   */
  const getBeadCount = useCallback(async (imageDataUrl: string) => {
    if (!imageDataUrl) {
      setError('画像データが見つかりません')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Data URLをBlobに変換
      const blob = await fetch(imageDataUrl).then(r => r.blob())
      
      // APIを呼び出し
      const data = await beadCountRepository.getBeadCount(blob)
      setBeadCounts(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('予期しないエラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 状態をリセット
   */
  const reset = useCallback(() => {
    setBeadCounts(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    beadCounts,
    isLoading,
    error,
    getBeadCount,
    reset
  }
}
