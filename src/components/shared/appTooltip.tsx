import type {
  TooltipPositionerProps,
  TooltipTriggerProps,
} from "@base-ui/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip"

const AppTooltip: React.FC<{
  children: TooltipTriggerProps["render"]
  side?: TooltipPositionerProps["side"]
  message: string
}> = ({ children, side = "top", message }) => {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>
        <p>{message}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default AppTooltip
