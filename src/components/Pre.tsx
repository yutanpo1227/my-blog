import { isValidElement, ReactNode } from "react";
import { Components } from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";

function getLanguage(className: string) {
  const match = /language-(\w+)/.exec(className);
  return match && match[1] ? match[1] : "";
}

function getChildren(children: ReactNode) {
  if (isValidElement(children)) {
    return children;
  }
  throw new Error("Invalid children");
}

export const Pre: Components["pre"] = (props) => {
  // `pre > code`の構造になっているため、`code`要素を取得する
  const codeElement = getChildren(props.children);
  // `code`要素の`className`属性から言語を取得する
  const lang = getLanguage(codeElement.props.className ?? "");

  return (
    <Prism style={style} language={lang} showLineNumbers>
      {String(codeElement.props.children).replace(/\n$/, "")}
    </Prism>
  );
};
