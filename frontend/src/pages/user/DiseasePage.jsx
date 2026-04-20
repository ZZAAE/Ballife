
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';

const diseaseFields = [
	{ name: 'hyperlipidemia', label: '고지혈증 보유 여부',
        options: [
            { value: 'NONE', label: '해당 없음' },
            { value: 'type1', label: '1형' },
            { value: 'type2', label: '2형' },
        ]
    },
	{ name: 'hypertension', label: '고혈압 보유 여부',
        options: [
            { value: 'NONE', label: '해당 없음' },
            { value: 'mild', label: '경증' },
            { value: 'severe', label: '중증' },
        ]
     },
	{ name: 'osteoporosis', label: '골다공증 보유 여부',
        options: [
            { value: 'NONE', label: '해당 없음' },
            { value: 'osteopenia', label: '골감소증' },
            { value: 'osteoporosis', label: '골다공증' },
        ]
     },
	{ name: 'diabetes', label: '당뇨 보유 여부',
        options: [
            { value: 'NONE', label: '해당 없음' },
            { value: 'type1', label: '1형' },
            { value: 'type2', label: '2형' },
            { value: 'GESTATIONAL', label: '임신성' }
        ]
     },
	{ name: 'gout', label: '통풍 보유 여부',
        options: [
            { value: 'NONE', label: '해당 없음' },
            { value: 'ASYMPTOMATIC', label: '고요산혈증' },
            { value: 'ACUTE', label: '급성' },
            { value: 'INTERMITTENT', label: '간헐기' },
            { value: 'CHRONIC', label: '만성' },
        ]
    },
];


function DiseasePage() {

    // 초기값 세팅 - 질환 필드명 기준으로 'NONE'으로 초기화
	const [formData, setFormData] = useState(() => (
		diseaseFields.reduce((acc, field) => {
			acc[field.name] = 'NONE';
			return acc;
		}, {})
	));

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		toast.success('보유 질환 정보가 선택되었습니다.');
		console.log('disease form data', formData);
	};

	return (
		<div className="flex min-h-[calc(100vh-10rem)]  bg-white px-8 py-10">
			<div className="mx-auto flex min-h-full w-full flex-col rounded-[28px]   bg-white px-8 py-10  sm:px-10">
				<h1 className="text-3xl font-bold tracking-tight text-gray-950">보유 질환 체크</h1>

				<form onSubmit={handleSubmit} className="mt-10 flex flex-1 flex-col">
					<div className="space-y-6">
						{diseaseFields.map((field) => (
							<div key={field.name} className="space-y-2">
								<label htmlFor={field.name} className="block text-base font-semibold text-gray-900">
									{field.label}
								</label>

								<div className="relative">
									<select
										id={field.name}
										name={field.name}
										value={formData[field.name]}
										onChange={handleChange}
										className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 pr-12 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
									>
										{field.options.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>

									<span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
										<svg
											className="h-4 w-4"
											viewBox="0 0 20 20"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
										>
											<path
												d="M5 7.5L10 12.5L15 7.5"
												stroke="currentColor"
												strokeWidth="1.8"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</span>
								</div>
							</div>
						))}
					</div>

					<Button type="submit" className="mt-auto h-12 w-full !rounded-lg !bg-black !text-sm !font-semibold !text-white hover:!bg-gray-900 focus:!ring-black">
						완료
					</Button>
				</form>
			</div>
		</div>
	);
}

export default DiseasePage;