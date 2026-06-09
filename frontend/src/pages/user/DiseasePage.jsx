
import { useState } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom"; // 페이지 이동
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';
import Button from '../../components/button';
import authApi from "../../api/authApi";
import { DISEASE_FIELDS } from "../../utils/userProfile";
import petApi from "../../api/petApi";

function DiseasePage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const singUpFormData = location.state;

    // 초기값 세팅 - 질환 필드명 기준으로 'NONE'으로 초기화
	const [formData, setFormData] = useState(() => (
		DISEASE_FIELDS.reduce((acc, field) => {
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

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			setLoading(true);
			//질병 정보 Key: Value 형태로 변환
			const diseaseIndex = Object.entries(formData)
            .filter(([, value]) => value !== 'NONE')
            .map(([key, value]) => `${key}:${value}`)
            .join(',');

			const response = await authApi.signUp({
				loginId: singUpFormData.loginId,
				password: singUpFormData.password,
				username: singUpFormData.username,
				email: singUpFormData.email,
				birthDate: singUpFormData.birthDate,
				nickname: singUpFormData.nickname, // 이거문젠가
				gender: singUpFormData.gender,
				weight: singUpFormData.weight,
				height: singUpFormData.height,
				diseaseIndex: diseaseIndex
			});
			await petApi.createPet(response.data.userId);
			toast.success(t('diseasePage.toast.signUpComplete'));
			console.log('disease form data', formData);
			navigate("/login"); // <Link to = "/login">로그인</Link>
		} catch (error) {
			console.error("회원가입 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-screen items-center justify-center overflow-hidden bg-white px-4 py-6 md:px-8">
			<div className="flex w-full max-w-md flex-col rounded-[28px] bg-white px-6 py-6 sm:px-10 lg:w-1/3 lg:max-w-none">
				<h1 className="text-2xl font-bold tracking-tight text-gray-950">{t('diseasePage.title')}</h1>

				<form onSubmit={handleSubmit} className="mt-6 flex flex-col">
					<div className="space-y-3">
						{DISEASE_FIELDS.map((field) => (
							<div key={field.name} className="space-y-1.5">
								<label htmlFor={field.name} className="block text-sm font-semibold text-gray-900">
									{field.label}
								</label>

								<div className="relative">
									<select
										id={field.name}
										name={field.name}
										value={formData[field.name]}
										onChange={handleChange}
										className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 pr-12 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
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

					<Button type="submit" className="mt-6 h-11 w-full !rounded-lg !bg-black !text-sm !font-semibold !text-white hover:!bg-gray-900 focus:!ring-black">
						{t('diseasePage.submit')}
					</Button>
				</form>
			</div>
		</div>
	);
}

export default DiseasePage;