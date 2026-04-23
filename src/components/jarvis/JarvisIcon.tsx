import { iconPaths, type IconName } from "./icon-paths";

type JarvisIconProps = {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
};

export function JarvisIcon({
  name,
  size = 18,
  color = "currentColor",
  className,
}: JarvisIconProps) {
  const d = iconPaths[name] ?? iconPaths.dashboard;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
