import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { CouponsService } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/Common/DataTable";
import { columns } from "./columns";

export function CouponsTable() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch coupons
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await CouponsService.readCoupons({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });


  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.discount_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return <div>Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Coupons</h1>
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
          <CardTitle>Coupon List</CardTitle>
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