import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "../../components/button";
import userApi from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";
import {
  loadCachedMemberProfile,
  persistMemberProfile,
} from "../../utils/userProfile";

function ProfileEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userId ?? user?.id;
  const cachedProfile = loadCachedMemberProfile();
  const [saving, setSaving] = useState(false);
  const [memberLoaded, setMemberLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState(
    () => cachedProfile.profileImage ?? null,
  );
  const [formData, setFormData] = useState(() => ({
    email: cachedProfile.email ?? "",
    username: cachedProfile.username ?? "",
    nickname: cachedProfile.nickname ?? "",
    birthDate: cachedProfile.birthDate ?? "",
    gender: cachedProfile.gender ?? "",
    weight: cachedProfile.weight ?? "",
    height: cachedProfile.height ?? "",
  }));

  useEffect(() => {
    if (authLoading || !userId) {
      return;
    }

    const fetchMember = async () => {
      try {
        const { data } = await userApi.getMember(userId);
        setFormData({
          email: data.email ?? "",
          username: data.username ?? "",
          nickname: data.nickname ?? "",
          birthDate: data.birthDate ?? "",
          gender: data.gender ?? "",
          weight: data.weight ?? "",
          height: data.height ?? "",
        });
        setProfileImage(loadCachedMemberProfile().profileImage ?? null);
      } catch {
        toast.error(t("profileEditPage.toast.loadFailed"));
      } finally {
        setMemberLoaded(true);
      }
    };

    fetchMember();
  }, [authLoading, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(t("profileEditPage.toast.imageOnly"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("profileEditPage.toast.imageTooLarge"));
      return;
    }

    // localStorage quota 초과 방지를 위해 256x256 JPEG 으로 축소
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : null;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        const MAX = 256;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setProfileImage(dataUrl);
      };
      img.onerror = () => {
        toast.error(t("profileEditPage.toast.imageLoadFailed"));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const previousProfile = loadCachedMemberProfile();
    const hasProfileImageChanged =
      profileImage !== previousProfile.profileImage;

    try {
      setSaving(true);
      // 0 이나 빈 문자열은 backend @DecimalMin(0.1) 에 걸리므로 null 로 보냄
      const numOrNull = (v) => {
        if (v === "" || v == null) return null;
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      const payload = {
        nickname: formData.nickname.trim(),
        weight: numOrNull(formData.weight),
        height: numOrNull(formData.height),
      };

      if (!userId) {
        persistMemberProfile({
          ...loadCachedMemberProfile(),
          ...payload,
          profileImage,
        });
        toast.success(t("profileEditPage.toast.profileSaved"));
        navigate("/member");
        return;
      }

      const { data } = await userApi.updateMember(userId, payload);
      persistMemberProfile({
        ...data,
        profileImage,
      });
      toast.success(t("profileEditPage.toast.memberUpdated"));
      navigate("/member");
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.defaultMessage ||
        error.response?.data?.error ||
        error.message;
      console.error("[ProfileEditPage] updateMember failed:", error.response?.data || error);

      if (hasProfileImageChanged) {
        persistMemberProfile({
          ...previousProfile,
          profileImage,
        });
        toast.success(t("profileEditPage.toast.imageSavedLocally"));
        navigate("/member");
        return;
      }

      toast.error(serverMessage || t("profileEditPage.toast.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const loading = authLoading || (!!userId && !memberLoaded);

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 pb-16 pt-[110px] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="mx-auto max-w-[760px] rounded-[28px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#64748B]">
              {userId
                ? t("profileEditPage.eyebrow.member")
                : t("profileEditPage.eyebrow.demo")}
            </p>
            <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
              {t("profileEditPage.title")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              {t("profileEditPage.description")}
            </p>
            {!userId && (
              <p className="mt-2 text-xs font-medium text-[#2563EB]">
                {t("profileEditPage.demoNotice")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/member")}
            className="rounded-full border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            {t("profileEditPage.close")}
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-[#F8FAFC] px-5 py-16 text-center text-sm font-medium text-[#64748B]">
            {t("profileEditPage.loading")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] text-4xl text-[#64748B]">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={t("profileEditPage.imageAlt")}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {t("profileEditPage.imageLabel")}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      {t("profileEditPage.imageHint")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-xl bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E293B]">
                    {t("profileEditPage.selectImage")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveProfileImage}
                    className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-white"
                  >
                    {t("profileEditPage.defaultImage")}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.email")}
                <input
                  value={formData.email}
                  readOnly
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.username")}
                <input
                  name="username"
                  value={formData.username}
                  readOnly
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.nickname")}
                <input
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none transition focus:border-[#0F172A]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.birthDate")}
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  disabled
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.gender")}
                <select
                  name="gender"
                  value={formData.gender}
                  disabled
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                >
                  <option value="">{t("profileEditPage.gender.none")}</option>
                  <option value="남성">{t("profileEditPage.gender.male")}</option>
                  <option value="여성">{t("profileEditPage.gender.female")}</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.weight")}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="h-12 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none transition focus:border-[#0F172A]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                {t("profileEditPage.field.height")}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="h-12 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none transition focus:border-[#0F172A]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="!rounded-xl !px-5 !py-3 !text-sm"
                onClick={() => navigate("/member")}
              >
                {t("profileEditPage.cancel")}
              </Button>
              <Button
                type="submit"
                className="!rounded-xl !bg-[#0F172A] !px-5 !py-3 !text-sm hover:!bg-[#1E293B]"
                disabled={saving}
              >
                {saving
                  ? t("profileEditPage.saving")
                  : t("profileEditPage.save")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfileEditPage;
