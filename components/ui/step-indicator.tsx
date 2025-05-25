import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  label: string
  completed: boolean
  current: boolean
}

interface StepIndicatorProps {
  steps: Step[]
  className?: string
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-4 sm:space-x-8", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                step.completed
                  ? "bg-stone-900 border-stone-900 text-white"
                  : step.current
                    ? "bg-white border-stone-900 text-stone-900"
                    : "bg-white border-stone-300 text-stone-400",
              )}
            >
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={cn("mt-2 text-xs font-medium", step.current ? "text-stone-900" : "text-stone-500")}>
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 sm:w-16 h-0.5 mx-4 transition-colors duration-300",
                steps[index + 1].completed || steps[index + 1].current ? "bg-stone-900" : "bg-stone-300",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
