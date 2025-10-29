import { Product } from '@/types/products';

/**
 * Eink display products catalog
 */
export const products: Product[] = [
  {
    id: 'eink-42',
    name: 'VibePay Monitor 4.2"',
    size: '4.2 inches',
    resolution: '400 x 300',
    price: 0.01,
    description: 'Compact payment monitoring display perfect for small businesses and popup shops.',
    features: [
      'Real-time payment notifications',
      'Ultra-low power consumption',
      'Paper-like clarity',
      'WiFi enabled',
      'Battery lasts 2 weeks'
    ],
    inStock: true
  },
  {
    id: 'eink-75',
    name: 'VibePay Monitor 7.5"',
    size: '7.5 inches',
    resolution: '800 x 480',
    price: 0.02,
    description: 'Mid-size display ideal for retail counters and service desks.',
    features: [
      'Real-time payment notifications',
      'Enhanced visibility',
      'Paper-like clarity',
      'WiFi & Ethernet',
      'Battery lasts 3 weeks',
      'Multi-currency support'
    ],
    inStock: true
  },
  {
    id: 'eink-103',
    name: 'VibePay Monitor 10.3"',
    size: '10.3 inches',
    resolution: '1872 x 1404',
    price: 0.03,
    description: 'Premium large display for professional merchant environments.',
    features: [
      'Real-time payment notifications',
      'High resolution display',
      'Paper-like clarity',
      'WiFi & Ethernet',
      'Battery lasts 4 weeks',
      'Multi-currency support',
      'Analytics dashboard',
      'Custom branding options'
    ],
    inStock: true
  },
  {
    id: 'eink-133',
    name: 'VibePay Monitor 13.3"',
    size: '13.3 inches',
    resolution: '2200 x 1650',
    price: 0.04,
    description: 'Enterprise-grade display for high-volume merchant operations.',
    features: [
      'Real-time payment notifications',
      'Premium resolution',
      'Paper-like clarity',
      'WiFi & Ethernet & PoE',
      'Battery lasts 5 weeks',
      'Multi-currency support',
      'Advanced analytics',
      'Custom branding',
      'API integration',
      'Priority support'
    ],
    inStock: true
  }
];

