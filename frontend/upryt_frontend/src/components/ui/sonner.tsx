import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
<<<<<<< HEAD
<<<<<<< HEAD
import type { ToasterProps } from "sonner"

=======
import type{ToasterProps} from "sonner"
>>>>>>> 04af4dcdcb5878d8bb1f8aa2479e2f580c24033e
=======
import type { ToasterProps } from "sonner"


>>>>>>> 5adbc5dfcdf76ca47f4dfdb623ef1335480ef372

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
