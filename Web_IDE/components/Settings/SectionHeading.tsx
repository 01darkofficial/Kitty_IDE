type SectionHeadingProps = {
  title: string
  description: string
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-5 text-zinc-500">{description}</p>
    </div>
  )
}
