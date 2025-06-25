import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import FundCard from "@/components/fund-card";
import { authManager } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

interface MutualFund {
  id: string;
  name: string;
  category?: string;
  nav?: string;
  returns?: {
    "1Y"?: number;
    "3Y"?: number;
    "5Y"?: number;
  };
  aum?: string;
  expense_ratio?: string;
  rating?: number;
}

export default function Search() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const query = urlParams.get('q');
    const category = urlParams.get('category');
    
    if (query) {
      setSearchQuery(query);
    } else if (category) {
      setSearchQuery(category);
    }
  }, [location]);

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setIsAuthenticated(!!state.user);
    });
    return unsubscribe;
  }, []);

  // Fetch mutual funds data
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['mutual-funds', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      try {
        const response = await fetch('https://api.mfapi.in/mf');
        if (!response.ok) {
          throw new Error('Failed to fetch mutual funds');
        }
        const allFunds = await response.json();
        
        // Filter funds based on search query
        const filtered = allFunds.filter((fund: any) =>
          fund.schemeName.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 20); // Limit to 20 results
        
        // Transform data to match our interface
        return filtered.map((fund: any) => ({
          id: fund.schemeCode,
          name: fund.schemeName,
          category: fund.schemeName.includes('Equity') ? 'Equity' : 
                   fund.schemeName.includes('Debt') ? 'Debt' : 
                   fund.schemeName.includes('Hybrid') ? 'Hybrid' : 'Other',
        }));
      } catch (error) {
        console.error('Error fetching funds:', error);
        throw error;
      }
    },
    enabled: !!searchQuery.trim(),
  });

  // Fetch saved funds if authenticated
  const { data: savedFunds } = useQuery({
    queryKey: ['/api/saved-funds'],
    enabled: isAuthenticated,
  });

  // Save fund mutation
  const saveFundMutation = useMutation({
    mutationFn: async (fund: MutualFund) => {
      const response = await apiRequest('POST', '/api/saved-funds', {
        fundId: fund.id,
        fundName: fund.name,
        fundCategory: fund.category,
        nav: fund.nav,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-funds'] });
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      queryClient.invalidateQueries({ queryKey: ['mutual-funds', searchQuery] });
    }
  };

  const handleSearchInput = debounce((value: string) => {
    setSearchQuery(value);
  }, 500);

  const handleSaveFund = (fundId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save funds",
        variant: "destructive",
      });
      return;
    }

    const fund = searchResults?.find(f => f.id === fundId);
    if (fund) {
      saveFundMutation.mutate(fund);
    }
  };

  const handleRemoveFund = (fundId: string) => {
    removeFundMutation.mutate(fundId);
  };

  const isFundSaved = (fundId: string) => {
    return savedFunds?.some((saved: any) => saved.fundId === fundId) || false;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search mutual funds..."
                className="pl-10"
                defaultValue={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SearchIcon className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {searchResults && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                <p className="text-gray-600 mt-1">
                  Found {searchResults.length} mutual funds matching "{searchQuery}"
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by Relevance</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="category">Sort by Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-gray-600 text-lg">Searching mutual funds...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Funds
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to fetch mutual fund data. Please check your connection and try again.
              </p>
              <Button onClick={handleSearch}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searchResults && searchResults.length === 0 && !isLoading && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="text-gray-400 mb-4">
                <SearchIcon className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600">
                No mutual funds found matching "{searchQuery}". Try different keywords or browse popular categories.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Results Grid */}
        {searchResults && searchResults.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((fund) => (
              <FundCard
                key={fund.id}
                fund={fund}
                isSaved={isFundSaved(fund.id)}
                onSave={isAuthenticated ? handleSaveFund : undefined}
                onRemove={isAuthenticated ? handleRemoveFund : undefined}
                onView={(fundId) => window.open(`/fund/${fundId}`, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {searchResults && searchResults.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" disabled>
              Load More Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
