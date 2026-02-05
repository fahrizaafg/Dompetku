import * as React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export const Button = ({ children, onClick, variant = "primary" }: ButtonProps) => {
  const style = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: variant === "primary" ? "#0F766E" : "#E5E7EB",
    color: variant === "primary" ? "white" : "black",
    cursor: "pointer",
  };
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
};
