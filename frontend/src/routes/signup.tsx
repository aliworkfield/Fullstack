import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  return <div>{t('pages.signup', 'Sign Up Page')}</div>
}
