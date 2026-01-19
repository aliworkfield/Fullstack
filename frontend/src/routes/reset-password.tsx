import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  return <div>{t('pages.reset_password', 'Reset Password Page')}</div>
}
