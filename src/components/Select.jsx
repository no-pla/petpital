import chroma from "chroma-js";

export const colourOptions = [
  { value: "깨끗해요", label: "깨끗해요", color: "#00B8D9", isFixed: true },
  { value: "시설이좋아요", label: "시설이좋아요", color: "#0052CC" },
  { value: "친절해요", label: "친절해요", color: "#5243AA" },
  { value: "꼼꼼해요", label: "꼼꼼해요", color: "#FF5630", isFixed: true },
  { value: "저렴해요", label: "저렴해요", color: "#FF8B00" },
  // { value: "yellow", label: "Yellow", color: "#FFC400" },
  // { value: "green", label: "Green", color: "#36B37E" },
  // { value: "forest", label: "Forest", color: "#00875A" },
  // { value: "slate", label: "Slate", color: "#253858" },
  // { value: "silver", label: "Silver", color: "#666666" },
];

export const colourStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#f5f2f0",
    opacity: "1",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
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
  multiValue: (styles, { data }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
};
