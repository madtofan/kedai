import * as Slot from "@rn-primitives/slot";
import type { SlottableTextProps, TextRef } from "@rn-primitives/types";
import * as React from "react";
import { Text as RNText } from "react-native";
import { cn } from "~/lib/utils";
import { useTranslate } from "@tolgee/react";

const TextClassContext = React.createContext<string | undefined>(undefined);

const Text = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const { t } = useTranslate();

    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    return (
      <Component
        className={cn(
          "text-base text-foreground web:select-text",
          textClass,
          className,
        )}
        ref={ref}
        {...props}
      >
        {t(`${children}`)}
      </Component>
    );
  },
);
Text.displayName = "Text";

export { Text, TextClassContext };
