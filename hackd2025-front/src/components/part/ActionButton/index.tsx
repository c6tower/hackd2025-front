import React from 'react';
import Image, { StaticImageData } from 'next/image';

export interface ActionButtonProps {
  /** ボタンのアイコン画像 */
  icon: string | StaticImageData;
  /** ボタンのテキスト */
  text: string;
  /** アイコンのalt属性 */
  alt: string;
  /** クリックイベントハンドラ */
  onClick: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * アクションボタンコンポーネント
 * 丸いボタンにアイコンとテキストを表示する共通コンポーネント
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  text,
  alt,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition-opacity hover:opacity-80 
        w-[180px] h-[180px] bg-white rounded-full shadow-lg
        ${className}
      `.trim()}
    >
      <Image src={icon} alt={alt} width={120} height={120} />
      <span className="text-gray-900 font-semibold text-xl">
        {text}
      </span>
    </button>
  );
};

export default ActionButton;
