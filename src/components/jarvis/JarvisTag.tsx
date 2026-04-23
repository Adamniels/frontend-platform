import { cn } from "@/lib/utils/cn";
import styles from "./JarvisTag.module.css";

type JarvisTagProps = {
  label: string;
  color?: string;
  className?: string;
};

export function JarvisTag({ label, color, className }: JarvisTagProps) {
  return (
    <span
      className={cn(styles.tag, className)}
      style={
        color
          ? {
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              color,
              borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            }
          : undefined
      }
    >
      {label}
    </span>
  );
}
