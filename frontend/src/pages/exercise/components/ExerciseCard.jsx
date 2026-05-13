import CardRow from "./CardRow";

function ExerciseCard({ item }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-[#fcfcfc] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-sm">
          {item.icon}
        </div>
        <p className="text-base font-semibold text-[#1f2937]">{item.name}</p>
      </div>

      <div className="space-y-2">
        {item.type === "strength" ? (
          <>
            <CardRow label="세트 수" value={item.sets} />
            <CardRow label="횟 수" value={item.reps} />
            <CardRow label="강도" value={item.intensity} />
            <CardRow label="소모칼로리" value={item.kcal} />
          </>
        ) : (
          <>
            <CardRow label="시간" value={item.time} />
            <CardRow label="강도" value={item.intensity} />
            <CardRow label="소모칼로리" value={item.kcal} />
          </>
        )}
      </div>
    </div>
  );
}

export default ExerciseCard;
