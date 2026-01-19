import { useTranslation } from 'react-i18next';

export function TestTranslations() {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="p-4 border rounded-lg m-4">
      <h3 className="text-lg font-bold mb-2">Translation Test</h3>
      <div className="space-y-2">
        <p>Current language: {i18n.language}</p>
        <p>Campaigns: {t('navigation.campaigns')}</p>
        <p>Coupons: {t('navigation.coupons')}</p>
        <p>Users: {t('navigation.users')}</p>
        <p>Common save: {t('common.save')}</p>
        <p>Coupon code: {t('coupons.code')}</p>
      </div>
    </div>
  );
}