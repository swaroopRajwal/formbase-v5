import { FieldLabel } from "@ui/field"

interface IFormLabelProps extends React.ComponentProps<typeof FieldLabel> {
  children: React.ReactNode
  isRequired?: boolean
}

export const FormLabel: React.FC<IFormLabelProps> = ({
  children,
  isRequired,
  ...props
}) => {
  return (
    <FieldLabel {...props}>
      {children}
      {isRequired && <span className="text-red-500">*</span>}
    </FieldLabel>
  )
}
