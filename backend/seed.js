
const Product = require('./models/Product');
const Category = require('./models/Category');
const HeaderSetting = require('./models/HeaderSetting');
const FooterSetting = require('./models/FooterSetting');
const Slide = require('./models/Slide');

const categoriesData = [
  {
    id: 'clothing',
    name: 'Clothing',
    subcategories: [
      { id: 'dresses', name: 'Dresses' },
      { id: 'tops', name: 'Tops & Blouses' },
      { id: 'jeans', name: 'Jeans & Denim' },
      { id: 'ethnic', name: 'Ethnic Wear' },
    ],
  },
  {
    id: 'footwear',
    name: 'Footwear',
    subcategories: [
      { id: 'heels', name: 'Heels & Pumps' },
      { id: 'flats', name: 'Flats & Sandals' },
      { id: 'sneakers', name: 'Sneakers' },
      { id: 'boots', name: 'Boots' },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    subcategories: [
      { id: 'bags', name: 'Handbags' },
      { id: 'jewelry', name: 'Jewelry' },
      { id: 'watches', name: 'Watches' },
      { id: 'sunglasses', name: 'Sunglasses' },
    ],
  },
   {
    id: 'beauty',
    name: 'Beauty',
    subcategories: [
      { id: 'makeup', name: 'Makeup' },
      { id: 'skincare', name: 'Skincare' },
      { id: 'fragrance', name: 'Fragrance' },
      { id: 'haircare', name: 'Haircare' },
    ],
  },
];

const productsData = [
  { name: 'Floral Summer Maxi Dress', category: 'Clothing', price: 1499.00, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=400&auto=format&fit=crop', description: 'Elegant floral print maxi dress, perfect for summer outings. Breathable fabric and comfortable fit.' },
  { name: 'Classic Leather Tote Bag', category: 'Accessories', price: 2999.00, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', description: 'Premium leather tote bag with ample space for your essentials. Timeless design for every occasion.' },
  { name: 'Rose Gold Plated Necklace', category: 'Accessories', price: 899.00, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=400&auto=format&fit=crop', description: 'Delicate rose gold plated necklace with a minimalist pendant. Adds a touch of sophistication to any outfit.' },
  { name: 'Red Stiletto Heels', category: 'Footwear', price: 2499.00, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop', description: 'Bold and beautiful red stiletto heels. Perfect for parties and evening events.' },
  { name: 'Denim Jacket with Embroidery', category: 'Clothing', price: 1850.00, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?q=80&w=400&auto=format&fit=crop', description: 'Stylish denim jacket featuring intricate floral embroidery. A versatile layer for any season.' },
  { name: 'Matte Liquid Lipstick Set', category: 'Beauty', price: 999.00, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&auto=format&fit=crop', description: 'Long-lasting matte liquid lipstick set in 3 stunning shades. Smudge-proof and highly pigmented.' },
  { name: 'Silk Scarf - Vintage Print', category: 'Accessories', price: 450.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=400&auto=format&fit=crop', description: 'Luxurious silk scarf with a vintage print. Soft, smooth, and adds a chic flair to your look.' },
  { name: 'White Casual Sneakers', category: 'Footwear', price: 1299.00, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=400&auto=format&fit=crop', description: 'Comfortable white sneakers for everyday wear. Pairs perfectly with jeans or dresses.' },
];

const slidesData = [
  {
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
    title: "New Season Arrivals",
    subtitle: "Discover the latest trends in women's fashion. Elevate your style today.",
    buttonText: "Shop Collection"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
    title: "Elegance Redefined",
    subtitle: "Explore our exclusive range of dresses and evening wear.",
    buttonText: "View Dresses"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1920&auto=format&fit=crop",
    title: "Beauty & Glow",
    subtitle: "Premium skincare and makeup essentials for a radiant you.",
    buttonText: "Shop Beauty"
  }
];

const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('No products found, seeding database...');
      await Product.insertMany(productsData);
      console.log('Products seeded.');
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
        console.log('No categories found, seeding database...');
        await Category.insertMany(categoriesData);
        console.log('Categories seeded.');
    }

    const settingsCount = await HeaderSetting.countDocuments();
    if (settingsCount === 0) {
      console.log('No header settings found, seeding database...');
      await HeaderSetting.create({
        uniqueId: 'main_header_settings',
        logoText: 'Ladies Smart Choice',
        phoneNumber: '+91 987 654 3210',
        topBarLinks: [
          { text: 'About Us', url: '#' },
          { text: 'Order Tracking', url: '#' },
          { text: 'Contact Us', url: '#' },
          { text: 'Blog', url: '#' },
        ],
        mainNavLinks: [
            { text: 'New Arrivals', url: '#' },
            { text: 'Clothing', url: '#' },
            { text: 'Footwear', url: '#' },
            { text: 'Accessories', url: '#' },
            { text: 'Beauty', url: '#' },
            { text: 'Sale', url: '#' },
        ]
      });
      console.log('Header settings seeded.');
    }

    const footerCount = await FooterSetting.countDocuments();
    if (footerCount === 0) {
      console.log('No footer settings found, seeding database...');
      await FooterSetting.create({
        uniqueId: 'main_footer_settings',
        brandDescription: 'Your ultimate destination for trendy women\'s fashion, accessories, and lifestyle products. Elevate your style every day.',
        copyrightText: '© 2024 Ladies Smart Choice. All rights reserved.',
        socialLinks: [
            { platform: 'Facebook', url: '#' },
            { platform: 'Instagram', url: '#' },
            { platform: 'Twitter', url: '#' }
        ],
        columns: [
            {
                title: 'Shop',
                links: [
                    { text: 'Clothing', url: '/shop/clothing' },
                    { text: 'Footwear', url: '/shop/footwear' },
                    { text: 'Accessories', url: '/shop/accessories' },
                    { text: 'Beauty', url: '/shop/beauty' }
                ]
            },
            {
                title: 'Support',
                links: [
                    { text: 'Contact Us', url: '/contact' },
                    { text: 'FAQs', url: '/faqs' },
                    { text: 'Shipping & Returns', url: '/shipping' },
                    { text: 'Track Order', url: '/track' }
                ]
            },
            {
                title: 'Company',
                links: [
                    { text: 'About Us', url: '/about' },
                    { text: 'Careers', url: '/careers' },
                    { text: 'Privacy Policy', url: '/privacy' },
                    { text: 'Terms of Service', url: '/terms' }
                ]
            }
        ]
      });
      console.log('Footer settings seeded.');
    }
    
    const slideCount = await Slide.countDocuments();
    if (slideCount === 0) {
        console.log('No slides found, seeding database...');
        await Slide.insertMany(slidesData);
        console.log('Slides seeded.');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
