import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "../../api/api";
import uploadApi from "../../api/uploadApi";
import { isRichTextEmpty, normalizeEditorValue } from "./richTextEditorUtils";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// 서버가 반환하는 상대 URL("/uploads/...")을 화면/저장에 쓸 절대 URL로 변환.
// base64 를 본문에 인라인하면 요청 본문이 수 MB로 커져 등록이 실패하므로,
// 이미지는 서버에 업로드하고 본문에는 URL 만 삽입한다.
function toAbsoluteUploadUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}
const FONT_OPTIONS = [
  "sans",
  "malgun-gothic",
  "nanum-gothic",
  "nanum-myeongjo",
  "gungsuh",
];
const FONT_SIZE_OPTIONS = [
  "12px",
  "14px",
  "15px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
];

const FontFormat = Quill.import("formats/font");
FontFormat.whitelist = FONT_OPTIONS;
Quill.register(FontFormat, true);

const SizeStyle = Quill.import("attributors/style/size");
SizeStyle.whitelist = FONT_SIZE_OPTIONS;
Quill.register(SizeStyle, true);

const EDITOR_PICKER_STYLE = `
  .ql-snow .ql-picker.ql-font {
    width: 118px;
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: '기본';
    font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="sans"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="sans"]::before {
    content: '기본';
    font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="malgun-gothic"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="malgun-gothic"]::before {
    content: '맑은 고딕';
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="nanum-gothic"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="nanum-gothic"]::before {
    content: '나눔고딕';
    font-family: "Nanum Gothic", "Malgun Gothic", sans-serif;
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="nanum-myeongjo"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="nanum-myeongjo"]::before {
    content: '나눔명조';
    font-family: "Nanum Myeongjo", "Batang", serif;
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="gungsuh"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="gungsuh"]::before {
    content: '궁서';
    font-family: "Gungsuh", "Batang", serif;
  }

  .ql-font-sans {
    font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  }

  .ql-font-malgun-gothic {
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  }

  .ql-font-nanum-gothic {
    font-family: "Nanum Gothic", "Malgun Gothic", sans-serif;
  }

  .ql-font-nanum-myeongjo {
    font-family: "Nanum Myeongjo", "Batang", serif;
  }

  .ql-font-gungsuh {
    font-family: "Gungsuh", "Batang", serif;
  }

  .ql-snow .ql-picker.ql-size {
    width: 72px;
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: '15';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before {
    content: '12';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before {
    content: '14';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="15px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="15px"]::before {
    content: '15';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before {
    content: '16';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before {
    content: '18';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before {
    content: '20';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before {
    content: '24';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="28px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="28px"]::before {
    content: '28';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="32px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before {
    content: '32';
  }

  .ql-container.ql-snow .ql-editor.ql-blank:focus::before {
    content: '';
  }
`;

const TOOLBAR_OPTIONS = [
  [{ font: FONT_OPTIONS }, { size: FONT_SIZE_OPTIONS }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "link", "image"],
  ["clean"],
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
}) {
  const hostRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const lastHtmlRef = useRef(normalizeEditorValue(value));

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current || quillRef.current) {
      return;
    }

    const hostElement = hostRef.current;

    const editorElement = document.createElement("div");
    hostElement.appendChild(editorElement);

    const quill = new Quill(editorElement, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });

    quillRef.current = quill;

    const initialValue = lastHtmlRef.current;
    if (initialValue) {
      quill.clipboard.dangerouslyPasteHTML(initialValue);
    }
    lastHtmlRef.current = initialValue;

    const toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async () => {
        const file = input.files?.[0];

        if (!file) {
          return;
        }

        if (!file.type.startsWith("image/")) {
          toast.error("이미지 파일만 첨부할 수 있습니다.");
          return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
          toast.error("이미지는 5MB 이하만 첨부할 수 있습니다.");
          return;
        }

        const range = quill.getSelection(true) ?? {
          index: quill.getLength(),
          length: 0,
        };

        const uploadToast = toast.loading("이미지 업로드 중...");
        try {
          const { url } = await uploadApi.uploadImage(file, "board");
          const imageUrl = toAbsoluteUploadUrl(url);

          quill.insertEmbed(range.index, "image", imageUrl, "user");
          quill.setSelection(range.index + 1, 0, "user");
          toast.success("이미지를 첨부했습니다.", { id: uploadToast });
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          toast.error("이미지 업로드에 실패했습니다.", { id: uploadToast });
        }
      };

      input.click();
    });

    quill.on("text-change", (_delta, _oldDelta, source) => {
      const html = isRichTextEmpty(quill.root.innerHTML)
        ? ""
        : quill.root.innerHTML;
      lastHtmlRef.current = html;

      if (source === "user") {
        onChangeRef.current?.(html);
      }
    });

    return () => {
      quillRef.current = null;
      hostElement.innerHTML = "";
    };
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;

    if (!quill) {
      return;
    }

    const nextValue = normalizeEditorValue(value);
    const currentValue = lastHtmlRef.current;

    if (currentValue === nextValue) {
      return;
    }

    if (!nextValue) {
      quill.setText("");
      lastHtmlRef.current = "";
      return;
    }

    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(nextValue);
    lastHtmlRef.current = nextValue;

    if (selection) {
      const safeIndex = Math.min(selection.index, quill.getLength() - 1);
      quill.setSelection(safeIndex, selection.length, "silent");
    }
  }, [value]);

  return (
    <>
      <style>{EDITOR_PICKER_STYLE}</style>
      <div
        ref={hostRef}
        className="overflow-hidden rounded-2xl border border-[#d8dee8] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition focus-within:border-[#9fb7ff] focus-within:shadow-[0_0_0_4px_rgba(96,165,250,0.18)] [&_.ql-container.ql-snow]:!border-0 [&_.ql-container.ql-snow]:!font-inherit [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:px-5 [&_.ql-editor]:py-4 [&_.ql-editor]:text-[15px] [&_.ql-editor]:leading-7 [&_.ql-editor]:text-gray-700 [&_.ql-editor_img]:my-4 [&_.ql-editor_img]:max-h-[360px] [&_.ql-editor_img]:max-w-full [&_.ql-editor_img]:rounded-xl [&_.ql-editor_img]:object-contain [&_.ql-editor_p]:mb-4 [&_.ql-editor_p:last-child]:mb-0 [&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:border-b [&_.ql-toolbar.ql-snow]:border-[#eef2f7] [&_.ql-toolbar.ql-snow]:bg-[#f8fafc] [&_.ql-toolbar.ql-snow]:px-3 [&_.ql-toolbar.ql-snow]:py-2"
      />
    </>
  );
}
