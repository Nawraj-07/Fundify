import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrendingUp, Menu, LogOut, User, Bookmark } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());
  const [user, setUser] = useState(authManager.getState().user);

  const { data: savedFundsCount } = useQuery({
    queryKey: ['/api/saved-funds'],
    enabled: isAuthenticated,
    select: (data) => data?.length || 0,
  });

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setIsAuthenticated(!!state.user);
      setUser(state.user);
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    authManager.clearAuth();
  };

  //const getInitials = (name: string) => {
  //  return name
    //  .split(' ')
      //.map(word => word[0])
      //.join('')
      //.toUpperCase()
      //.slice(0, 2);
  //};

  const getInitials = (name?: string) => {
  if (!name) return ''; // <--- this prevents the error
  return name
    .split(' ')
    .map((word) => word[0])
    .join('');
};


  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    ...(isAuthenticated ? [{ href: "/saved-funds", label: `My Funds${savedFundsCount ? ` (${savedFundsCount})` : ''}` }] : []),
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <TrendingUp className="text-white text-xl h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Fundify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  location === link.href
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user ? getInitials(user.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      <span>{user?.name}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved-funds">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>My Saved Funds</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`font-medium transition-colors ${
                        location === link.href
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {isAuthenticated ? (
                    <Button variant="outline" onClick={handleLogout} className="justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
