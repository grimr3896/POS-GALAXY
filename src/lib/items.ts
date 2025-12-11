import type { TransactionItem } from './types';

export function getGroupedItemsForCSV(items: TransactionItem[]): string {
    if (!items || items.length === 0) return '';
    
    const grouped = items.reduce((acc, item) => {
      const name = item.productName;
      
      if (!acc[name]) {
        acc[name] = { quantity: 0, isPour: !!item.pourSizeML };
      }
      
      if(item.pourSizeML) {
        acc[name].quantity += (item.pourSizeML * item.quantity); // aggregate ml
      } else {
        acc[name].quantity += item.quantity; // aggregate units
      }
      
      return acc;
    }, {} as Record<string, { quantity: number; isPour: boolean }>);

    return Object.entries(grouped)
      .map(([name, { quantity, isPour }]) => {
         if (isPour) {
            if (quantity >= 1000) {
                return `${name}: ${(quantity / 1000).toFixed(1)}L`;
            }
            return `${name}: ${quantity}ml`;
         }
         return `${quantity}x ${name}`;
      })
      .join('; ');
}
