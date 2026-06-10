import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./i18n";
import "./index.css";
import App from "./App.jsx";

/**
 * Unity WebGL(captureAllKeyboardInput)은 키보드 이벤트를 document/window 에 직접
 * 등록하고 preventDefault() 를 호출해, 페이지의 HTML input/textarea 에서 영문·
 * 스페이스·백스페이스의 기본 입력 동작을 막아버린다(한글 IME 만 우회되어 동작).
 *
 * 해결: document/window 에 등록되는 키보드 리스너를 감싸서, 이벤트 대상이 입력
 * 필드(input/textarea/contentEditable)일 때는 그 핸들러 안에서의 preventDefault()
 * 를 무력화한다. 이벤트 전파는 건드리지 않으므로 React 의 onChange 등은 정상
 * 동작하고, 입력 필드의 기본 글자 입력만 되살아난다. capture/bubble, document/
 * window 어느 경우든 통한다. 게임 캔버스가 포커스된 경우(대상이 입력 필드가
 * 아님)에는 Unity 동작에 영향을 주지 않는다.
 */
(function neutralizeUnityKeyboardCapture() {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const isKeyEvent = (t) => t === "keydown" || t === "keypress" || t === "keyup";
  const isEditable = (el) =>
    !!el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable === true);

  function patchTarget(target) {
    const origAdd = target.addEventListener.bind(target);
    const origRemove = target.removeEventListener.bind(target);
    const wrappedByListener = new WeakMap();

    target.addEventListener = function (type, listener, options) {
      if (isKeyEvent(type) && typeof listener === "function") {
        let wrapped = wrappedByListener.get(listener);
        if (!wrapped) {
          wrapped = function (event) {
            if (isEditable(event.target)) {
              const realPreventDefault = event.preventDefault;
              event.preventDefault = function () {}; // no-op while typing in a field
              try {
                return listener.call(this, event);
              } finally {
                event.preventDefault = realPreventDefault;
              }
            }
            return listener.call(this, event);
          };
          wrappedByListener.set(listener, wrapped);
        }
        return origAdd(type, wrapped, options);
      }
      return origAdd(type, listener, options);
    };

    target.removeEventListener = function (type, listener, options) {
      if (isKeyEvent(type) && typeof listener === "function") {
        const wrapped = wrappedByListener.get(listener);
        if (wrapped) return origRemove(type, wrapped, options);
      }
      return origRemove(type, listener, options);
    };
  }

  patchTarget(document);
  patchTarget(window);
})();

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          containerStyle={{ top: 72 }}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
);
