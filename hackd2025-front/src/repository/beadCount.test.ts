import { BeadCountRepository } from './beadCount'
import { ApiError } from '../types'

// モックfetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('BeadCountRepository', () => {
  let repository: BeadCountRepository

  beforeEach(() => {
    repository = new BeadCountRepository('http://test-api.com')
    mockFetch.mockClear()
  })

  describe('getBeadCount', () => {
    it('正常にビーズカウントを取得できる', async () => {
      // Arrange
      const mockResponse = {
        beads: {
          red: 10,
          blue: 5,
          green: 3
        }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' })

      // Act
      const result = await repository.getBeadCount(imageBlob)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/api/beadscount',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        })
      )
    })

    it('APIエラーの場合、ApiErrorを投げる', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      })

      const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' })

      // Act & Assert
      await expect(repository.getBeadCount(imageBlob)).rejects.toThrow(ApiError)
      
      // 2回目のテストのため、再度mockを設定
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      })
      
      await expect(repository.getBeadCount(imageBlob)).rejects.toThrow('API request failed: 400 Bad Request')
    })

    it('ネットワークエラーの場合、適切なエラーメッセージを返す', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' })

      // Act & Assert
      await expect(repository.getBeadCount(imageBlob)).rejects.toThrow(ApiError)
      await expect(repository.getBeadCount(imageBlob)).rejects.toThrow(
        '画像の処理中にエラーが発生しました。カメラ機能やAPIサーバーが正常に動作していることを確認してください。'
      )
    })
  })
})
