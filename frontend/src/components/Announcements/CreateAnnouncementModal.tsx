import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { Checkbox } from "@/components/ui/checkbox";
import { app__models__announcement__AnnouncementCreate, app__models__announcement__AnnouncementPublic, CampaignPublic, AnnouncementsService, CampaignsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';

// Define the form schema type explicitly
const announcementFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  requires_coupon: z.boolean(),
  campaign_id: z.string().optional(),
  is_published: z.boolean(),
  expiry_date: z.string().optional(),
});

type FormData = z.infer<typeof announcementFormSchema>;

// Validation messages function
const getValidationMessages = (t: (key: string, defaultValue: string) => string) => ({
  title: t('validations.title_required', 'Title is required'),
  category: t('validations.category_required', 'Category is required'),
});

interface CreateAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (announcement: app__models__announcement__AnnouncementPublic) => void;
  announcement?: app__models__announcement__AnnouncementPublic; // For editing
}

const categoryOptions = [
  "Sağlık Hizmetleri",
  "Göz & Optik", 
  "Eğitim",
  "Giyim & Aksesuar",
  "Akaryakıt & Servis & Araç",
  "Ev & Yaşam",
  "Sigorta",
  "Gıda",
  "Spor",
  "Turizm ve Otel",
  "İletişim ve Teknoloji",
  "Kargo",
  "Diğer"
];

export function CreateAnnouncementModal({ 
  open, 
  onClose, 
  onSuccess,
  announcement // For editing
}: CreateAnnouncementModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  // Fetch campaigns for the dropdown
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await CampaignsService.readCampaigns({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    enabled: open, // Only fetch when modal is open
  });

  // Create schema with validation messages
  const schemaWithMessages = announcementFormSchema.refine((data) => data.title.trim().length > 0, {
    message: getValidationMessages(t).title,
    path: ['title'],
  }).refine((data) => data.category.trim().length > 0, {
    message: getValidationMessages(t).category,
    path: ['category'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schemaWithMessages),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      requires_coupon: false,
      campaign_id: undefined, // Use undefined instead of "none"
      is_published: false,
      expiry_date: "",
    },
  });

  // Set default values when editing
  useEffect(() => {
    if (announcement) {
      form.reset({
        title: announcement.title || "",
        description: announcement.description || "",
        category: announcement.category || "",
        requires_coupon: Boolean(announcement.requires_coupon),
        campaign_id: announcement.campaign_id ? announcement.campaign_id.toString() : undefined,
        is_published: Boolean(announcement.is_published),
        expiry_date: announcement.expiry_date || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        category: "",
        requires_coupon: false,
        campaign_id: undefined,
        is_published: false,
        expiry_date: "",
      });
    }
  }, [announcement, open]);

  const mutation = useMutation({
    mutationFn: (data: app__models__announcement__AnnouncementCreate) =>
      announcement 
        ? AnnouncementsService.updateAnnouncementEndpoint({
            id: announcement.id,
            requestBody: data 
          })
        : AnnouncementsService.createAnnouncementEndpoint({ requestBody: data }),
    onSuccess: (data: app__models__announcement__AnnouncementPublic) => {
      showSuccessToast(announcement ? "Announcement updated successfully" : "Announcement created successfully");
      form.reset();
      onClose();
      onSuccess?.(data);
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: handleError(showErrorToast),
  });

  const onSubmit = (data: FormData) => {
    const announcementData: app__models__announcement__AnnouncementCreate = {
      ...data,
      campaign_id: data.campaign_id || null,
      expiry_date: data.expiry_date || null,
    };
    mutation.mutate(announcementData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{announcement ? t('announcements.edit_announcement', 'Edit Announcement') : t('announcements.create_announcement', 'Create Announcement')}</DialogTitle>
              <DialogDescription>
                {announcement ? t('announcements.update_details', 'Update the announcement details.') : t('announcements.add_new', 'Add a new announcement to the system.')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.title', 'Title')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('announcements.enter_title', 'Enter announcement title')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('announcements.enter_description', 'Enter announcement description')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.category', 'Category')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('announcements.select_category', 'Select a category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requires_coupon"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('announcements.requires_coupon', 'Requires Coupon')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.campaign', 'Campaign')}</FormLabel>
                    {campaignsLoading ? (
                      <div className="text-muted-foreground">{t('common.loading_campaigns', 'Loading campaigns...')}</div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('announcements.select_campaign_optional', 'Select a campaign (optional)')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t('announcements.no_campaign', 'No campaign')}</SelectItem>
                          {(Array.isArray(campaigns) ? campaigns : []).map((campaign: CampaignPublic) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('announcements.is_published', 'Is Published')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('announcements.expiry_date', 'Expiry Date')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        placeholder={t('announcements.select_expiry_date', 'Select expiry date')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <LoadingButton type="submit" loading={mutation.isPending}>
                {announcement ? t('common.update', 'Update') : t('common.create', 'Create')}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}