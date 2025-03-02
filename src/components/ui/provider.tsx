"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

// Import custom theme with JetBrains Mono font
import customTheme from "../../theme"
import { system } from "@chakra-ui/react/preset"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={{...system, ...customTheme}}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
