import { forwardRef } from "react";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";

const wordAnywhereFilter = (option, inputValue) => {
    if (!inputValue) return true;
    const label = option.label.toLowerCase();
    return inputValue.toLowerCase().trim().split(/\s+/).every(word => label.includes(word));
};

export default forwardRef(function Select(
    {
        options = [],
        value = null,
        onChange = () => {},
        onInputChange,
        isMulti = false,
        isFocused = false,
        className = "",
        isDisabled = false,
        isSearchable = true,
        isClearable = true,
        placeholder = "Select an item",
        // ── Creatable props ───────────────────────────────────────────────────
        creatable = false,
        formatCreateLabel,
        noOptionsMessage,
        filterOption = wordAnywhereFilter,
        ...props
    },
    ref
) {
    const Component = creatable ? CreatableSelect : ReactSelect;

    const sharedStyles = {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base, { isFocused }) => ({
            ...base,
            borderRadius: "0.4rem",
            boxShadow: "none",
            fontSize: '11pt',
            padding: '0',
            borderColor: isFocused ? '#00bc7d' : '#D1D5DB',
            borderWidth: isFocused ? '2px' : '1px',
            "&:focus": { borderColor: "#00bc7d" },
            "&:hover": { borderColor: "#00bc7d" },
        }),
        option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected ? '#00bc7d' : isFocused ? '#d1fae5' : 'white',
            color: isSelected ? 'white' : '#111827',
            padding: '6px 12px',
            fontSize: '11pt',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
        }),
    };

    return (
        <Component
            {...props}
            ref={ref}
            isMulti={isMulti}
            options={options}
            value={value}
            onChange={onChange}
            onInputChange={onInputChange}
            isDisabled={isDisabled}
            isSearchable={isSearchable}
            placeholder={placeholder}
            isClearable={isClearable}
            className={className}
            formatCreateLabel={formatCreateLabel ?? ((val) => `Gunakan: "${val}"`)}
            noOptionsMessage={noOptionsMessage ?? (() => 'Tidak ada pilihan')}
            filterOption={filterOption}
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
            menuPosition="fixed"
            styles={sharedStyles}
        />
    );
});
