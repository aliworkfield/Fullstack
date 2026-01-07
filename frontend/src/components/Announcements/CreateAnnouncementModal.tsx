import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { app__models__announcement__AnnouncementCreate, app__models__announcement__AnnouncementPublic, AnnouncementsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  requires_coupon: z.boolean(),
  campaign_id: z.string().optional(),
  is_published: z.boolean(),
  expiry_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      requires_coupon: false,
      campaign_id: "",
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
        campaign_id: announcement.campaign_id ? announcement.campaign_id.toString() : "",
        is_published: Boolean(announcement.is_published),
        expiry_date: announcement.expiry_date || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        category: "",
        requires_coupon: false,
        campaign_id: "",
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
      campaign_id: data.campaign_id ? data.campaign_id : null,
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
              <DialogTitle>{announcement ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
              <DialogDescription>
                {announcement ? "Update the announcement details." : "Add a new announcement to the system."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter announcement title" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter announcement description"
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
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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
                      <FormLabel>Requires Coupon</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter campaign ID (UUID)" 
                        {...field} 
                      />
                    </FormControl>
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
                      <FormLabel>Is Published</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        placeholder="Select expiry date" 
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
                Cancel
              </Button>
              <LoadingButton type="submit" loading={mutation.isPending}>
                {announcement ? "Update" : "Create"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}