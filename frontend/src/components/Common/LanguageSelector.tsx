import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const { isMobile } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setIsOpen(false);
  };

  const getCurrentLanguageFlag = () => {
    const lang = i18n.language.split('-')[0];
    return lang === 'tr' ? '🇹🇷' : '🇬🇧';
  };

  return (
    <SidebarMenuItem>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={t('common.language', 'Language')}>
            <Languages className="size-4 text-muted-foreground" />
            <span>{t('common.language', 'Language')}</span>
            <span className="sr-only">{t('common.toggle_language', 'Toggle language')}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "top" : "right"}
          align="end"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        >
          <DropdownMenuItem 
            onClick={() => changeLanguage('tr')}
            className={i18n.language.startsWith('tr') ? 'bg-accent' : ''}
          >
            <span className="mr-2">{getCurrentLanguageFlag()}</span>
            🇹🇷 {t('languages.turkish', 'Turkish')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => changeLanguage('en')}
            className={i18n.language.startsWith('en') ? 'bg-accent' : ''}
          >
            <span className="mr-2">{getCurrentLanguageFlag()}</span>
            🇬🇧 {t('languages.english', 'English')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}