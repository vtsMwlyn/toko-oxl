import { forwardRef } from "react";
import Select from "react-select";

export default forwardRef(function SelectInput(
  {
    options = [],
    value = null,
    onChange = () => {},
    isMulti = false,
    isFocused = false,
    className = "",
    isDisabled = false,
    isSearchable = true,
    isClearable = true,
    placeholder = "Select an item",
    ...props
  },
  ref
) {
  return (
    <Select
      {...props}
      ref={ref}
      isMulti={isMulti}
      options={options}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      placeholder={placeholder}
      isClearable={isClearable}
      className={`${className}`}
      classNames={{
        control: (state) =>
          `bg-white border-2 rounded-2xl shadow-sm px-1 py-0.5 transition ${
            state.isFocused
              ? "border-emerald-500!"
              : "border-slate-400! hover:border-slate-500!"
          }`,
        placeholder: () => "text-gray-500",
      }}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base, { isFocused }) => ({
          ...base,
          borderRadius: "0.4rem",
          boxShadow: "none",
          fontSize: '11pt',
          padding: '0',
          borderColor: isFocused
            ? '#00bc7d' // cyan-100
            : '#D1D5DB',
            borderWidth: isFocused ? '2px' : '1px',
            "&:focus": {
                    borderColor: "#00bc7d",
            },
            "&:hover": {
                    borderColor: "#00bc7d",
            },
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? '#00bc7d' // cyan-500
            : isFocused
            ? '#dbeafe' // cyan-100
            : 'white',
          color: isSelected ? 'white' : '#black', // cyan-800 text
          padding: '6px 12px',
          fontSize: '11pt',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }),
      }}
    />
  );
});
