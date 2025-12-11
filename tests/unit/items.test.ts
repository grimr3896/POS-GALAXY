import { getGroupedItemsForCSV } from '@/lib/items';
import type { TransactionItem } from '@/lib/types';

describe('getGroupedItemsForCSV', () => {

  it('groups simple repeated bottle items', () => {
    const items: TransactionItem[] = [
      { id: 1, productId: 1, productName: 'Guinness', quantity: 1, unitPrice: 300, buyPrice: 150, lineTotal: 300, lineCost: 150 },
      { id: 2, productId: 1, productName: 'Guinness', quantity: 1, unitPrice: 300, buyPrice: 150, lineTotal: 300, lineCost: 150 },
    ];
    expect(getGroupedItemsForCSV(items)).toBe('2x Guinness');
  });

  it('handles multiple different bottle items', () => {
    const items: TransactionItem[] = [
      { id: 1, productId: 1, productName: 'Guinness', quantity: 2, unitPrice: 300, buyPrice: 150, lineTotal: 600, lineCost: 300 },
      { id: 2, productId: 2, productName: 'Tascar', quantity: 1, unitPrice: 250, buyPrice: 120, lineTotal: 250, lineCost: 120 },
    ];
    expect(getGroupedItemsForCSV(items)).toBe('2x Guinness; 1x Tascar');
  });

  it('groups poured items and converts to L when >= 1000ml', () => {
    const items: TransactionItem[] = [
      { id: 1, productId: 6, productName: 'Whiskey (1/2 L)', quantity: 2, unitPrice: 450, buyPrice: 9000, lineTotal: 900, lineCost: 18000, pourSizeML: 500 },
      { id: 2, productId: 6, productName: 'Whiskey (1 L)', quantity: 1, unitPrice: 850, buyPrice: 18000, lineTotal: 850, lineCost: 18000, pourSizeML: 1000 },
    ];
    // 2 * 500ml + 1 * 1000ml = 2000ml = 2.0L
    expect(getGroupedItemsForCSV(items)).toBe('Whiskey (1/2 L): 2.0L');
  });
  
  it('groups poured items and keeps ml when < 1000ml', () => {
    const items: TransactionItem[] = [
        { id: 1, productId: 6, productName: 'Whiskey (1/4 L)', quantity: 1, unitPrice: 250, buyPrice: 4500, lineTotal: 250, lineCost: 4500, pourSizeML: 250 },
        { id: 2, productId: 6, productName: 'Whiskey (1/2 L)', quantity: 1, unitPrice: 450, buyPrice: 9000, lineTotal: 450, lineCost: 9000, pourSizeML: 500 },
    ];
    // 1 * 250ml + 1 * 500ml = 750ml
    expect(getGroupedItemsForCSV(items)).toBe('Whiskey (1/4 L): 750ml');
  });

  it('handles a mix of bottle and pour items', () => {
    const items: TransactionItem[] = [
      { id: 1, productId: 1, productName: 'Guinness', quantity: 3, unitPrice: 300, buyPrice: 150, lineTotal: 900, lineCost: 450 },
      { id: 2, productId: 6, productName: 'Whiskey (1 L)', quantity: 2, unitPrice: 850, buyPrice: 18000, lineTotal: 1700, lineCost: 36000, pourSizeML: 1000 },
    ];
    const result = getGroupedItemsForCSV(items);
    // Order can vary based on object key insertion order, so we check for both parts
    expect(result).toContain('3x Guinness');
    expect(result).toContain('Whiskey (1 L): 2.0L');
  });

  it('returns an empty string for null or empty input', () => {
    expect(getGroupedItemsForCSV([])).toBe('');
    expect(getGroupedItemsForCSV(null as any)).toBe('');
  });
});
