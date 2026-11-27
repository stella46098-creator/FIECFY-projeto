export default function Skeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex animate-pulse items-center gap-3 rounded-lg bg-white/[0.04] p-3">
          <div className="h-14 w-14 rounded-md bg-zinc-700" />
          <div className="flex-1 space-y-2"><div className="h-3 w-2/5 rounded bg-zinc-700"/><div className="h-3 w-1/4 rounded bg-zinc-800"/></div>
        </div>
      ))}
    </div>
  )
}
