import { forwardRef } from "react";

const SummaryCard = forwardRef(
  ({
    Icon,
    colorText,
    colorBackgorund,
    labelName,
    description,
    record,
    unit,
    BottomIcon,
    bottomLabel,
    bottomeLabelColor,
  }) => {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-5">
          <div
            className={`w-11 h-11 rounded-xl ${colorBackgorund} flex items-center justify-center`}
          >
            <Icon size={20} className={colorText} />
          </div>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide ${colorText} ${colorBackgorund} rounded-full px-3 py-1`}
          >
            {labelName}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-1">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{record}</span>
          <span className="text-base text-slate-400 font-medium">{unit}</span>
        </div>
        {bottomLabel && (
          <p className={`text-[11px] ${bottomeLabelColor} font-medium mt-1`}>
            <span className="inline-flex items-center gap-1">
              {BottomIcon && <BottomIcon size={12} />}
              {bottomLabel}
            </span>
          </p>
        )}
      </div>
    );
  },
);

export default SummaryCard;
