import Pagination from "./Pagination";
// 표 영역 전체 컴포넌트 
export default function RecordTable({
	title,
	columns,
	rows,
	renderDesktopRow,
	renderMobileCard,
	currentPage,
	totalPages,
	onPageChange,
}) {
	return (
		<div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
			<div className="border-b border-[#E5E7EB] px-6 py-5">
				<h2 className="text-[18px] font-bold text-[#0F172A]">{title}</h2>
			</div>

			<div className="hidden overflow-x-auto md:block">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-[#F9FAFB] text-xs text-[#64748B]">
							{columns.map((column) => (
								<th key={column} className="px-6 py-3 text-center font-medium">
									{column}
								</th>
							))}
						</tr>
					</thead>
					<tbody>{rows.map((row, index) => renderDesktopRow(row, index))}</tbody>
				</table>
			</div>

			<div className="divide-y divide-[#E5E7EB] md:hidden">
				{rows.map((row, index) => renderMobileCard(row, index))}
			</div>

			<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
		</div>
	);
}
