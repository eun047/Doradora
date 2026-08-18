interface BackButtonProps {
  onClick?: () => void;
  iconSrc: string;
  ariaLabel?: string;
}

function BackButton({
  onClick,
  iconSrc,
  ariaLabel = "돌아가기",
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-6 top-6 z-30 flex h-15 w-15 cursor-pointer items-center justify-center transition-transform active:scale-95"
      aria-label={ariaLabel}
    >
      <img src={iconSrc} alt="뒤로가기" className="h-10 w-10" />
    </button>
  );
}

export default BackButton;
