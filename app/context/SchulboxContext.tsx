import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type AlternativeProduct = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export type SchulboxItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
  category?: string;
  isAlternative?: boolean;
  alternatives?: AlternativeProduct[];
};

type SchulboxContextType = {
  items: SchulboxItem[];
  addToBox: (item: SchulboxItem) => void;
  removeFromBox: (id: string) => void;
  clearBox: () => void;
  updateQuantity: (id: string, delta: number) => void;
  setAlternatives: (itemId: string, alternatives: AlternativeProduct[]) => void;
  swapWithAlternative: (itemId: string, alternative: AlternativeProduct) => void;
  totalItems: number;
  subtotal: number;
  justAdded: boolean;
};

const SchulboxContext = createContext<SchulboxContextType | undefined>(undefined);

function safeGetItems(): SchulboxItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("schulbox-items") || "[]");
  } catch {
    return [];
  }
}

export function SchulboxProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SchulboxItem[]>(safeGetItems);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("schulbox-items", JSON.stringify(items));
    }
  }, [items]);

  const addToBox = useCallback((item: SchulboxItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item }];
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
  }, []);

  const removeFromBox = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearBox = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("schulbox-items");
    }
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const setAlternatives = useCallback(
    (itemId: string, alternatives: AlternativeProduct[]) => {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, alternatives } : i))
      );
    },
    []
  );

  const swapWithAlternative = useCallback(
    (itemId: string, alternative: AlternativeProduct) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== itemId) return i;
          // Behalte die aktuelle als Alternative
          const currentAsAlt: AlternativeProduct = {
            id: i.id,
            title: i.title,
            price: i.price,
            image: i.image,
          };
          const remainingAlts = (i.alternatives || []).filter(
            (a) => a.id !== alternative.id
          );
          return {
            ...i,
            id: alternative.id,
            title: alternative.title,
            price: alternative.price,
            image: alternative.image,
            isAlternative: true,
            alternatives: [...remainingAlts, currentAsAlt],
          };
        })
      );
    },
    []
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <SchulboxContext.Provider
      value={{
        items,
        addToBox,
        removeFromBox,
        clearBox,
        updateQuantity,
        setAlternatives,
        swapWithAlternative,
        totalItems,
        subtotal,
        justAdded,
      }}
    >
      {children}
    </SchulboxContext.Provider>
  );
}

export function useSchulbox() {
  const ctx = useContext(SchulboxContext);
  if (!ctx) throw new Error("useSchulbox must be used within SchulboxProvider");
  return ctx;
}
