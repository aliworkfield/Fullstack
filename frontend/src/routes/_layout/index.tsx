import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  beforeLoad: () => {
    // Redirect to the coupons page as the default landing page
    throw redirect({
      to: '/coupons',
    })
  },
})