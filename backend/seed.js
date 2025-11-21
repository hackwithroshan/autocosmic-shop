
const Product = require('./models/Product');
const Category = require('./models/Category');
const HeaderSetting = require('./models/HeaderSetting');
const Slide = require('./models/Slide');

const categoriesData = [
  {
    id: 'performance',
    name: 'Performance',
    subcategories: [
      { id: 'exhaust', name: 'Exhaust Systems' },
      { id: 'turbos', name: 'Turbochargers' },
      { id: 'intakes', name: 'Air Intakes' },
      { id: 'tuning', name: 'ECU Tuning' },
    ],
  },
  {
    id: 'exterior',
    name: 'Exterior',
    subcategories: [
      { id: 'body-kits', name: 'Body Kits' },
      { id: 'spoilers', name: 'Spoilers & Wings' },
      { id: 'lighting', name: 'Lighting' },
      { id: 'wheels', name: 'Wheels & Tires' },
    ],
  },
  {
    id: 'interior',
    name: 'Interior',
    subcategories: [
      { id: 'seats', name: 'Racing Seats' },
      { id: 'steering', name: 'Steering Wheels' },
      { id: 'gauges', name: 'Gauges & Pods' },
      { id: 'shifters', name: 'Short Shifters' },
    ],
  },
   {
    id: 'maintenance',
    name: 'Maintenance',
    subcategories: [
      { id: 'oil', name: 'Oil & Fluids' },
      { id: 'filters', name: 'Filters' },
      { id: 'brakes', name: 'Brake Pads & Rotors' },
      { id: 'plugs', name: 'Spark Plugs' },
    ],
  },
];

const productsData = [
  { name: 'CosmicFlow Turbo Kit', category: 'Performance', price: 1999.99, stock: 15, imageUrl: 'https://picsum.photos/seed/turbo/400/400', description: 'Boost your performance with our state-of-the-art turbocharger kit.' },
  { name: 'AeroForm Carbon Spoiler', category: 'Exterior', price: 749.50, stock: 32, imageUrl: 'https://picsum.photos/seed/spoiler/400/400', description: 'Lightweight carbon fiber spoiler for maximum downforce and style.' },
  { name: 'GripMaster Racing Seat', category: 'Interior', price: 599.00, stock: 8, imageUrl: 'https://picsum.photos/seed/seat/400/400', description: 'Stay planted in the corners with the GripMaster racing seat.' },
  { name: 'QuantumShift Short Shifter', category: 'Interior', price: 220.00, stock: 50, imageUrl: 'https://picsum.photos/seed/shifter/400/400', description: 'Crisp and precise shifts every time.' },
  { name: 'NovaBeam LED Headlights', category: 'Exterior', price: 450.00, stock: 25, imageUrl: 'https://picsum.photos/seed/lights/400/400', description: 'Illuminate the road ahead with powerful and stylish LED headlights.' },
  { name: 'Vortex Cold Air Intake', category: 'Performance', price: 320.75, stock: 40, imageUrl: 'https://picsum.photos/seed/intake/400/400', description: 'Increase horsepower and torque with a high-flow cold air intake system.' },
  { name: 'Titanium Performance Exhaust', category: 'Performance', price: 1250.00, stock: 18, imageUrl: 'https://picsum.photos/seed/exhaust/400/400', description: 'Aggressive sound and performance gains from a full titanium exhaust.' },
  { name: 'Forged Alloy Wheels (Set of 4)', category: 'Exterior', price: 2500.00, stock: 12, imageUrl: 'https://picsum.photos/seed/wheels/400/400', description: 'Ultra-light and strong forged alloy wheels to reduce unsprung weight.' },
];

const slidesData = [
  {
    imageUrl: "https://picsum.photos/seed/carbg1/1920/1080",
    title: "Unleash Your Ride's Potential",
    subtitle: "Premium performance parts and accessories to elevate your driving experience.",
    buttonText: "Shop Performance"
  },
  {
    imageUrl: "https://picsum.photos/seed/carbg2/1920/1080",
    title: "Style That Turns Heads",
    subtitle: "Discover our exclusive range of exterior and interior styling options.",
    buttonText: "Explore Styling"
  },
  {
    imageUrl: "https://picsum.photos/seed/carbg3/1920/1080",
    title: "Essential Maintenance, Simplified",
    subtitle: "Keep your car in peak condition with our high-quality maintenance parts.",
    buttonText: "View Maintenance Kits"
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
        logoText: 'AutoCosmic',
        phoneNumber: '+001 123 456 789',
        topBarLinks: [
          { text: 'About Us', url: '#' },
          { text: 'Order Tracking', url: '#' },
          { text: 'Contact Us', url: '#' },
          { text: 'FAQs', url: '#' },
        ],
        mainNavLinks: [
            { text: 'Performance Parts', url: '#' },
            { text: 'Exterior Styling', url: '#' },
            { text: 'Interior Upgrades', url: '#' },
            { text: 'Wheels & Tires', url: '#' },
            { text: 'Maintenance', url: '#' },
            { text: 'Blog', url: '#' },
        ]
      });
      console.log('Header settings seeded.');
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
