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
import { LoadingButton } from "@/components/ui/loading-button";
import { CampaignsService, AdminCouponsService, CouponCreate, CampaignPublic } from "@/client";
import { useQuery } from "@tanstack/react-query";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  code: z.string().min(1, { message: "Coupon code is required" }),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(0, { message: "Discount value must be positive" }),
  campaign_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCouponModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCouponModal({ 
  open, 
  onClose, 
  onSuccess 
}: CreateCouponModalProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await CampaignsService.readCampaigns({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      campaign_id: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CouponCreate) =>
      AdminCouponsService.createCoupon({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Coupon created successfully");
      form.reset();
      onClose();
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: handleError(showErrorToast),
  });

  const onSubmit = (data: FormData) => {
    const couponData: CouponCreate = {
      ...data,
      discount_value: Number(data.discount_value),
    };
    mutation.mutate(couponData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>
                Add a new coupon to the system.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter coupon code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter discount value" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="campaign_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">No Campaign</option>
                        {campaigns.map((campaign: CampaignPublic) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.title}
                          </option>
                        ))}
                      </select>
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
                Create
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}