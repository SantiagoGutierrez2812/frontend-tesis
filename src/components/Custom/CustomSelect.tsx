import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

interface CustomSelectProps {
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  options,
  placeholder,
  onChange,
  required,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-select" ref={ref}>
      <div className="select-display" onClick={() => setOpen(!open)}>
        {value || placeholder || "Selecciona una opción"}
        <span className={`arrow ${open ? "up" : "down"}`} />
      </div>

      {open && (
        <ul className="select-options">
          {options.map((opt) => (
            <li
              key={opt}
              className={opt === value ? "selected" : ""}
              onClick={() => {
                const fakeEvent = {
                  target: { name, value: opt },
                } as unknown as React.ChangeEvent<HTMLSelectElement>;
                onChange(fakeEvent);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* Hidden select to maintain form compatibility */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{ display: "none" }}
      >
        <option value="">{placeholder || "Selecciona una opción"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelect;
