import { useCallback, useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

export default function PetPage() {
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

    // 차후 MySQL 에서 불러올 펫 상태 (지금은 더미)
    const [petState, setPetState] = useState({
        equippedHat: 1002,
        equippedBG: 2001,
        points: 2500,
        ownedItemIds: [1001, 1002, 1007, 2001, 2003],
    });

    const [unityReady, setUnityReady] = useState(false);
    const queueRef = useRef([]); // ready 전 보낸 메시지 임시 보관

    // React → Unity 전송 (ready 전이면 큐잉)
    const send = useCallback((type, payload) => {
        const json = JSON.stringify({ type, payload });
        if (unityReady) {
            sendMessage("ReactBrideController", "OnReactMessage", json);
        } else {
            queueRef.current.push(json);
        }
    }, [unityReady, sendMessage]);

    // Unity → React 수신
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
                        // TODO: DB 연동 시 → userPetApi.updateEquip(equippedHat)
                        break;
                    }
                    // Unity 가 새로 장착한 배경 아이템 ID 를 보냄
                    case "BG_CHANGED": {
                        const { equippedBG } = msg.payload;
                        setPetState((s) => ({ ...s, equippedBG }));
                        console.log("배경 변경:", msg.payload);
                        // TODO: DB 연동 시 → userPetApi.updateEquip(equippedBG)
                        break;
                    }
                    // Unity 가 갱신된 포인트 총량을 보냄
                    case "POINTS_CHANGED": {
                        const { points } = msg.payload; // int
                        setPetState((s) => ({ ...s, points }));
                        console.log("포인트 변경:", msg.payload);
                        // TODO: DB 연동 시 → userPetApi.updatePoints(points)
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

    // ready 되는 순간: 큐 비우기 + 초기 데이터 1회 전송
    useEffect(() => {
        if (!unityReady) return;

        queueRef.current.forEach((json) =>
            sendMessage("ReactBrideController", "OnReactMessage", json)
        );
        queueRef.current = [];

        send("INIT_PET", petState);
        // petState 를 deps 에 넣으면 매번 재전송되므로 의도적으로 제외
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unityReady, sendMessage, send]);

    return (
        <div className="h-[calc(100vh-151px)] w-full bg-[#F9FAFB] font-['Noto_Sans_KR']">
            <Unity
                unityProvider={unityProvider}
                style={{ width: "100%", height: "100%", display: "block" }}
            />
        </div>
    );
}