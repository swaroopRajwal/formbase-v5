import { cn } from "cn"

interface IPageWrapperProps {
  children: React.ReactNode
  header?: React.ReactNode
  wrapperRootProps?: React.ComponentPropsWithoutRef<"main">
}

const PageWrapper: React.FC<
  React.ComponentPropsWithoutRef<"div"> & IPageWrapperProps
> = ({ children, header, className, wrapperRootProps, ...props }) => {
  return (
    <main className={cn("min-h-screen", wrapperRootProps?.className)}>
      {header ? header : <></>}
      <div {...props} className={cn("w-full max-w-6xl mx-auto p-6", className)}>
        {children}
      </div>
    </main>
  )
}

export default PageWrapper
