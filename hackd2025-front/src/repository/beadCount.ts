import { BeadCountResponse, ApiError } from '../types'

/**
 * ビーズカウントAPIリポジトリ
 */
export class BeadCountRepository {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'
  }

  /**
   * 画像からビーズカウントを取得
   * @param imageBlob 画像のBlobデータ
   * @returns ビーズカウント結果
   */
  async getBeadCount(imageBlob: Blob): Promise<BeadCountResponse> {
    try {
      const formData = new FormData()
      formData.append('image', imageBlob, 'photo.jpg')

      const response = await fetch(`${this.baseUrl}/api/beadscount`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        const errorMessage = `API request failed: ${response.status} ${errorText}`
        throw new ApiError(errorMessage, response.status)
      }

      const data: BeadCountResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof Error && error.message.includes('API request failed')) {
        throw new ApiError(error.message)
      }
      throw new ApiError(
        '画像の処理中にエラーが発生しました。カメラ機能やAPIサーバーが正常に動作していることを確認してください。'
      )
    }
  }
}

// シングルトンインスタンス
export const beadCountRepository = new BeadCountRepository()
