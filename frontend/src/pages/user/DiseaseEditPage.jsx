import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import userApi from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";
import {
  DISEASE_FIELDS,
  createEmptyDiseaseForm,
  loadCachedMemberProfile,
  parseDiseaseIndex,
  persistMemberProfile,
  serializeDiseaseForm,
} from "../../utils/userProfile";

function DiseaseEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(createEmptyDiseaseForm);

  useEffect(() => {
    if (!userId) {
      setFormData(parseDiseaseIndex(loadCachedMemberProfile().diseaseIndex));
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        const { data } = await userApi.getMember(userId);
        setFormData(parseDiseaseIndex(data.diseaseIndex));
      } catch (error) {
        toast.error("질환 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [navigate, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      return;
    }

    try {
      setSaving(true);
      if (!userId) {
        persistMemberProfile({
          ...loadCachedMemberProfile(),
          diseaseIndex: serializeDiseaseForm(formData),
        });
        toast.success("질환 수정 화면 데모 값이 저장되었습니다.");
        navigate("/member");
        return;
      }

      const { data } = await userApi.updateDisease(userId, {
        diseaseIndex: serializeDiseaseForm(formData),
      });
      persistMemberProfile(data);
      toast.success("보유 질환 정보가 수정되었습니다.");
      navigate("/member");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "질환 정보 수정에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 pb-16 pt-[110px] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="mx-auto max-w-[760px] rounded-[28px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#64748B]">
              {userId ? "보유 질환 수정" : "질환 편집 데모"}
            </p>
            <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
              질환 정보 편집
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              현재 보유 중인 만성 질환 상태를 선택해 업데이트하세요.
            </p>
            {!userId && (
              <p className="mt-2 text-xs font-medium text-[#2563EB]">
                로그인 없이도 화면 확인이 가능하며 저장값은 브라우저에만
                보관됩니다.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/member")}
            className="rounded-full border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            닫기
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-[#F8FAFC] px-5 py-16 text-center text-sm font-medium text-[#64748B]">
            질환 정보를 불러오는 중입니다.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {DISEASE_FIELDS.map((field) => (
                <label
                  key={field.name}
                  className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]"
                >
                  {field.label}
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="h-12 appearance-none rounded-xl border border-[#CBD5E1] bg-white pl-4 pr-11 text-sm outline-none transition focus:border-[#0F172A]"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      backgroundSize: "16px",
                    }}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="!rounded-xl !px-5 !py-3 !text-sm"
                onClick={() => navigate("/member")}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="!rounded-xl !bg-[#0F172A] !px-5 !py-3 !text-sm hover:!bg-[#1E293B]"
                disabled={saving}
              >
                {saving ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DiseaseEditPage;
