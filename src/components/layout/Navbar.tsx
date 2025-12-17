import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, BookOpen, Search, Bell, ChevronDown, User, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAdmin, isModerator } = useAuth();

  const categories = [
    { name: "Books", href: "/books" },
    { name: "Lecture Notes", href: "/lecture-notes" },
    { name: "Past Papers", href: "/past-papers" },
    { name: "Tutorials", href: "/tutorials" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-library-gold" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              UniLibrary
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Categories <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border z-50">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.name} asChild>
                    <Link to={category.href} className="cursor-pointer">{category.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/browse" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              About
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            
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
                    <p className="text-xs text-muted-foreground capitalize">{isAdmin ? 'Admin' : isModerator ? 'Moderator' : 'User'}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
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
                  <Button size="sm" className="font-medium bg-primary hover:bg-primary/90">Get Started</Button>
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
              <Link to="/" className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/browse" className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Browse</Link>
              {categories.map((category) => (
                <Link key={category.name} to={category.href} className="px-4 py-2 pl-8 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>{category.name}</Link>
              ))}
              <Link to="/about" className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>About</Link>
              {isAdmin && <Link to="/admin" className="px-4 py-2 text-primary hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>}
              <div className="flex gap-2 px-4 pt-4 border-t border-border mt-2">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsOpen(false); }}>Sign Out</Button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                    <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}><Button className="w-full">Get Started</Button></Link>
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
