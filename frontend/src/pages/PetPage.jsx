import { Unity, useUnityContext } from "react-unity-webgl";

export default function PetPage(){

     const { unityProvider } = useUnityContext({
        loaderUrl: "/Unity/Build.loader.js",
        dataUrl: "/Unity/Build.data",
        frameworkUrl: "/Unity/Build.framework.js",
        codeUrl: "/Unity/Build.wasm",
    });
    return(
        <div>
            <Unity unityProvider={unityProvider}
                style={{width: '1500px', height: '800px'}}
            />
        </div>
    )
}