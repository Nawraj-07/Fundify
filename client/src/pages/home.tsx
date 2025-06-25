import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Shield, BarChart3, Receipt } from "lucide-react";
import { debounce } from "@/lib/utils";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInput = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryFilter = (category: string) => {
    setLocation(`/search?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Discover Your Perfect{" "}
            <span className="text-primary">Mutual Fund</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Search, analyze, and save mutual funds from India's leading fund houses. 
            Make informed investment decisions with real-time data.
          </p>

          {/* Main Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search mutual funds by name, AMC, or scheme type..."
                  className="pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="px-8 py-4 rounded-r-xl text-lg font-semibold"
                size="lg"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge
              variant="outline"
              className="bg-white hover:bg-blue-50 hover:text-primary cursor-pointer px-4 py-2"
              onClick={() => handleCategoryFilter("equity")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Equity Funds
            </Badge>
            <Badge
              variant="outline"
              className="bg-white hover:bg-blue-50 hover:text-primary cursor-pointer px-4 py-2"
              onClick={() => handleCategoryFilter("debt")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Debt Funds
            </Badge>
            <Badge
              variant="outline"
              className="bg-white hover:bg-blue-50 hover:text-primary cursor-pointer px-4 py-2"
              onClick={() => handleCategoryFilter("hybrid")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Hybrid Funds
            </Badge>
            <Badge
              variant="outline"
              className="bg-white hover:bg-blue-50 hover:text-primary cursor-pointer px-4 py-2"
              onClick={() => handleCategoryFilter("elss")}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Tax Saving
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Fundify?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get comprehensive mutual fund data and tools to make informed investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Search</h3>
              <p className="text-gray-600">
                Search through thousands of mutual funds with advanced filters and real-time data
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                Get detailed fund analysis including performance metrics, portfolio composition, and more
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save & Track</h3>
              <p className="text-gray-600">
                Save your favorite funds and track their performance to build your investment portfolio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Investing?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Join thousands of investors who trust Fundify for their mutual fund research
          </p>
          <Button size="lg" onClick={() => setLocation("/search")}>
            Explore Funds Now
          </Button>
        </div>
      </section>
    </div>
  );
}
