// Categories are two levels deep (e.g. Skincare > Cream). These helpers keep that order and
// let a top category stand for itself plus all of its subcategories.
type Cat = { id: string; name: string; slug: string; parent_id?: string | null; sort_order?: number | null };

const bySort = (a: Cat, b: Cat) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);

export const topCategories = <C extends Cat>(cats: C[]) => cats.filter(c => !c.parent_id).sort(bySort);
export const childCategories = <C extends Cat>(cats: C[], parentId: string) => cats.filter(c => c.parent_id === parentId).sort(bySort);

// Parent first, then its children, for select boxes; children are labelled "Parent › Child".
export const orderedCategories = <C extends Cat>(cats: C[]) =>
  topCategories(cats).flatMap(p => [
    { ...p, label: p.name, depth: 0 },
    ...childCategories(cats, p.id).map(c => ({ ...c, label: `${p.name} › ${c.name}`, depth: 1 })),
  ]);

// IDs a category filter should match: the category and, for a top category, its subcategories.
export const categoryIdsFor = (cats: Cat[], slug: string) => {
  const cat = cats.find(c => c.slug === slug);
  if (!cat) return [];
  return [cat.id, ...cats.filter(c => c.parent_id === cat.id).map(c => c.id)];
};
