import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return <div className={cn(styles.card, className)}>{children}</div>;
}

type CardSectionProps = {
  children: ReactNode;
  className?: string;
};

export function CardHeader({ children, className }: CardSectionProps) {
  return <div className={cn(styles.header, className)}>{children}</div>;
}

export function CardBody({ children, className }: CardSectionProps) {
  return <div className={cn(styles.body, className)}>{children}</div>;
}
