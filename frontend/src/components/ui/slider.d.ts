import * as React from "react";
import { SliderProps as RadixSliderProps } from "@radix-ui/react-slider";

export interface SliderProps extends RadixSliderProps {
  className?: string;
}

export const Slider: React.ForwardRefExoticComponent<
  SliderProps & React.RefAttributes<HTMLSpanElement>
>;