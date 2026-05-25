import { Unity, useUnityContext } from "react-unity-webgl";

export default function PetPage(){

    const { unityProvider } = useUnityContext({
        loaderUrl: "/Unity/Build.loader.js",
        dataUrl: "/Unity/Build.data",
        frameworkUrl: "/Unity/Build.framework.js",
        codeUrl: "/Unity/Build.wasm",
    });
    return(
        <div className="h-[calc(100vh-151px)] w-full bg-[#F9FAFB] font-['Noto_Sans_KR']">
            <Unity
                unityProvider={unityProvider}
                style={{width: '100%', height: '100%', display: 'block'}}
            />
        </div>
    )
}
