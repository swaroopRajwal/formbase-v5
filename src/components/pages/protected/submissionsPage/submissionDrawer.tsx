import { Button } from "@ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@ui/drawer"
import type { ISubmissionsTableProps } from "./submissionsTable"
import { IconEye } from "@tabler/icons-react"
import { formatDate } from "@lib/utils"
import { Textarea } from "@ui/textarea"

interface ISubmissionDrawerProps {
  submission: ISubmissionsTableProps["submissions"][number]
}

const SubmissionDrawer: React.FC<ISubmissionDrawerProps> = ({ submission }) => {
  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        <IconEye />
        View Response
      </DrawerTrigger>
      <DrawerContent className="overflow-scroll">
        <DrawerHeader>
          <DrawerTitle>Submission</DrawerTitle>
          <DrawerDescription>
            Submitted on - {formatDate(submission.createdAt)}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          answers
          <Textarea value={JSON.stringify(submission.answers)} />
          snapshot
          <Textarea value={JSON.stringify(submission.snapshot)} />
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SubmissionDrawer
