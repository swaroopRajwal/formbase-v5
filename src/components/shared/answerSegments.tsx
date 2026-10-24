import type { AnswerSegment } from "@lib/forms/answerFormat"

// Renders answer segments; Other answers are italic with an "Other:" prefix.
// `inline` joins them with commas (table), otherwise one per line (drawer).
const AnswerSegments = ({
  segments,
  inline = false,
}: {
  segments: AnswerSegment[]
  inline?: boolean
}) =>
  segments.map((seg, i) => (
    <span key={i} className={inline ? undefined : "block"}>
      {inline && i > 0 && ", "}
      {seg.other ? <span className="italic">Other: {seg.text}</span> : seg.text}
    </span>
  ))

export default AnswerSegments
