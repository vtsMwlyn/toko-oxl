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
          `bg-white border-3! rounded-2xl shadow-sm px-1 py-0.5 transition ${
            state.isFocused
              ? "border-cyan-500!"
              : "border-slate-400! hover:border-slate-500!"
          }`,
        placeholder: () => "text-gray-500",
      }}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base) => ({
          ...base,
          borderRadius: "1rem",
          boxShadow: "none",
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? '#06b6d4' // cyan-500
            : isFocused
            ? '#dbeafe' // cyan-100
            : 'white',
          color: isSelected ? 'white' : '#black', // cyan-800 text
          padding: '8px 12px',
          fontSize: '11pt',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }),
      }}
    />
  );
});
