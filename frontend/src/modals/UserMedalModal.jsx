import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import medalApi from "../api/medalApi";
import userApi from "../api/userApi";
import { useAuth } from "../contexts/AuthContext";

/*
 * UserMedalModal
 * props:
 *  - open:    모달 열림 여부
 *  - onClose: 닫기 핸들러
 */
export default function UserMedalModal({ open, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [myMedals, setMyMedals] = useState([]);
  const [allMedals, setAllMedals] = useState([]);
  const [equippedMedalId, setEquippedMedalId] = useState(null);
  const [totalPoint, setTotalPoint] = useState(0); // 누적 포인트 (User.usePointCount)
  const [loading, setLoading] = useState(false);
  const [equipping, setEquipping] = useState(null); // 장착 중인 medalId

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [myRes, allRes, userRes] = await Promise.all([
          medalApi.getMyMedals(),
          medalApi.getAllMedals(),
          userId ? userApi.getMember(userId) : Promise.resolve({ data: {} }),
        ]);
        setMyMedals(myRes.data);
        setAllMedals(allRes.data);
        setEquippedMedalId(userRes.data?.medalId ?? null);
        setTotalPoint(userRes.data?.usePointCount ?? 0);
      } catch {
        toast.error(t("userMedalModal.toast.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [open, userId]);

  const handleEquip = async (medalId) => {
    setEquipping(medalId);
    try {
      await medalApi.equipMedal(medalId);
      setEquippedMedalId(medalId);
      toast.success(t("userMedalModal.toast.equipped"));
    } catch {
      toast.error(t("userMedalModal.toast.equipFailed"));
    } finally {
      setEquipping(null);
    }
  };

  if (!open) return null;

  const myMedalIds = new Set(myMedals.map((m) => m.medalId));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#0F172A]">🏅 {t("userMedalModal.title")}</h2>
            {/* 누적 포인트 — 마이페이지의 "{value} P" 숫자 표기 재사용 */}
            <span className="flex items-center gap-1 rounded-full bg-[#0f1c33] px-2.5 py-1 text-[11px] font-semibold text-white">
              <span className="text-white/60">{t("userMedalModal.totalPointsLabel")}</span>
              <span className="tabular-nums">
                {t("userInformation.pointsValue", {
                  value: Number(totalPoint ?? 0).toLocaleString(),
                })}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">{t("userMedalModal.loading")}</p>
        ) : (
          <>
            {/* 보유 메달 */}
            <div className="mb-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                {t("userMedalModal.ownedMedalsLabel")}
              </p>
              {myMedals.length === 0 ? (
                <p className="text-sm text-gray-400">{t("userMedalModal.noMedals")}</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {myMedals.map((m) => {
                    const isEquipped = m.medalId === equippedMedalId;
                    const isEquipping = equipping === m.medalId;
                    return (
                      <button
                        key={m.medalId}
                        type="button"
                        disabled={isEquipped || isEquipping}
                        onClick={() => handleEquip(m.medalId)}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-3 transition-all ${
                          isEquipped
                            ? "border-yellow-300 bg-yellow-50 cursor-default"
                            : "border-blue-100 bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer"
                        }`}
                      >
                        <img
                          src={m.medalIcon}
                          alt={m.medalName}
                          className="h-10 w-10 object-contain"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <span className="text-[12px] font-semibold text-[#0F172A]">
                          {m.medalName}
                        </span>
                        {isEquipped ? (
                          <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {t("userMedalModal.equipped")}
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                            {isEquipping ? t("userMedalModal.equipping") : t("userMedalModal.equip")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 전체 메달 목록 */}
            <div>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                {t("userMedalModal.allMedalsLabel")}
              </p>
              <div className="flex max-h-52 flex-col gap-2 overflow-y-auto pr-1">
                {allMedals.map((m) => {
                  const owned = myMedalIds.has(m.medalId);
                  const isEquipped = m.medalId === equippedMedalId;
                  return (
                    <div
                      key={m.medalId}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                        owned
                          ? "border-blue-100 bg-blue-50"
                          : "border-gray-100 bg-gray-50 opacity-50"
                      }`}
                    >
                      <img
                        src={m.medalIcon}
                        alt={m.medalName}
                        className="h-8 w-8 object-contain"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#0F172A]">
                          {m.medalName}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {t("userMedalModal.priceRequired", { price: m.medalPrice?.toLocaleString() })}
                        </p>
                      </div>
                      {isEquipped ? (
                        <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {t("userMedalModal.equipped")}
                        </span>
                      ) : owned ? (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {t("userMedalModal.owned")}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
