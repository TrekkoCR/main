import { formatCurrency } from "@/lib/utils"

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
}

export function FinancingOption({ option }: FinancingOptionProps) {
  return (
    <div className="border rounded-md p-3 hover:bg-accent transition-colors cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{option.bank}</h4>
        <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">{option.interestRate}% interés</span>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
        <div>
          <span className="text-muted-foreground">Prima:</span> <span>{option.downPayment}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Plazo:</span> <span>{option.term} meses</span>
        </div>
        <div className="col-span-2 mt-1">
          <span className="font-medium">Cuota mensual:</span>{" "}
          <span className="font-bold">{formatCurrency(option.monthlyPayment)}</span>
        </div>
      </div>
    </div>
  )
}
