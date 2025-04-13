import * as React from "react";
import { SwitchProps as RadixSwitchProps } from "@radix-ui/react-switch";

export interface SwitchProps extends RadixSwitchProps {
  className?: string;
}

export const Switch: React.ForwardRefExoticComponent<
  SwitchProps & React.RefAttributes<HTMLButtonElement>
>;