"use client";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ColorPickerPopUp = ({ color, onColorChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => setIsOpen(!isOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={buttonVariants({ variant: "outline", size: "icon" })}
          onClick={handleClick}
          title="Pick Color"
        >
          {icon}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"p-0"}>
        <DropdownMenuItem className="p-0">
          <SketchPicker
            color={color}
            onChange={(color) => onColorChange(color.hex)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorPickerPopUp;
