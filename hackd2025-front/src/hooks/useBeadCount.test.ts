import { renderHook, act } from '@testing-library/react'
import { useBeadCount } from './useBeadCount'
import { beadCountRepository } from '../repository/beadCount'
import { ApiError } from '../types'

// モックリポジトリ
jest.mock('../repository/beadCount', () => ({
  beadCountRepository: {
    getBeadCount: jest.fn()
  }
}))

const mockRepository = beadCountRepository as jest.Mocked<typeof beadCountRepository>

// モックfetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useBeadCount', () => {
  beforeEach(() => {
    mockRepository.getBeadCount.mockClear()
    mockFetch.mockClear()
  })

  it('初期状態が正しく設定される', () => {
    // Act
    const { result } = renderHook(() => useBeadCount())

    // Assert
    expect(result.current.beadCounts).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('正常にビーズカウントを取得できる', async () => {
    // Arrange
    const mockResponse = {
      beads: {
        red: 10,
        blue: 5
      }
    }
    
    mockFetch.mockResolvedValueOnce({
      blob: async () => new Blob(['fake image data'])
    })
    
    mockRepository.getBeadCount.mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useBeadCount())

    // Act
    await act(async () => {
      await result.current.getBeadCount('data:image/jpeg;base64,fake')
    })

    // Assert
    expect(result.current.beadCounts).toEqual(mockResponse)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('APIエラーの場合、エラーメッセージが設定される', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      blob: async () => new Blob(['fake image data'])
    })
    
    mockRepository.getBeadCount.mockRejectedValueOnce(
      new ApiError('API request failed')
    )

    const { result } = renderHook(() => useBeadCount())

    // Act
    await act(async () => {
      await result.current.getBeadCount('data:image/jpeg;base64,fake')
    })

    // Assert
    expect(result.current.beadCounts).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('API request failed')
  })

  it('画像データがない場合、エラーメッセージが設定される', async () => {
    // Arrange
    const { result } = renderHook(() => useBeadCount())

    // Act
    await act(async () => {
      await result.current.getBeadCount('')
    })

    // Assert
    expect(result.current.beadCounts).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('画像データが見つかりません')
  })

  it('resetで状態がリセットされる', async () => {
    // Arrange
    const { result } = renderHook(() => useBeadCount())

    // 初期状態を設定
    await act(async () => {
      await result.current.getBeadCount('')
    })

    // Act
    act(() => {
      result.current.reset()
    })

    // Assert
    expect(result.current.beadCounts).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
