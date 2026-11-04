import { drawerEntries } from "@lib/forms/submissionsTable"
import {
  answerText,
  answerType,
  formatAnswer,
  formatSubmitted,
  truncateSegments,
} from "@lib/forms/answerFormat"
import AnswerSegments from "@components/shared/answerSegments"
import {
  Dialog,
  DialogDrawerContent,
  DialogDescription,
  DialogTitle,
} from "@components/ui/dialog"
import { buildCsv, CSV_BOM, CSV_FORMAT_NOTE } from "@lib/forms/submissionsCsv"
import { useState } from "react"
import { getRouteApi, Link } from "@tanstack/react-router"

const routeApi = getRouteApi("/__protected/forms/$formId_/submissions")

const CELL_MAX = 60

const downloadCsv = (title: string, csv: string) => {
  const url = URL.createObjectURL(
    new Blob([CSV_BOM + csv], { type: "text/csv;charset=utf-8" })
  )
  const a = document.createElement("a")
  a.href = url
  a.download = `${title.replace(/[^\w-]+/g, "_") || "submissions"}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const SubmissionsPage = () => {
  const { form, columns, submissions } = routeApi.useLoaderData()
  const [openId, setOpenId] = useState<string | null>(null)
  const openSubmission = submissions.find((s) => s.id === openId)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          to="/forms/$formId"
          params={{ formId: form.id }}
          className="text-sm text-muted-foreground underline"
        >
          Back to form
        </Link>
        <h2 className="text-xl font-semibold">{form.title} - Submissions</h2>
        <p className="text-sm text-muted-foreground">
          {submissions.length}{" "}
          {submissions.length === 1 ? "submission" : "submissions"}
        </p>
        {submissions.length > 0 && (
          <button
            type="button"
            title={CSV_FORMAT_NOTE}
            className="w-fit rounded-md border px-3 py-1 text-sm"
            onClick={() =>
              downloadCsv(form.title, buildCsv(columns, submissions))
            }
          >
            Export CSV
          </button>
        )}
      </div>
      {submissions.length === 0 ? (
        <p className="text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 font-medium whitespace-nowrap">
                  Submitted (UTC)
                </th>
                {columns.map((c) => (
                  <th key={c.fieldId} className="px-3 py-2 font-medium">
                    {c.label}
                    {c.type === "datetime" && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        YYYY-MM-DD HH:mm (timezone)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2"
                  onClick={() => setOpenId(s.id)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setOpenId(s.id)
                    }
                  }}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatSubmitted(s.createdAt)}
                  </td>
                  {columns.map((c) => {
                    const type = answerType(c.fieldId, c.type, s.snapshot)
                    const value = s.answers[c.fieldId]
                    return (
                      <td
                        key={c.fieldId}
                        className="max-w-64 px-3 py-2"
                        title={answerText(type, value)}
                      >
                        <AnswerSegments
                          inline
                          segments={truncateSegments(
                            formatAnswer(type, value),
                            CELL_MAX
                          )}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog
        open={openSubmission !== undefined}
        onOpenChange={(open) => !open && setOpenId(null)}
      >
        <DialogDrawerContent>
          {openSubmission && (
            <>
              <DialogTitle>Submission</DialogTitle>
              <DialogDescription>
                {formatSubmitted(openSubmission.createdAt)}
              </DialogDescription>
              <dl className="flex flex-col gap-4">
                {drawerEntries(openSubmission).map((e) => (
                  <div key={e.fieldId} className="flex flex-col gap-1">
                    <dt className="text-sm font-medium">{e.label}</dt>
                    <dd className="text-sm break-words whitespace-pre-wrap">
                      {e.segments.length === 0 ? (
                        <span className="text-muted-foreground">No answer</span>
                      ) : (
                        <AnswerSegments segments={e.segments} />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </DialogDrawerContent>
      </Dialog>
    </section>
  )
}

export default SubmissionsPage
