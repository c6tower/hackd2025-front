import React from 'react';
import { PatternGrid } from '@/components/module/PatternGrid';
import Button from '@/components/part/Button';
import { BeadCounts, BeadColor, BEAD_COLOR_NAMES, BEAD_COLOR_EMOJIS } from '@/types/index';

interface PatternDetailModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 256文字の図案データ */
  pattern: string;
  /** 必要なビーズ数 */
  beadCounts: BeadCounts;
  /** 閉じるボタンのコールバック */
  onClose: () => void;
  /** ホームボタンのコールバック */
  onHome: () => void;
}

/**
 * 図案詳細モーダルコンポーネント
 * 16x16の大きなグリッドと必要ビーズ数の詳細を表示
 */
export const PatternDetailModal: React.FC<PatternDetailModalProps> = ({
  isOpen,
  pattern,
  beadCounts,
  onClose,
  onHome
}) => {
  // モーダルのフォーカストラップ用
  const modalRef = React.useRef<HTMLDivElement>(null);
  const firstFocusableRef = React.useRef<HTMLButtonElement>(null);

  // 使用されている色のビーズ数リスト（0より大きいもののみ）
  const usedBeadCounts = React.useMemo(() => {
    return Object.entries(beadCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // 使用数の多い順
      .map(([color, count]) => ({ color: color as BeadColor, count }));
  }, [beadCounts]);

  // Escキーでモーダルを閉じる
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // モーダルが開いたときにフォーカスを設定
  React.useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // フォーカストラップ
  React.useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // 背景クリックでモーダルを閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button
            ref={firstFocusableRef}
            variant="secondary"
            size="sm"
            onClick={onClose}
            aria-label="モーダルを閉じる"
          >
            × 閉じる
          </Button>
          
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            図案詳細
          </h2>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onHome}
            aria-label="ホームに戻る"
          >
            🏠 ホーム
          </Button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* 図案グリッド */}
          <div className="flex justify-center mb-6">
            <PatternGrid
              pattern={pattern}
              size="large"
              interactive={false}
            />
          </div>

          {/* 必要ビーズ数 */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              必要なビーズ
            </h3>
            
            {usedBeadCounts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {usedBeadCounts.map(({ color, count }) => (
                  <div
                    key={color}
                    className="bg-gray-50 rounded-lg p-3 text-center"
                  >
                    <div className="text-2xl mb-1">
                      {BEAD_COLOR_EMOJIS[color]}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {BEAD_COLOR_NAMES[color]}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {count}個
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">
                ビーズ情報が取得できませんでした
              </div>
            )}

            {/* 合計数 */}
            {usedBeadCounts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  合計: {usedBeadCounts.reduce((sum, { count }) => sum + count, 0)}個
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
