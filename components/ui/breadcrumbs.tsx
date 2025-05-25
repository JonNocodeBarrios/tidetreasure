import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)} aria-label="Breadcrumb">
      <Link href="/" className="text-stone-500 hover:text-stone-700 transition-colors duration-200 flex items-center">
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-stone-400" />
          {item.href ? (
            <Link href={item.href} className="text-stone-500 hover:text-stone-700 transition-colors duration-200">
              {item.label}
            </Link>
          ) : (
            <span className="text-stone-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
