import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, ExternalLink, Star } from "lucide-react";
import { formatPercentage } from "@/lib/utils";

interface FundCardProps {
  fund: {
    id: string;
    name: string;
    category: string;
    nav?: string;
    returns?: {
      "1Y"?: number;
      "3Y"?: number;
      "5Y"?: number;
    };
    aum?: string;
    expense_ratio?: string;
    rating?: number;
  };
  isSaved?: boolean;
  showRemoveButton?: boolean;
  onSave?: (fundId: string) => void;
  onRemove?: (fundId: string) => void;
  onView?: (fundId: string) => void;
  savedAt?: string;
}

export default function FundCard({
  fund,
  isSaved = false,
  showRemoveButton = false,
  onSave,
  onRemove,
  onView,
  savedAt,
}: FundCardProps) {
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && onRemove) {
      onRemove(fund.id);
    } else if (!isSaved && onSave) {
      onSave(fund.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(fund.id);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleView}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {fund.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{fund.category}</p>
          </div>
          <div className="flex items-center space-x-2">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(fund.id);
                }}
                className="h-8 w-8 text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {(onSave || onRemove) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveToggle}
                className={`h-8 w-8 ${
                  isSaved 
                    ? "text-primary hover:text-primary/80" 
                    : "text-gray-400 hover:text-primary"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {fund.nav && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">NAV</p>
              <p className="font-semibold text-gray-900">₹{fund.nav}</p>
            </div>
          )}
          {fund.returns?.["1Y"] && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">1Y Return</p>
              <p className={`font-semibold ${
                fund.returns["1Y"] > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatPercentage(fund.returns["1Y"])}
              </p>
            </div>
          )}
          {fund.returns?.["3Y"] && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">3Y Return</p>
              <p className={`font-semibold ${
                fund.returns["3Y"] > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatPercentage(fund.returns["3Y"])}
              </p>
            </div>
          )}
          {fund.aum && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">AUM</p>
              <p className="font-semibold text-gray-900">{fund.aum}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {fund.rating && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {fund.rating} Star
              </Badge>
            )}
            {fund.expense_ratio && (
              <span className="text-xs text-gray-500">
                Expense: {fund.expense_ratio}%
              </span>
            )}
          </div>
          {savedAt && (
            <span className="text-xs text-gray-500">
              Saved on {new Date(savedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
