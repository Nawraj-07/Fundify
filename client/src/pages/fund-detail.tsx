import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, ArrowLeft, Share2, Star, TrendingUp } from "lucide-react";
import { formatPercentage, formatCurrency } from "@/lib/utils";
import { authManager } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface FundDetailProps {
  fundId: string;
}

interface FundDetails {
  id: string;
  name: string;
  category: string;
  nav: string;
  date: string;
  returns?: {
    "1Y"?: number;
    "3Y"?: number;
    "5Y"?: number;
    "10Y"?: number;
  };
  fundHouse?: string;
  expenseRatio?: string;
  exitLoad?: string;
  minInvestment?: string;
  aum?: string;
  rating?: number;
}

export default function FundDetail({ fundId }: FundDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setIsAuthenticated(!!state.user);
    });
    return unsubscribe;
  }, []);

  // Fetch fund details
  const { data: fundDetails, isLoading, error } = useQuery({
    queryKey: ['fund-detail', fundId],
    queryFn: async (): Promise<FundDetails> => {
      try {
        // Fetch fund info
        const infoResponse = await fetch(`https://api.mfapi.in/mf/${fundId}`);
        if (!infoResponse.ok) {
          throw new Error('Fund not found');
        }
        const fundInfo = await infoResponse.json();

        // Fetch latest NAV
        const navResponse = await fetch(`https://api.mfapi.in/mf/${fundId}/latest`);
        const navData = navResponse.ok ? await navResponse.json() : null;

        return {
          id: fundId,
          name: fundInfo.meta.scheme_name,
          category: fundInfo.meta.scheme_category || 'Not Available',
          nav: navData?.nav || 'N/A',
          date: navData?.date || 'N/A',
          fundHouse: fundInfo.meta.fund_house || 'Not Available',
          // Mock additional data as API doesn't provide these
          expenseRatio: '2.25',
          exitLoad: '1% if redeemed within 1 year',
          minInvestment: '₹500',
          aum: '₹15,000 Cr',
          rating: 4,
          returns: {
            "1Y": 12.5,
            "3Y": 15.2,
            "5Y": 13.8,
            "10Y": 11.9,
          },
        };
      } catch (error) {
        console.error('Error fetching fund details:', error);
        throw error;
      }
    },
  });

  // Check if fund is saved
  const { data: isFundSaved } = useQuery({
    queryKey: ['/api/saved-funds', fundId, 'check'],
    queryFn: async () => {
      const response = await fetch(`/api/saved-funds/${fundId}/check`, {
        headers: authManager.getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        return data.isSaved;
      }
      return false;
    },
    enabled: isAuthenticated,
  });

  // Save fund mutation
  const saveFundMutation = useMutation({
    mutationFn: async () => {
      if (!fundDetails) throw new Error('Fund details not available');
      
      const response = await apiRequest('POST', '/api/saved-funds', {
        fundId: fundDetails.id,
        fundName: fundDetails.name,
        fundCategory: fundDetails.category,
        nav: fundDetails.nav,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-funds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-funds', fundId, 'check'] });
      toast({
        title: "Success",
        description: "Fund saved to your collection",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save fund",
        variant: "destructive",
      });
    },
  });

  // Remove fund mutation
  const removeFundMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/saved-funds/${fundId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-funds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-funds', fundId, 'check'] });
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

  const handleSaveFund = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save funds",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (isFundSaved) {
      removeFundMutation.mutate();
    } else {
      saveFundMutation.mutate();
    }
  };

  const handleShareFund = () => {
    if (navigator.share) {
      navigator.share({
        title: fundDetails?.name,
        text: `Check out this mutual fund: ${fundDetails?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Fund link copied to clipboard",
      });
    }
  };

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
              Fund Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              The requested mutual fund could not be found or is no longer available.
            </p>
            <Button onClick={() => setLocation("/search")}>
              Browse Other Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/search")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {fundDetails?.name}
              </h1>
              <p className="text-gray-600">{fundDetails?.category}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-8 w-20 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Details Skeleton */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{fundDetails?.nav}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">Current NAV</p>
                  <p className="text-xs text-gray-500 mt-1">
                    As of {fundDetails?.date}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {fundDetails?.returns?.["1Y"] ? formatPercentage(fundDetails.returns["1Y"]) : "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">1 Year Return</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {fundDetails?.returns?.["3Y"] ? formatPercentage(fundDetails.returns["3Y"]) : "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">3 Year Return</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {fundDetails?.aum || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">AUM</p>
                </CardContent>
              </Card>
            </div>

            {/* Fund Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Fund Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Fund Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fund House</span>
                      <span className="font-medium">{fundDetails?.fundHouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{fundDetails?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expense Ratio</span>
                      <span className="font-medium">{fundDetails?.expenseRatio}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exit Load</span>
                      <span className="font-medium">{fundDetails?.exitLoad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Investment</span>
                      <span className="font-medium">{fundDetails?.minInvestment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">1 Year</span>
                      <span className="font-medium text-green-600">
                        {fundDetails?.returns?.["1Y"] ? formatPercentage(fundDetails.returns["1Y"]) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3 Years</span>
                      <span className="font-medium text-green-600">
                        {fundDetails?.returns?.["3Y"] ? formatPercentage(fundDetails.returns["3Y"]) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">5 Years</span>
                      <span className="font-medium text-green-600">
                        {fundDetails?.returns?.["5Y"] ? formatPercentage(fundDetails.returns["5Y"]) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10 Years</span>
                      <span className="font-medium text-green-600">
                        {fundDetails?.returns?.["10Y"] ? formatPercentage(fundDetails.returns["10Y"]) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center">
                        {fundDetails?.rating && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {fundDetails.rating} Star
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSaveFund}
                disabled={saveFundMutation.isPending || removeFundMutation.isPending}
                className="flex-1"
                variant={isFundSaved ? "outline" : "default"}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isFundSaved ? "fill-current" : ""}`} />
                {isFundSaved ? "Remove from Saved" : "Save Fund"}
              </Button>
              <Button
                onClick={handleShareFund}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Fund
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
