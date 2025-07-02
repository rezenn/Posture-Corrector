import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
<<<<<<< HEAD
import type { ToasterProps } from "sonner"

=======
import type{ToasterProps} from "sonner"
>>>>>>> 447e4c075acc178bff2968092fa0b0b8711573c7

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
