import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "../../components/button";
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
  const { t } = useTranslation();
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
        toast.error(t("diseaseEditPage.toast.loadFailed"));
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
        toast.success(t("diseaseEditPage.toast.demoSaved"));
        navigate("/member");
        return;
      }

      const { data } = await userApi.updateDisease(userId, {
        diseaseIndex: serializeDiseaseForm(formData),
      });
      persistMemberProfile(data);
      toast.success(t("diseaseEditPage.toast.saved"));
      navigate("/member");
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("diseaseEditPage.toast.saveFailed"),
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
              {userId ? t("diseaseEditPage.eyebrow.member") : t("diseaseEditPage.eyebrow.demo")}
            </p>
            <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
              {t("diseaseEditPage.title")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              {t("diseaseEditPage.subtitle")}
            </p>
            {!userId && (
              <p className="mt-2 text-xs font-medium text-[#2563EB]">
                {t("diseaseEditPage.demoNotice")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/member")}
            className="rounded-full border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            {t("diseaseEditPage.close")}
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-[#F8FAFC] px-5 py-16 text-center text-sm font-medium text-[#64748B]">
            {t("diseaseEditPage.loading")}
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
                    className="h-12 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none transition focus:border-[#0F172A]"
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
                {t("diseaseEditPage.cancel")}
              </Button>
              <Button
                type="submit"
                className="!rounded-xl !bg-[#0F172A] !px-5 !py-3 !text-sm hover:!bg-[#1E293B]"
                disabled={saving}
              >
                {saving ? t("diseaseEditPage.saving") : t("diseaseEditPage.submit")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DiseaseEditPage;
