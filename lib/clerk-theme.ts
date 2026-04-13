import type { Appearance } from "@clerk/types"

export const darkClerkAppearance: Appearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#18181b",
    colorInputBackground: "#27272a",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa",
    colorSuccess: "#10b981",
    colorDanger: "#ef4444",
    colorWarning: "#f59e0b",
    colorTextOnPrimaryBackground: "#ffffff",
    colorNeutral: "#52525b",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: {
      margin: "0 auto",
    },
    card: {
      backgroundColor: "#18181b",
      border: "1px solid #27272a",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
    headerTitle: {
      color: "#ffffff",
    },
    headerSubtitle: {
      color: "#a1a1aa",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#3f3f46",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#ffffff",
    },
    dividerLine: {
      backgroundColor: "#3f3f46",
    },
    dividerText: {
      color: "#a1a1aa",
    },
    formFieldLabel: {
      color: "#d4d4d8",
    },
    formFieldInput: {
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      color: "#ffffff",
      "&::placeholder": {
        color: "#71717a",
      },
      "&:focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgb(139 92 246 / 0.1)",
      },
    },
    formButtonPrimary: {
      background: "linear-gradient(to right, #8b5cf6, #7c3aed)",
      color: "#ffffff",
      border: "none",
      "&:hover": {
        background: "linear-gradient(to right, #7c3aed, #6d28d9)",
      },
    },
    footerActionLink: {
      color: "#a855f7",
      "&:hover": {
        color: "#c084fc",
      },
    },
    footerActionText: {
      color: "#a1a1aa",
    },
    formFieldErrorText: {
      color: "#ef4444",
    },
    // User dropdown/menu styling
    userDropdownContent: {
      backgroundColor: "#18181b",
      border: "1px solid #27272a",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      borderRadius: "0.5rem",
    },
    menuList: {
      backgroundColor: "#18181b",
    },
    menuItem: {
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#27272a",
        color: "#ffffff",
      },
    },
    menuItemText: {
      color: "#ffffff",
    },
    userPreview: {
      backgroundColor: "#18181b",
      borderBottom: "1px solid #27272a",
    },
    userPreviewMainIdentifier: {
      color: "#ffffff",
    },
    userPreviewSecondaryIdentifier: {
      color: "#a1a1aa",
    },
    userButtonPopover: {
      backgroundColor: "#18181b",
      border: "1px solid #27272a",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
    userButtonPopoverCard: {
      backgroundColor: "#18181b",
    },
    userButtonPopoverMain: {
      color: "#ffffff",
    },
    userButtonPopoverFooter: {
      backgroundColor: "#18181b",
      borderTop: "1px solid #27272a",
    },
    menuButton: {
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#27272a",
        color: "#ffffff",
      },
    },
    menuButtonText: {
      color: "#ffffff",
    },
    // Additional dropdown elements
    userButtonBox: {
      "&:hover": {
        backgroundColor: "#27272a",
      },
    },
    userButtonTrigger: {
      color: "#ffffff",
    },
    menuAction: {
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#27272a",
      },
    },
    menuActionText: {
      color: "#ffffff",
    },
    menuActionIconBox: {
      color: "#a1a1aa",
    },
    profileSectionTitle: {
      color: "#ffffff",
    },
    profileSectionPrimary: {
      color: "#ffffff",
    },
    profileSectionSecondary: {
      color: "#a1a1aa",
    },
    userButtonPopoverActionButton: {
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#27272a",
      },
    },
    userButtonPopoverActionButtonText: {
      color: "#ffffff",
    },
    userButtonPopoverActionButtonIcon: {
      color: "#a1a1aa",
    },
  }
}