import { Components } from "react-markdown";

export const Code: Components["code"] = (props) => {
  return <code className="inline-code">{props.children}</code>;
};
