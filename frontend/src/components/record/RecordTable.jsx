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
		<div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
			<div className="border-b border-gray-100 px-6 py-5">
				<h2 className="text-lg font-bold text-gray-900">{title}</h2>
			</div>

			<div className="hidden overflow-x-auto md:block">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-gray-50 text-xs text-gray-500">
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

			<div className="divide-y divide-gray-100 md:hidden">
				{rows.map((row, index) => renderMobileCard(row, index))}
			</div>

			<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
		</div>
	);
}
