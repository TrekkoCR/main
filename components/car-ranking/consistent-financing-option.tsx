"use client"

import { formatCurrency } from "@/lib/utils"
import { ConsistentCard } from "@/components/ui/consistent-card"
import { Typography } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"

interface FinancingOptionProps {
  option: {
    bank: string
    downPayment: number
    downPaymentAmount: number
    financedAmount: number
    interestRate: number
    term: number
    monthlyPayment: number
  }
  onClick?: () => void
}

export function ConsistentFinancingOption({ option, onClick }: FinancingOptionProps) {
  return (
    <ConsistentCard
      className="hover:bg-accent transition-consistent cursor-pointer"
      compact
      hoverable
      shadow="sm"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <Typography variant="h5" className="font-medium">
          {option.bank}
        </Typography>
        <Badge variant="outline" className="bg-primary/10 px-2 py-0.5 text-xs">
          {option.interestRate}% interés
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Prima:
          </Typography>{" "}
          <Typography variant="small">{option.downPayment}%</Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Plazo:
          </Typography>{" "}
          <Typography variant="small">{option.term} meses</Typography>
        </div>
        <div className="col-span-2 mt-1">
          <Typography variant="small" className="font-medium">
            Cuota mensual:
          </Typography>{" "}
          <Typography variant="small" className="font-bold">
            {formatCurrency(option.monthlyPayment)}
          </Typography>
        </div>
      </div>
    </ConsistentCard>
  )
}
