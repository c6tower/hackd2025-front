import React from 'react';
import { PatternGrid } from '@/components/module/PatternGrid';
import Button from '@/components/part/Button';
import { BeadCounts, BeadColor, BEAD_COLORS } from '@/types/index';

interface PatternDetailModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 256文字の図案データ */
  pattern: string;
  /** 図案のタイトル */
  title?: string;
  /** 必要なビーズ数 */
  beadCounts: BeadCounts;
  /** 閉じるボタンのコールバック */
  onClose: () => void;
}

/**
 * 図案詳細モーダルコンポーネント
 * 16x16の大きなグリッドと必要ビーズ数の詳細を表示
 */
export const PatternDetailModal: React.FC<PatternDetailModalProps> = ({
  isOpen,
  pattern,
  title,
  beadCounts,
  onClose
}) => {
  // デバッグ情報: モーダルのプロパティを確認
  React.useEffect(() => {
    if (isOpen) {
      console.log('PatternDetailModal opened with:', {
        title,
        titleType: typeof title,
        titleLength: title?.length,
        hasTitle: !!title,
        pattern: pattern ? `${pattern.length} chars` : 'no pattern'
      });
    }
  }, [isOpen, title, pattern]);

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Pattern detail modal"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* ヘッダー */}
        <div className="flex justify-end p-4">
          <Button
            ref={firstFocusableRef}
            variant="secondary"
            size="md"
            onClick={onClose}
            aria-label="Close modal"
            className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !bg-transparent !rounded-full !text-4xl font-bold w-12 h-12 flex items-center justify-center p-0 !border-0 !shadow-none"
          >
            ×
          </Button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* タイトル */}
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {title}
              </h2>
            </div>
          )}
          
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
              Required Beads
            </h3>
            
            {usedBeadCounts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {usedBeadCounts.map(({ color, count }) => (
                  <div
                    key={color}
                    className="bg-gray-50 rounded-lg p-3 text-center flex gap-2 items-center justify-center"
                  >
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle 
                        cx="12.1718" 
                        cy="12.4999" 
                        r="7.82472" 
                        stroke={BEAD_COLORS[color]} 
                        strokeWidth="8.69413"
                        style={color === 'white' ? { filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' } : undefined}
                      />
                    </svg>
                    <div className="text-lg font-bold text-gray-900">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">
                Bead information could not be retrieved
              </div>
            )}

            {/* 合計数 */}
            {usedBeadCounts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-base text-gray-600">
                  Total: {usedBeadCounts.reduce((sum, { count }) => sum + count, 0)} pieces
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
