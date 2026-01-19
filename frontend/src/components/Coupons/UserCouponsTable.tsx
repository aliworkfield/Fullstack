import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Search, Plus } from "lucide-react";
import { CouponPublic } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/Common/DataTable";
import { columns } from "./columns";

export function UserCouponsTable() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user coupons
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["userCoupons"],
    queryFn: async () => {
      const response = await import('@/client').then(client => client.UserCouponsService.getMyCoupons());
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredCoupons = coupons.filter((coupon: CouponPublic) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.discount_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return <div>Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">My Coupons</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Coupon List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredCoupons}
          />
        </CardContent>
      </Card>
    </div>
  );
}