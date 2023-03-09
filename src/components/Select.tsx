import chroma from "chroma-js";

interface ColourOption {
  value: string;
  label: string;
  color: string;
  isFixed?: boolean;
}

export const colourOptions: ColourOption[] = [
  { value: "깨끗해요", label: "깨끗해요", color: "#00B8D9", isFixed: true },
  // { value: "시설이좋아요", label: "시설이좋아요", color: "#00B8D9" },
  { value: "친절해요", label: "친절해요", color: "#00B8D9" },
  { value: "꼼꼼해요", label: "꼼꼼해요", color: "#00B8D9", isFixed: true },
  { value: "저렴해요", label: "저렴해요", color: "#00B8D9" },
  // { value: "yellow", label: "Yellow", color: "#FFC400" },
  // { value: "green", label: "Green", color: "#36B37E" },
  // { value: "forest", label: "Forest", color: "#00875A" },
  // { value: "slate", label: "Slate", color: "#253858" },
  // { value: "silver", label: "Silver", color: "#666666" },
];

interface Styles {
  [key: string]: (styles: any, data: any) => any;
}

export const colourStyles: Styles = {
  control: (styles: any) => ({
    ...styles,
    backgroundColor: "#f5f2f0",
    opacity: "1",
  }),
  option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? data.color
        : isFocused
        ? color.alpha(0.1).css()
        : undefined,
      color: isDisabled
        ? "#ccc"
        : isSelected
        ? chroma.contrast(color, "white") > 2
          ? "white"
          : "black"
        : data.color,
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled
          ? isSelected
            ? data.color
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  multiValue: (styles: any, { data }: any) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles: any, { data }: any) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles: any, { data }: any) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
};
