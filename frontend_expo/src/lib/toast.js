// react-native-toast-message 래퍼 — 웹의 react-hot-toast 자리.
import Toast from "react-native-toast-message";

const toast = {
  success: (text1) => Toast.show({ type: "success", text1, position: "top" }),
  error: (text1) => Toast.show({ type: "error", text1, position: "top" }),
  info: (text1) => Toast.show({ type: "info", text1, position: "top" }),
};

export default toast;
