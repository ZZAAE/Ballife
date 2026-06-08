import { useCallback, useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useAuth } from "../contexts/AuthContext";
import petApi from "../api/petApi";
import userApi from "../api/userApi";

export default function PetPage() {
    const { user } = useAuth();
    const userId = user?.userId ?? null;

    const {
        unityProvider,
        sendMessage,
        addEventListener,
        removeEventListener,
    } = useUnityContext({
        loaderUrl: "/Unity/Build.loader.js",
        dataUrl: "/Unity/Build.data",
        frameworkUrl: "/Unity/Build.framework.js",
        codeUrl: "/Unity/Build.wasm",
        streamingAssetsUrl: "/Unity/StreamingAssets",
    });

    // 테스트용 더미 — fetch 성공 시 실데이터로 덮어쓰고, 실패하면 이 값이 그대로 남음
    const [petState, setPetState] = useState({
        equippedHat: 1002,
        equippedBG: 2001,
        points: 2500,
        ownedItemIds: [1001, 1002, 1007, 2001, 2003],
    });

    const [loaded, setLoaded] = useState(false); // fetch 시도 완료 여부(성공/실패 무관)
    const [unityReady, setUnityReady] = useState(false);
    const queueRef = useRef([]); // ready 전 보낸 메시지 임시 보관

    // handleMessage 가 마운트 시점 1회만 구독돼 userId 를 클로저에 고정하므로,
    // 항상 최신 userId 를 보도록 ref 로 동기화한다.
    const userIdRef = useRef(userId);
    userIdRef.current = userId;

    // React → Unity 전송 (ready 전이면 큐잉)
    const send = useCallback((type, payload) => {
        const json = JSON.stringify({ type, payload });
        if (unityReady) {
            sendMessage("ReactBrideController", "OnReactMessage", json);
        } else {
            queueRef.current.push(json);
        }
    }, [unityReady, sendMessage]);

    // ① 진입 시 펫 정보 + 보유 에셋 fetch (실패하면 더미 유지)
    useEffect(() => {
        if (!userId) {
            setLoaded(true); // userId 없으면 더미로 진행
            return undefined;
        }
        let cancelled = false;

        (async () => {
            try {
                const [petRes, assetRes, memberRes] = await Promise.all([
                    petApi.getPetInfo(userId),
                    petApi.getAssetList(userId),
                    userApi.getMember(userId),       // point 는 회원정보(UserResponse)에서
                ]);
                if (cancelled) return;

                const pet = petRes.data;        // { hat, house, backGround }
                const assets = assetRes.data;   // [{ itemId }, ...]
                const member = memberRes.data;  // { ..., point, ... }

                setPetState({
                    equippedHat: pet.hat,
                    equippedBG: pet.backGround,
                    points: member.point ?? 0,                 // null 이면 0
                    ownedItemIds: (assets ?? []).map((a) => a.itemId),
                });
            } catch (e) {
                console.error("펫 정보 로딩 실패 — 더미데이터로 진행:", e);
            } finally {
                if (!cancelled) setLoaded(true);
            }
        })();

        return () => { cancelled = true; };
    }, [userId]);

    // ② Unity → React 수신
    useEffect(() => {
        const handleReady = () => setUnityReady(true);

        const handleMessage = (json) => {
            try {
                const msg = JSON.parse(json);
                switch (msg.type) {
                    // Unity 가 새로 장착한 모자 아이템 ID 를 보냄
                    case "HAT_CHANGED": {
                        const { equippedHat } = msg.payload;
                        setPetState((s) => ({ ...s, equippedHat }));
                        console.log("모자 변경:", msg.payload);
                        petApi.updatePetInfo(userIdRef.current, { hat: equippedHat })
                            .catch((e) => console.error("모자 저장 실패:", e));
                        break;
                    }
                    // Unity 가 새로 장착한 배경 아이템 ID 를 보냄
                    case "BG_CHANGED": {
                        const { equippedBG } = msg.payload;
                        setPetState((s) => ({ ...s, equippedBG }));
                        console.log("배경 변경:", msg.payload);
                        petApi.updatePetInfo(userIdRef.current, { backGround: equippedBG })
                            .catch((e) => console.error("배경 저장 실패:", e));
                        break;
                    }
                    // Unity 가 갱신된 포인트 총량을 보냄
                    case "POINTS_CHANGED": {
                        const { points } = msg.payload; // int
                        setPetState((s) => ({ ...s, points }));
                        console.log("포인트 변경:", msg.payload);
                        // TODO: DB 연동 시 → 포인트 갱신 API
                        break;
                    }
                    // Unity 에서 아이템 구매 처리 (포인트 차감 + 보유목록 추가)
                    case "PURCHASE_ITEM": {
                        const { remainPoint, purchasedItemId } = msg.payload;
                        setPetState((prev) => ({
                            ...prev,
                            points: remainPoint,
                            ownedItemIds: prev.ownedItemIds.includes(purchasedItemId)
                                ? prev.ownedItemIds
                                : [...prev.ownedItemIds, purchasedItemId],
                        }));
                        console.log("아이템 구매:", msg.payload);
                        petApi.createAsset(userIdRef.current, { itemId: purchasedItemId })
                            .catch((e) => console.error("아이템 구매 저장 실패:", e));
                        break;
                    }
                    case "PET_STATUS_CHANGED":
                        console.log("펫 상태 변경:", msg.payload);
                        break;
                    default:
                        console.log("알 수 없는 메시지:", msg);
                }
            } catch {
                console.error("Unity 메시지 파싱 실패:", json);
            }
        };

        addEventListener("unityReady", handleReady);
        addEventListener("unityMessage", handleMessage);
        return () => {
            removeEventListener("unityReady", handleReady);
            removeEventListener("unityMessage", handleMessage);
        };
    }, [addEventListener, removeEventListener]);

    // ③ Unity ready + 데이터 로딩 둘 다 끝났을 때만 INIT_PET 전송 (레이스 방지)
    useEffect(() => {
        if (!unityReady || !loaded) return;

        queueRef.current.forEach((json) =>
            sendMessage("ReactBrideController", "OnReactMessage", json)
        );
        queueRef.current = [];

        send("INIT_PET", petState);
        // petState 를 deps 에 넣으면 매번 재전송되므로 의도적으로 제외
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unityReady, loaded, sendMessage, send]);

    return (
        <div className="h-[calc(100vh-48px)] w-full bg-[#F9FAFB] font-['Noto_Sans_KR']">
            <Unity
                unityProvider={unityProvider}
                style={{ width: "100%", height: "100%", display: "block" }}
            />
        </div>
    );
}
