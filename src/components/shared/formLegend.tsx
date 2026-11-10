import { FieldLegend } from "@ui/field"

interface IFormLegendProps extends React.ComponentProps<typeof FieldLegend> {
  children: React.ReactNode
  isRequired?: boolean
}

export const FormLegend: React.FC<IFormLegendProps> = ({
  children,
  isRequired,
  ...props
}) => {
  return (
    <FieldLegend {...props}>
      {children}
      {isRequired && <span className="text-red-500">*</span>}
    </FieldLegend>
  )
}
