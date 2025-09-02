# Introduction
This document provides guidelines how to design components for the project.
The project uses Tailwind CSS for styling. And Radix UI (primitives) for elements.
You must always follow the design specifications outlined in this document.

# Styling
Always use Tailwind classes for styling. Always implement both for light and dark theme.
Always implement responsive design using Tailwind's responsive utilities.
Always add `aria-label` attributes to interactive elements.

## Colors
Always use the colors from the Tailwind CSS color palette, and ensure that they are applied consistently across both light and dark themes.
You must use colors from the `tailwind.config.ts` file. If you introduce new colors you MUST ask for approval.

## Typography
For titles nouns must be `font-bold` and use the `font-tdn` font.
The default font must be `font-context`.

# New components
If you are creating a new component, make sure to follow these guidelines:
- Use Radix UI components where applicable.
- Use Tailwind CSS classes for styling.
- New Radix UI components should be placed inside `components/shared/ui`
- New TSX components should be placed in the related component folder. E.g. a diagram component should be placed in `components/diagramview`

