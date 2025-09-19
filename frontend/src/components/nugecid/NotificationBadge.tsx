import React from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'

interface NotificationBadgeProps {
  count: number
  onClick?: () => void
  className?: string
  showAnimation?: boolean
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onClick,
  className,
  showAnimation = true
}) => {
  const hasNotifications = count > 0
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Scroll para as notificações por padrão
      const element = document.getElementById('prorrogacao-notifications')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative p-2 h-auto',
              hasNotifications && 'text-orange-600 hover:text-orange-700',
              className
            )}
            onClick={handleClick}
          >
            {hasNotifications && showAnimation ? (
              <BellRing className={cn(
                'w-5 h-5 transition-all duration-300',
                showAnimation && 'animate-pulse'
              )} />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            
            {hasNotifications && (
              <Badge 
                variant="destructive" 
                className={cn(
                  'absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold',
                  'min-w-[1.25rem] rounded-full',
                  showAnimation && count > 0 && 'animate-bounce'
                )}
              >
                {count > 99 ? '99+' : count}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {hasNotifications 
              ? `${count} ${count === 1 ? 'prorrogação pendente' : 'prorrogações pendentes'}`
              : 'Nenhuma prorrogação pendente'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default NotificationBadge