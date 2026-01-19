import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/recover-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  return <div>{t('pages.recover_password', 'Recover Password Page')}</div>
}
