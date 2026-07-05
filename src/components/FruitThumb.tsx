import { cn } from "@/lib/utils";

const palette: Record<string, string> = {
  "🍎": "from-rose-200 to-rose-100",
  "🍊": "from-orange-200 to-amber-100",
  "🥭": "from-yellow-200 to-orange-100",
  "🍌": "from-yellow-100 to-lime-100",
  "🍇": "from-purple-200 to-fuchsia-100",
  "🍓": "from-rose-200 to-pink-100",
  "🍉": "from-red-200 to-green-100",
  "🍍": "from-yellow-200 to-amber-100",
  "🍐": "from-lime-200 to-green-100",
};

export function FruitThumb({
  emoji,
  size = "md",
  className,
}: {
  emoji: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-12 w-12 text-2xl rounded-2xl",
    md: "h-16 w-16 text-3xl rounded-2xl",
    lg: "h-24 w-24 text-5xl rounded-3xl",
    xl: "h-40 w-40 text-7xl rounded-[2rem]",
  };
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br shrink-0",
        palette[emoji] ?? "from-lime-100 to-emerald-50",
        sizes[size],
        className,
      )}
    >
      <span>{emoji}</span>
    </div>
  );
}