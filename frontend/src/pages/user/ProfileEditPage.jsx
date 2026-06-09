import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/button";
import userApi from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";
import {
  loadCachedMemberProfile,
  persistMemberProfile,
} from "../../utils/userProfile";

function ProfileEditPage() {
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
        toast.error("회원 정보를 불러오지 못했습니다.");
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
      toast.error("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("프로필 사진은 10MB 이하만 업로드할 수 있습니다.");
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
        toast.error("이미지를 불러올 수 없습니다.");
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
        toast.success("프로필이 저장되었습니다.");
        navigate("/member");
        return;
      }

      const { data } = await userApi.updateMember(userId, payload);
      persistMemberProfile({
        ...data,
        profileImage,
      });
      toast.success("회원 정보가 수정되었습니다.");
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
        toast.success("프로필 사진은 이 브라우저에 저장되었습니다.");
        navigate("/member");
        return;
      }

      toast.error(serverMessage || "회원 정보 수정에 실패했습니다.");
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
              {userId ? "회원 정보 수정" : "프로필 편집 데모"}
            </p>
            <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
              프로필 수정
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              이름, 닉네임, 생년월일, 성별, 신체 정보를 수정할 수 있습니다.
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
            회원 정보를 불러오는 중입니다.
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
                        alt="프로필 미리보기"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      프로필 사진
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      JPG, PNG, WEBP 이미지를 올릴 수 있습니다. 사진은 이
                      브라우저에서 바로 반영됩니다.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-xl bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E293B]">
                    사진 선택
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
                    기본 이미지
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                이메일
                <input
                  value={formData.email}
                  readOnly
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                이름
                <input
                  name="username"
                  value={formData.username}
                  readOnly
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                닉네임
                <input
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none transition focus:border-[#0F172A]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                생년월일
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  disabled
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                성별
                <select
                  name="gender"
                  value={formData.gender}
                  disabled
                  className="h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none"
                >
                  <option value="">선택 안 함</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1E293B]">
                몸무게(kg)
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
                키(cm)
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

export default ProfileEditPage;
