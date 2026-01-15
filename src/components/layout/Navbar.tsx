import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, Bell, ChevronDown, User, LogOut, Shield, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut, isAdmin, isModerator, userRole } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    { name: "Books", href: "/books" },
    { name: "Lecture Notes", href: "/lecture-notes" },
    { name: "Past Papers", href: "/past-papers" },
    { name: "Tutorials", href: "/tutorials" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isLecturer = isModerator || isAdmin;

  return (
    <nav className="sticky top-0 z-50 w-full glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors relative py-1",
                isActiveLink("/") 
                  ? "text-primary" 
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              Home
              {isActiveLink("/") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                categories.some(c => isActiveLink(c.href))
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground"
              )}>
                Categories <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border z-50">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.name} asChild>
                    <Link 
                      to={category.href} 
                      className={cn(
                        "cursor-pointer",
                        isActiveLink(category.href) && "text-primary font-medium"
                      )}
                    >
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              to="/browse" 
              className={cn(
                "text-sm font-medium transition-colors relative py-1",
                isActiveLink("/browse") 
                  ? "text-primary" 
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              Browse
              {isActiveLink("/browse") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            <Link 
              to="/about" 
              className={cn(
                "text-sm font-medium transition-colors relative py-1",
                isActiveLink("/about") 
                  ? "text-primary" 
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              About
              {isActiveLink("/about") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            {isLecturer && (
              <Link 
                to="/my-materials" 
                className={cn(
                  "text-sm font-medium transition-colors relative py-1 flex items-center gap-1",
                  isActiveLink("/my-materials") 
                    ? "text-primary" 
                    : "text-foreground/80 hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4" /> My Materials
                {isActiveLink("/my-materials") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1 relative py-1",
                  isActiveLink("/admin") 
                    ? "text-primary" 
                    : "text-primary/80 hover:text-primary"
                )}
              >
                <Shield className="h-4 w-4" /> Admin
                {isActiveLink("/admin") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
                  <Search className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Search Materials</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search for books, notes, papers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Search
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <ThemeToggle />
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-foreground/70" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="font-medium text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6">
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={cn(
                            "px-3 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50",
                            !notif.read && "bg-primary/5"
                          )}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {isAdmin ? 'Admin' : isModerator ? 'Moderator' : 'User'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isLecturer && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-materials" className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" /> My Materials
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="font-medium">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-medium bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className={cn(
                  "px-4 py-2 rounded-md",
                  isActiveLink("/") ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )} 
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className={cn(
                  "px-4 py-2 rounded-md",
                  isActiveLink("/browse") ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )} 
                onClick={() => setIsOpen(false)}
              >
                Browse
              </Link>
              {categories.map((category) => (
                <Link 
                  key={category.name} 
                  to={category.href} 
                  className={cn(
                    "px-4 py-2 pl-8 text-sm rounded-md",
                    isActiveLink(category.href) ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )} 
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link 
                to="/about" 
                className={cn(
                  "px-4 py-2 rounded-md",
                  isActiveLink("/about") ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )} 
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              {isLecturer && (
                <Link 
                  to="/my-materials" 
                  className={cn(
                    "px-4 py-2 rounded-md",
                    isActiveLink("/my-materials") ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  )} 
                  onClick={() => setIsOpen(false)}
                >
                  My Materials
                </Link>
              )}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={cn(
                    "px-4 py-2 text-primary rounded-md",
                    isActiveLink("/admin") ? "bg-primary/10 font-medium" : "hover:bg-muted"
                  )} 
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="flex gap-2 px-4 pt-4 border-t border-border mt-2">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsOpen(false); }}>Sign Out</Button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                    <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}><Button className="w-full bg-primary text-primary-foreground">Get Started</Button></Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
