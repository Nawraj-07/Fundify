import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import FundCard from "@/components/fund-card";
import { authManager } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { SavedFund } from "@shared/schema";

export default function SavedFunds() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState("recent");

  const { data: savedFunds, isLoading, error } = useQuery({
    queryKey: ['/api/saved-funds'],
    select: (data: SavedFund[]) => {
      // Sort funds based on selected criteria
      let sorted = [...data];
      switch (sortBy) {
        case "name":
          sorted.sort((a, b) => a.fundName.localeCompare(b.fundName));
          break;
        case "category":
          sorted.sort((a, b) => (a.fundCategory || "").localeCompare(b.fundCategory || ""));
          break;
        case "recent":
        default:
          sorted.sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime());
          break;
      }
      return sorted;
    },
  });

  // Remove fund mutation
  const removeFundMutation = useMutation({
    mutationFn: async (fundId: string) => {
      const response = await apiRequest('DELETE', `/api/saved-funds/${fundId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-funds'] });
      toast({
        title: "Success",
        description: "Fund removed from your collection",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove fund",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFund = (fundId: string) => {
    removeFundMutation.mutate(fundId);
  };

  const handleViewFund = (fundId: string) => {
    setLocation(`/fund/${fundId}`);
  };

  const transformSavedFundToCard = (savedFund: SavedFund) => ({
    id: savedFund.fundId,
    name: savedFund.fundName,
    category: savedFund.fundCategory || "Not specified",
    nav: savedFund.nav || undefined,
    returns: undefined, // We don't store returns in saved funds
    aum: undefined,
    expense_ratio: undefined,
    rating: undefined,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Saved Funds
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to fetch your saved funds. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Saved Funds</h1>
            {isLoading ? (
              <Skeleton className="h-4 w-32 mt-1" />
            ) : (
              <p className="text-gray-600 mt-1">
                {savedFunds?.length || 0} funds in your portfolio
              </p>
            )}
          </div>

          {!isLoading && savedFunds && savedFunds.length > 0 && (
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Sort by Recent</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setLocation("/search")} variant="outline">
                Add More Funds
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <div>
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!savedFunds || savedFunds.length === 0) && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="text-gray-400 mb-4">
                <Bookmark className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Saved Funds Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start building your portfolio by searching and saving mutual funds
              </p>
              <Button onClick={() => setLocation("/search")}>
                Browse Mutual Funds
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Saved Funds Grid */}
        {!isLoading && savedFunds && savedFunds.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedFunds.map((savedFund) => (
              <FundCard
                key={savedFund.id}
                fund={transformSavedFundToCard(savedFund)}
                isSaved={true}
                showRemoveButton={true}
                onRemove={handleRemoveFund}
                onView={handleViewFund}
                savedAt={savedFund.savedAt?.toString()}
              />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {!isLoading && savedFunds && savedFunds.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => setLocation("/search")}>
                <Bookmark className="mr-2 h-4 w-4" />
                Add More Funds
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const fundData = savedFunds.map(fund => 
                    `${fund.fundName} - ${fund.fundCategory} - NAV: ₹${fund.nav || 'N/A'}`
                  ).join('\n');
                  
                  navigator.clipboard.writeText(fundData);
                  toast({
                    title: "Copied",
                    description: "Fund list copied to clipboard",
                  });
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Export List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
