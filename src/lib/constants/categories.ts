export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  color: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "tecnologia",
    name: "Tecnología",
    slug: "tecnologia",
    iconName: "Smartphone",
    color: "text-blue-500",
    description: "Lo último en tecnología con precios de fábrica."
  },
  {
    id: "moda",
    name: "Moda",
    slug: "moda",
    iconName: "ShoppingBag",
    color: "text-pink-500",
    description: "Moda y tendencia para renovar tu placard ahorrando."
  },
  {
    id: "hogar",
    name: "Hogar",
    slug: "hogar",
    iconName: "Armchair",
    color: "text-orange-500",
    description: "Todo para tu casa en compras compartidas."
  },
  {
    id: "alimentos",
    name: "Alimentos",
    slug: "alimentos",
    iconName: "Apple",
    color: "text-green-500",
    description: "Tus consumos diarios al mejor precio mayorista."
  },
  {
    id: "deportes",
    name: "Deportes",
    slug: "deportes",
    iconName: "Dumbbell",
    color: "text-red-500",
    description: "Equipamiento profesional para tu entrenamiento."
  },
  {
    id: "belleza",
    name: "Belleza",
    slug: "belleza",
    iconName: "Sparkles",
    color: "text-purple-500",
    description: "Cuidado personal y estética con descuentos exclusivos."
  },
  {
    id: "juguetes",
    name: "Juguetes",
    slug: "juguetes",
    iconName: "Puzzle",
    color: "text-yellow-500",
    description: "Divertite y aprendé con los mejores juegos."
  },
  {
    id: "herramientas",
    name: "Herramientas",
    slug: "herramientas",
    iconName: "Wrench",
    color: "text-gray-600",
    description: "Todo lo que necesitás para tus proyectos y reparaciones."
  }
];

export const getCategoryBySlug = (slug: string) => CATEGORIES.find(c => c.slug === slug);
export const getCategoryByName = (name: string) => CATEGORIES.find(c => c.name === name);
