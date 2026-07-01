export default defineAppConfig({
  ui: {
    button: {
      slots: {
        base: [
          'rounded-lg font-semibold inline-flex items-center justify-center gap-2',
          'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:opacity-60',
          'transition-all duration-150 cursor-pointer select-none',
        ],
      },
      variants: {
        size: {
          xs: {
            base: 'px-3 py-1 text-[11px] leading-4',
          },
          sm: {
            base: 'px-4 py-1.5 text-xs leading-5',
          },
          md: {
            base: 'px-5 py-2 text-sm leading-5',
          },
          lg: {
            base: 'px-6 py-2.5 text-base leading-6',
          },
        },
      },
    },
  },
})
