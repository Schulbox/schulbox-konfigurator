import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "@remix-run/react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  triggerSearch: (value: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const triggerSearch = (value: string) => {
    setSearchQuery(value);
    if (!location.pathname.startsWith("/konfigurator")) {
      navigate(`/webshop?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, triggerSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
