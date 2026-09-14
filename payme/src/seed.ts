import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function fakePaymentLink(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'pay_'
  for (let i = 0; i < 12; i++) result += chars[randomBetween(0, chars.length - 1)]
  return result
}

function fakeStripeId(): string {
  const hex = () => randomBetween(1000000000, 9999999999).toString(36)
  return `pi_test_${hex()}${hex()}`
}

function fakePaypalId(): string {
  const seg = () =>
    randomBetween(10000000, 99999999)
      .toString(36)
      .toUpperCase()
  return `PAYPAL-TEST-${seg()}-${seg()}`
}

function fakeIdempotencyKey(): string {
  return `idk_test_${Date.now()}_${randomBetween(100000, 999999)}`
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomBetween(0, arr.length - 1)]
}

// RFC 5737 documentation IPs
const DOC_IPS = [
  '192.0.2.10', '192.0.2.42', '192.0.2.88', '192.0.2.101', '192.0.2.200',
  '198.51.100.14', '198.51.100.55', '198.51.100.73', '198.51.100.99',
  '203.0.113.5', '203.0.113.22', '203.0.113.47', '203.0.113.80',
]

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/17.5',
  'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
]

// ─── User Data ────────────────────────────────────────────────────────────────

const USERS = [
  // Admins
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    firstName: 'Priya',
    lastName: 'Khatri',
    role: 'admin' as const,
    phone: '+1 555-900-0001',
    businessName: 'PayMe Platform',
    taxId: '00-0000001',
    address: { street: '1 Platform Way', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' as const },
  },
  {
    email: 'ops@example.com',
    password: 'Admin123!',
    firstName: 'Marcus',
    lastName: 'Okafor',
    role: 'admin' as const,
    phone: '+1 555-900-0002',
    businessName: 'PayMe Operations',
    taxId: '00-0000002',
    address: { street: '2 Platform Way', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' as const },
  },
  // Freelancers
  {
    email: 'elena.vasquez@example.com',
    password: 'Freelance1!',
    firstName: 'Elena',
    lastName: 'Vasquez',
    role: 'user' as const,
    phone: '+1 555-201-3344',
    businessName: 'Vasquez Design Studio',
    taxId: '12-3456001',
    company: 'Vasquez Design Studio',
    address: { street: '847 Oakwood Drive', city: 'Austin', state: 'TX', zip: '73301', country: 'US' as const },
  },
  {
    email: 'james.whitfield@example.com',
    password: 'Freelance1!',
    firstName: 'James',
    lastName: 'Whitfield',
    role: 'user' as const,
    phone: '+44 7555 012345',
    businessName: 'Whitfield Web Solutions',
    taxId: 'GB-VAT-555000111',
    company: 'Whitfield Web Solutions',
    address: { street: '22 Bloomsbury Lane', city: 'London', state: 'Greater London', zip: 'WC1B 3QJ', country: 'GB' as const },
  },
  {
    email: 'aiko.tanabe@example.com',
    password: 'Freelance1!',
    firstName: 'Aiko',
    lastName: 'Tanabe',
    role: 'user' as const,
    phone: '+81 555-0123-4567',
    businessName: 'Tanabe Photography',
    taxId: 'JP-TAX-5550001',
    company: 'Tanabe Photography',
    address: { street: '3-14-8 Shimokitazawa', city: 'Setagaya', state: 'Tokyo', zip: '155-0031', country: 'JP' as const },
  },
  {
    email: 'omar.benali@example.com',
    password: 'Freelance1!',
    firstName: 'Omar',
    lastName: 'Benali',
    role: 'user' as const,
    phone: '+33 5 55 01 23 45',
    businessName: 'Benali Consulting',
    taxId: 'FR-SIRET-55500012300',
    company: 'Benali Consulting',
    address: { street: '18 Rue des Lilas', city: 'Lyon', state: 'Auvergne-Rhône-Alpes', zip: '69003', country: 'FR' as const },
  },
  {
    email: 'sarah.chen@example.com',
    password: 'Freelance1!',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'user' as const,
    phone: '+1 555-303-7788',
    businessName: 'Chen Copywriting',
    taxId: '12-3456002',
    company: 'Chen Copywriting',
    address: { street: '540 Pine Ridge Road', city: 'Denver', state: 'CO', zip: '80202', country: 'US' as const },
  },
  {
    email: 'liam.oconnell@example.com',
    password: 'Freelance1!',
    firstName: 'Liam',
    lastName: "O'Connell",
    role: 'user' as const,
    phone: '+61 4 5550 1234',
    businessName: "O'Connell Video Productions",
    taxId: 'AU-ABN-55500012300',
    company: "O'Connell Video Productions",
    address: { street: '88 Harbour Street', city: 'Sydney', state: 'NSW', zip: '2000', country: 'AU' as const },
  },
  {
    email: 'fatima.sharma@example.com',
    password: 'Freelance1!',
    firstName: 'Fatima',
    lastName: 'Sharma',
    role: 'user' as const,
    phone: '+91 55500 12345',
    businessName: 'Sharma Architecture',
    taxId: 'IN-GST-55AAACS5550A1Z5',
    company: 'Sharma Architecture',
    address: { street: '12 Lotus Tower, MG Road', city: 'Bangalore', state: 'Karnataka', zip: '560001', country: 'IN' as const },
  },
  {
    email: 'tobias.richter@example.com',
    password: 'Freelance1!',
    firstName: 'Tobias',
    lastName: 'Richter',
    role: 'user' as const,
    phone: '+49 555 0123456',
    businessName: 'Richter Übersetzungen',
    taxId: 'DE-USt-555001234',
    company: 'Richter Übersetzungen',
    address: { street: 'Lindenstraße 42', city: 'Berlin', state: 'Berlin', zip: '10117', country: 'DE' as const },
  },
  {
    email: 'carolina.ferreira@example.com',
    password: 'Freelance1!',
    firstName: 'Carolina',
    lastName: 'Ferreira',
    role: 'user' as const,
    phone: '+55 11 5550-1234',
    businessName: 'Ferreira Marketing Digital',
    taxId: 'BR-CNPJ-55.500.123/0001-00',
    company: 'Ferreira Marketing Digital',
    address: { street: 'Rua das Palmeiras 256', city: 'São Paulo', state: 'SP', zip: '01234-000', country: 'BR' as const },
  },
  {
    email: 'nadia.kovacs@example.com',
    password: 'Freelance1!',
    firstName: 'Nadia',
    lastName: 'Kovacs',
    role: 'user' as const,
    phone: '+1 555-404-9922',
    businessName: 'Kovacs Sound Design',
    taxId: '12-3456003',
    company: 'Kovacs Sound Design',
    address: { street: '1200 Music Row', city: 'Nashville', state: 'TN', zip: '37203', country: 'US' as const },
  },
]

// Currency per user (matched to country)
const USER_CURRENCY: Record<string, string> = {
  'elena.vasquez@example.com': 'USD',
  'james.whitfield@example.com': 'GBP',
  'aiko.tanabe@example.com': 'JPY',
  'omar.benali@example.com': 'EUR',
  'sarah.chen@example.com': 'USD',
  'liam.oconnell@example.com': 'AUD',
  'fatima.sharma@example.com': 'INR',
  'tobias.richter@example.com': 'EUR',
  'carolina.ferreira@example.com': 'BRL',
  'nadia.kovacs@example.com': 'USD',
}

// ─── Line Item Templates ──────────────────────────────────────────────────────

type LineItemTemplate = { description: string; qtyRange: [number, number]; priceRange: [number, number] }

const LINE_ITEMS_BY_USER: Record<string, LineItemTemplate[]> = {
  'elena.vasquez@example.com': [
    { description: 'Brand identity design — logo suite', qtyRange: [1, 1], priceRange: [1500, 4500] },
    { description: 'Business card design (front + back)', qtyRange: [1, 2], priceRange: [250, 600] },
    { description: 'Social media kit — 12 templates', qtyRange: [1, 1], priceRange: [800, 1800] },
    { description: 'Packaging mockup — 3D renders', qtyRange: [1, 4], priceRange: [400, 1200] },
    { description: 'Letterhead and envelope design', qtyRange: [1, 1], priceRange: [300, 700] },
    { description: 'Brand guidelines document', qtyRange: [1, 1], priceRange: [1200, 3000] },
    { description: 'Icon set — 24 custom icons', qtyRange: [1, 1], priceRange: [600, 1500] },
    { description: 'Presentation deck template (20 slides)', qtyRange: [1, 1], priceRange: [900, 2000] },
    { description: 'Email newsletter template', qtyRange: [1, 3], priceRange: [350, 800] },
    { description: 'Infographic design', qtyRange: [1, 3], priceRange: [500, 1400] },
  ],
  'james.whitfield@example.com': [
    { description: 'Next.js website development — homepage', qtyRange: [1, 1], priceRange: [2000, 5000] },
    { description: 'API integration — payment gateway', qtyRange: [1, 1], priceRange: [1500, 3500] },
    { description: 'CMS setup and content migration', qtyRange: [1, 1], priceRange: [1200, 2800] },
    { description: 'Performance audit and optimization', qtyRange: [1, 1], priceRange: [800, 2000] },
    { description: 'Responsive design implementation', qtyRange: [1, 1], priceRange: [1000, 2500] },
    { description: 'E-commerce product pages (per page)', qtyRange: [3, 12], priceRange: [200, 500] },
    { description: 'Database schema design and setup', qtyRange: [1, 1], priceRange: [900, 2200] },
    { description: 'Authentication system implementation', qtyRange: [1, 1], priceRange: [1500, 3000] },
    { description: 'CI/CD pipeline configuration', qtyRange: [1, 1], priceRange: [600, 1400] },
    { description: 'Ongoing maintenance (per month)', qtyRange: [1, 3], priceRange: [500, 1200] },
  ],
  'aiko.tanabe@example.com': [
    { description: 'Product photography — flat lay (per item)', qtyRange: [5, 20], priceRange: [80, 200] },
    { description: 'Lifestyle photography session (half day)', qtyRange: [1, 2], priceRange: [40000, 80000] },
    { description: 'Post-production editing (per image)', qtyRange: [10, 50], priceRange: [3000, 8000] },
    { description: 'Photo retouching — advanced compositing', qtyRange: [1, 5], priceRange: [15000, 35000] },
    { description: 'Location scouting and setup', qtyRange: [1, 1], priceRange: [20000, 50000] },
    { description: 'Studio rental coordination', qtyRange: [1, 2], priceRange: [30000, 60000] },
    { description: 'Model direction and styling consultation', qtyRange: [1, 1], priceRange: [25000, 55000] },
    { description: 'Digital asset delivery — high-res package', qtyRange: [1, 1], priceRange: [10000, 25000] },
    { description: 'Rush delivery surcharge', qtyRange: [1, 1], priceRange: [15000, 30000] },
  ],
  'omar.benali@example.com': [
    { description: 'Business strategy consultation (per hour)', qtyRange: [2, 8], priceRange: [150, 350] },
    { description: 'Market research report', qtyRange: [1, 1], priceRange: [2500, 6000] },
    { description: 'Financial modeling and projections', qtyRange: [1, 1], priceRange: [3000, 7000] },
    { description: 'Competitive analysis — 5 competitors', qtyRange: [1, 1], priceRange: [1800, 4000] },
    { description: 'Pitch deck preparation', qtyRange: [1, 1], priceRange: [2000, 5000] },
    { description: 'Operational efficiency audit', qtyRange: [1, 1], priceRange: [3500, 8000] },
    { description: 'Workshop facilitation (full day)', qtyRange: [1, 3], priceRange: [1200, 2800] },
    { description: 'Quarterly business review preparation', qtyRange: [1, 1], priceRange: [1500, 3500] },
    { description: 'KPI dashboard design and setup', qtyRange: [1, 1], priceRange: [2200, 5000] },
  ],
  'sarah.chen@example.com': [
    { description: 'Website copy — landing page', qtyRange: [1, 3], priceRange: [500, 1500] },
    { description: 'Blog post (1,500-2,000 words)', qtyRange: [1, 6], priceRange: [250, 600] },
    { description: 'Email campaign sequence (5 emails)', qtyRange: [1, 1], priceRange: [800, 2000] },
    { description: 'Product descriptions (per product)', qtyRange: [5, 20], priceRange: [50, 150] },
    { description: 'SEO content strategy and keyword research', qtyRange: [1, 1], priceRange: [1000, 2500] },
    { description: 'White paper — research and writing', qtyRange: [1, 1], priceRange: [2000, 5000] },
    { description: 'Social media content calendar (monthly)', qtyRange: [1, 3], priceRange: [600, 1400] },
    { description: 'Case study — interview and writing', qtyRange: [1, 2], priceRange: [800, 1800] },
    { description: 'Editing and proofreading (per 1,000 words)', qtyRange: [2, 10], priceRange: [40, 100] },
    { description: 'Tagline and slogan development', qtyRange: [1, 1], priceRange: [400, 1000] },
  ],
  'liam.oconnell@example.com': [
    { description: 'Corporate video production (per minute)', qtyRange: [2, 8], priceRange: [800, 2000] },
    { description: 'Drone footage — aerial cinematography', qtyRange: [1, 1], priceRange: [1200, 3000] },
    { description: 'Video editing and color grading', qtyRange: [1, 1], priceRange: [1500, 3500] },
    { description: 'Motion graphics — title sequences', qtyRange: [1, 3], priceRange: [600, 1500] },
    { description: 'Voiceover recording and mixing', qtyRange: [1, 1], priceRange: [400, 1000] },
    { description: 'Subtitling and closed captions', qtyRange: [1, 1], priceRange: [300, 800] },
    { description: 'Script writing — 60-second spot', qtyRange: [1, 2], priceRange: [500, 1200] },
    { description: 'Social media video edits (per video)', qtyRange: [3, 10], priceRange: [200, 500] },
    { description: 'Equipment rental coordination', qtyRange: [1, 2], priceRange: [350, 900] },
  ],
  'fatima.sharma@example.com': [
    { description: 'Architectural concept design — residential', qtyRange: [1, 1], priceRange: [50000, 150000] },
    { description: '3D visualization renders (per view)', qtyRange: [2, 6], priceRange: [8000, 25000] },
    { description: 'Floor plan drafting — AutoCAD', qtyRange: [1, 3], priceRange: [15000, 40000] },
    { description: 'Site analysis and feasibility report', qtyRange: [1, 1], priceRange: [25000, 60000] },
    { description: 'Interior design consultation (per room)', qtyRange: [1, 5], priceRange: [12000, 30000] },
    { description: 'Structural engineering coordination', qtyRange: [1, 1], priceRange: [20000, 50000] },
    { description: 'Building permit documentation', qtyRange: [1, 1], priceRange: [18000, 40000] },
    { description: 'Project management (per month)', qtyRange: [1, 6], priceRange: [30000, 70000] },
    { description: 'Material specification schedule', qtyRange: [1, 1], priceRange: [10000, 25000] },
  ],
  'tobias.richter@example.com': [
    { description: 'Document translation EN→DE (per 1,000 words)', qtyRange: [2, 15], priceRange: [80, 180] },
    { description: 'Document translation DE→EN (per 1,000 words)', qtyRange: [2, 10], priceRange: [80, 180] },
    { description: 'Certified translation — legal documents', qtyRange: [1, 5], priceRange: [150, 400] },
    { description: 'Website localization — content adaptation', qtyRange: [1, 1], priceRange: [1500, 3500] },
    { description: 'Simultaneous interpretation (per hour)', qtyRange: [2, 8], priceRange: [120, 280] },
    { description: 'Technical manual translation', qtyRange: [1, 1], priceRange: [2000, 5000] },
    { description: 'Proofreading — translated content', qtyRange: [1, 5], priceRange: [50, 120] },
    { description: 'Transcription — audio to text (per hour)', qtyRange: [1, 4], priceRange: [60, 140] },
    { description: 'Subtitle translation (per minute of video)', qtyRange: [5, 30], priceRange: [15, 40] },
  ],
  'carolina.ferreira@example.com': [
    { description: 'Social media management — monthly retainer', qtyRange: [1, 3], priceRange: [2000, 5000] },
    { description: 'Google Ads campaign setup and optimization', qtyRange: [1, 1], priceRange: [1500, 3500] },
    { description: 'Facebook/Instagram ad campaign', qtyRange: [1, 2], priceRange: [1200, 3000] },
    { description: 'Marketing strategy consultation', qtyRange: [1, 1], priceRange: [2500, 6000] },
    { description: 'Email automation workflow setup', qtyRange: [1, 1], priceRange: [1800, 4000] },
    { description: 'Analytics dashboard and reporting', qtyRange: [1, 1], priceRange: [1000, 2500] },
    { description: 'Influencer outreach campaign', qtyRange: [1, 1], priceRange: [2000, 5000] },
    { description: 'Brand voice guidelines', qtyRange: [1, 1], priceRange: [1500, 3500] },
    { description: 'Content creation — 10 post bundle', qtyRange: [1, 3], priceRange: [800, 2000] },
    { description: 'Competitor social media audit', qtyRange: [1, 1], priceRange: [900, 2200] },
  ],
  'nadia.kovacs@example.com': [
    { description: 'Sound design — podcast intro/outro', qtyRange: [1, 1], priceRange: [300, 800] },
    { description: 'Audio mixing and mastering (per track)', qtyRange: [1, 8], priceRange: [200, 500] },
    { description: 'Original music composition — 60 seconds', qtyRange: [1, 3], priceRange: [800, 2000] },
    { description: 'Foley and sound effects package', qtyRange: [1, 1], priceRange: [600, 1500] },
    { description: 'Podcast editing (per episode)', qtyRange: [1, 12], priceRange: [150, 400] },
    { description: 'Voiceover direction and editing', qtyRange: [1, 2], priceRange: [350, 900] },
    { description: 'Audio restoration and noise reduction', qtyRange: [1, 3], priceRange: [250, 600] },
    { description: 'Jingle production — full arrangement', qtyRange: [1, 1], priceRange: [1000, 3000] },
    { description: 'Streaming audio setup consultation', qtyRange: [1, 1], priceRange: [400, 1000] },
  ],
}

// ─── Client Name Pool ─────────────────────────────────────────────────────────

const CLIENT_NAMES = [
  { name: 'Northwind Traders', email: 'billing@northwind-traders.test.dev' },
  { name: 'Cascade Brewing Co.', email: 'accounts@cascade-brewing.test.dev' },
  { name: 'Pineapple Studios', email: 'finance@pineapple-studios.test.dev' },
  { name: 'Riverstone Analytics', email: 'ap@riverstone-analytics.test.dev' },
  { name: 'Blue Horizon Travel', email: 'invoices@bluehorizon.test.dev' },
  { name: 'Ember & Oak Interiors', email: 'hello@ember-oak.test.dev' },
  { name: 'Silverline Logistics', email: 'billing@silverline-logistics.test.dev' },
  { name: 'Fern Valley Organics', email: 'finance@fernvalley.test.dev' },
  { name: 'Atlas Coworking', email: 'admin@atlas-coworking.test.dev' },
  { name: 'Velvet Room Records', email: 'accounts@velvetroom.test.dev' },
  { name: 'Solstice Health', email: 'ap@solstice-health.test.dev' },
  { name: 'Crimson Fox Agency', email: 'billing@crimsonfox.test.dev' },
  { name: 'Meadowlark Education', email: 'finance@meadowlark-edu.test.dev' },
  { name: 'Starboard Ventures', email: 'invoices@starboard-vc.test.dev' },
  { name: 'Willow Creek Dental', email: 'office@willowcreek-dental.test.dev' },
  { name: 'Ironclad Fitness', email: 'manager@ironclad-fitness.test.dev' },
  { name: 'Tidal Wave Software', email: 'procurement@tidalwave.test.dev' },
  { name: 'Goldfinch Bakery', email: 'orders@goldfinch-bakery.test.dev' },
  { name: 'Summit Peak Consulting', email: 'ap@summitpeak.test.dev' },
  { name: 'Mosaic Tile Co.', email: 'billing@mosaictile.test.dev' },
  { name: 'Redwood Capital Partners', email: 'finance@redwood-cap.test.dev' },
  { name: 'Lantern Press Publishing', email: 'accounts@lanternpress.test.dev' },
  { name: 'Coastal Pet Supplies', email: 'invoices@coastalpet.test.dev' },
  { name: 'Horizon Electric', email: 'billing@horizonelectric.test.dev' },
  { name: 'Sapphire Bay Resort', email: 'finance@sapphirebay.test.dev' },
  { name: 'Birchwood Accounting', email: 'partners@birchwood-acct.test.dev' },
  { name: 'Midnight Sun Cafe', email: 'owner@midnightsun-cafe.test.dev' },
  { name: 'Verdant Labs', email: 'procurement@verdantlabs.test.dev' },
  { name: 'Copper Ridge Winery', email: 'admin@copperridge.test.dev' },
  { name: 'Nimbus Cloud Solutions', email: 'billing@nimbus-cloud.test.dev' },
  { name: 'Foxglove Floral', email: 'shop@foxglovefloral.test.dev' },
  { name: 'Cornerstone Legal Group', email: 'accounts@cornerstone-legal.test.dev' },
  { name: 'Otter Creek Outdoor', email: 'purchasing@ottercreek.test.dev' },
  { name: 'Zenith Home Automation', email: 'projects@zenithhome.test.dev' },
  { name: 'Marble Arch Gallery', email: 'director@marblearch.test.dev' },
]

const CLIENT_ADDRESSES = [
  '500 Commerce Boulevard, Suite 200, Portland, OR 97201',
  '14 King Street West, Toronto, ON M5H 1A1',
  '221B Baker Row, Manchester M1 1AA',
  '45 Technology Park, Hyderabad 500081',
  'Schillerstraße 8, 80336 München',
  '78 Boulevard Haussmann, 75008 Paris',
  '1-2-3 Roppongi, Minato-ku, Tokyo 106-0032',
  'Rua Augusta 274, São Paulo 01305-000',
  '33 George Street, The Rocks, Sydney NSW 2000',
  '1600 Amphitheatre Parkway, Mountain View, CA 94043',
  '12 Innovation Drive, Waterloo, ON N2L 3L4',
  '99 Queen Victoria Street, London EC4V 4EH',
  'Kurfürstendamm 21, 10719 Berlin',
  '555 Mission Street, San Francisco, CA 94105',
  'Via della Conciliazione 10, 00193 Roma',
]

const CLIENT_PHONES = [
  '+1 555-100-2001', '+1 555-100-2002', '+1 555-100-2003', '+1 555-100-2004',
  '+44 7555 200100', '+44 7555 200200', '+33 5 5510 0300', '+49 555 0400100',
  '+81 555-0500-1000', '+91 55510 06000', '+61 4 5551 0700', '+55 11 5551-0800',
  '+1 555-100-2005', '+1 555-100-2006', '+1 555-100-2007', '+1 555-100-2008',
]

const CLIENT_TAX_IDS = [
  'EIN-55-5000001', 'EIN-55-5000002', 'GB-VAT-555100200', 'DE-USt-555200300',
  'FR-TVA-555300400', 'JP-TAX-555400500', 'IN-GST-55BBBCS5551B1Z5', 'AU-ABN-55560012300',
  'BR-CNPJ-55.510.012/0001-01', null, null, null, null, null, null,
]

// ─── Invoice Generation Logic ─────────────────────────────────────────────────

interface InvoiceSpec {
  userEmail: string
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  daysAgoCreated: number
  dueDaysAfterCreated: number
  itemCount: [number, number]
  taxRate?: number
  taxLabel?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  notes?: string
}

function generateInvoiceSpecs(): InvoiceSpec[] {
  const specs: InvoiceSpec[] = []
  const freelancers = USERS.filter(u => u.role === 'user')

  const NOTES_POOL = [
    'Payment is due within 30 days of invoice date. Thank you for your business!',
    'Please remit payment via bank transfer or credit card. Late payments subject to 1.5% monthly interest.',
    'Thank you for choosing our services. We look forward to working with you again.',
    'Net 30. Please reference the invoice number in your payment.',
    'All amounts are in the invoiced currency. Wire transfer details available upon request.',
    'This invoice is subject to our standard terms and conditions as outlined in our service agreement.',
    'Early payment discount: 2% off if paid within 10 days.',
    'Please note: work not covered under this invoice will be billed separately.',
    '',
    '',
    '',
  ]

  for (const user of freelancers) {
    const invoiceCount = randomBetween(8, 12)

    for (let i = 0; i < invoiceCount; i++) {
      const statusWeights = [
        { status: 'paid' as const, weight: 30 },
        { status: 'draft' as const, weight: 20 },
        { status: 'sent' as const, weight: 15 },
        { status: 'overdue' as const, weight: 12 },
        { status: 'viewed' as const, weight: 10 },
        { status: 'cancelled' as const, weight: 8 },
        { status: 'refunded' as const, weight: 5 },
      ]

      const totalWeight = statusWeights.reduce((s, w) => s + w.weight, 0)
      let roll = randomBetween(1, totalWeight)
      let status: InvoiceSpec['status'] = 'draft'
      for (const sw of statusWeights) {
        roll -= sw.weight
        if (roll <= 0) { status = sw.status; break }
      }

      const daysAgoCreated = randomBetween(5, 180)
      const dueDaysAfterCreated = status === 'overdue' ? randomBetween(10, 30) : randomBetween(15, 45)

      const hasTax = Math.random() < 0.5
      const hasDiscount = Math.random() < 0.25

      specs.push({
        userEmail: user.email,
        status,
        daysAgoCreated,
        dueDaysAfterCreated,
        itemCount: [randomBetween(2, 5), randomBetween(3, 8)],
        taxRate: hasTax ? pickRandom([5, 7.5, 8.25, 10, 13, 15, 18, 20, 21]) : undefined,
        taxLabel: hasTax ? pickRandom(['GST', 'VAT', 'Sales Tax', 'HST', 'Service Tax', 'IVA']) : undefined,
        discountType: hasDiscount ? pickRandom(['percentage', 'fixed']) : undefined,
        discountValue: hasDiscount
          ? (Math.random() < 0.5 ? pickRandom([5, 10, 15, 20]) : pickRandom([50, 100, 200, 500]))
          : undefined,
        notes: pickRandom(NOTES_POOL),
      })
    }
  }

  return specs
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Starting seed...\n')

  const payload = await getPayload({ config })

  // ── Step 1: Clean existing data ─────────────────────────────────────────
  console.log('  Cleaning existing data...')

  const collections = ['audit-logs', 'payments', 'invoices', 'users'] as const
  for (const slug of collections) {
    const { docs } = await payload.find({
      collection: slug,
      limit: 1000,
      overrideAccess: true,
    })

    for (const doc of docs) {
      await payload.delete({
        collection: slug,
        id: doc.id,
        overrideAccess: true,
        context: { seed: true },
      })
    }
    console.log(`    ✓ Cleared ${docs.length} ${slug}`)
  }

  // ── Step 2: Create Users ────────────────────────────────────────────────
  console.log('\n  Creating users...')

  const userMap = new Map<string, number>()

  for (const userData of USERS) {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        businessName: userData.businessName,
        taxId: userData.taxId,
        company: userData.company,
        address: userData.address,
        _verified: true,
      },
      overrideAccess: true,
      context: { seed: true },
    })

    userMap.set(userData.email, user.id)
    console.log(`    ✓ ${userData.firstName} ${userData.lastName} (${userData.role}) — ID ${user.id}`)
  }

  // Log user login audit events
  for (const userData of USERS) {
    const userId = userMap.get(userData.email)!
    const loginCount = randomBetween(3, 8)
    for (let l = 0; l < loginCount; l++) {
      await payload.create({
        collection: 'audit-logs',
        data: {
          action: 'user.login',
          entity: 'user',
          entityId: String(userId),
          user: userId,
          ipAddress: pickRandom(DOC_IPS),
          userAgent: pickRandom(USER_AGENTS),
        },
        overrideAccess: true,
        context: { seed: true },
      })
    }
  }
  console.log(`    ✓ Created login audit events`)

  // ── Step 3: Create Invoices ─────────────────────────────────────────────
  console.log('\n  Creating invoices...')

  const invoiceSpecs = generateInvoiceSpecs()
  const invoicesByUser = new Map<string, Array<{ id: number; spec: InvoiceSpec; total: number; currency: string }>>()

  let invoiceCounter = 0
  let clientIndex = 0
  const year = new Date().getFullYear()

  // Group specs by user to generate sequential invoice numbers
  const specsByUser = new Map<string, InvoiceSpec[]>()
  for (const spec of invoiceSpecs) {
    const arr = specsByUser.get(spec.userEmail) || []
    arr.push(spec)
    specsByUser.set(spec.userEmail, arr)
  }

  for (const [userEmail, specs] of specsByUser) {
    const userId = userMap.get(userEmail)!
    const currency = USER_CURRENCY[userEmail] || 'USD'
    const templates = LINE_ITEMS_BY_USER[userEmail] || LINE_ITEMS_BY_USER['sarah.chen@example.com']!

    let userInvNum = 0

    for (const spec of specs) {
      userInvNum++
      const invoiceNumber = `INV-${year}-${String(userInvNum).padStart(4, '0')}`

      // Pick a client
      const client = CLIENT_NAMES[clientIndex % CLIENT_NAMES.length]!
      clientIndex++

      // Generate line items
      const numItems = randomBetween(spec.itemCount[0], spec.itemCount[1])
      const usedTemplates = new Set<number>()
      const lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }> = []

      for (let li = 0; li < numItems; li++) {
        let templateIdx: number
        do {
          templateIdx = randomBetween(0, templates.length - 1)
        } while (usedTemplates.has(templateIdx) && usedTemplates.size < templates.length)
        usedTemplates.add(templateIdx)

        const tmpl = templates[templateIdx]!
        const qty = randomBetween(tmpl.qtyRange[0], tmpl.qtyRange[1])
        const price = round2(randomBetween(tmpl.priceRange[0], tmpl.priceRange[1]))
        lineItems.push({
          description: tmpl.description,
          quantity: qty,
          unitPrice: price,
          amount: round2(qty * price),
        })
      }

      // Calculate totals
      const subtotal = round2(lineItems.reduce((s, item) => s + item.amount, 0))

      let discountAmount = 0
      if (spec.discountType && spec.discountValue) {
        discountAmount = spec.discountType === 'percentage'
          ? round2(subtotal * spec.discountValue / 100)
          : round2(Math.min(spec.discountValue, subtotal))
      }

      const taxableAmount = subtotal - discountAmount
      const taxAmount = spec.taxRate ? round2(taxableAmount * spec.taxRate / 100) : 0
      const total = round2(subtotal - discountAmount + taxAmount)

      const createdAt = daysAgo(spec.daysAgoCreated)
      const issueDate = createdAt
      const dueDate = daysAgo(spec.daysAgoCreated - spec.dueDaysAfterCreated)

      const willBePaid = spec.status === 'paid' || spec.status === 'refunded'
      const gateway = willBePaid ? pickRandom(['stripe', 'paypal'] as const) : undefined

      const invoice = await payload.create({
        collection: 'invoices',
        data: {
          client: {
            name: client.name,
            email: client.email,
            phone: CLIENT_PHONES[clientIndex % CLIENT_PHONES.length],
            address: CLIENT_ADDRESSES[clientIndex % CLIENT_ADDRESSES.length],
            taxId: CLIENT_TAX_IDS[clientIndex % CLIENT_TAX_IDS.length] ?? undefined,
          },
          lineItems,
          currency,
          issueDate,
          dueDate,
          notes: spec.notes || undefined,
          subtotal,
          taxRate: spec.taxRate,
          taxLabel: spec.taxLabel,
          taxAmount: taxAmount || undefined,
          discountType: spec.discountType,
          discountValue: spec.discountValue,
          discountAmount: discountAmount || undefined,
          total,
          status: spec.status,
          invoiceNumber,
          paymentLink: fakePaymentLink(),
          owner: userId,
          ...(willBePaid && {
            paidAt: daysAgo(spec.daysAgoCreated - randomBetween(1, spec.dueDaysAfterCreated - 1)),
            paidVia: gateway,
            ...(gateway === 'stripe' && { stripePaymentIntentId: fakeStripeId() }),
            ...(gateway === 'paypal' && { paypalOrderId: fakePaypalId() }),
          }),
        },
        overrideAccess: true,
        context: { seed: true },
      })

      // Track for payment creation
      const userInvoices = invoicesByUser.get(userEmail) || []
      userInvoices.push({ id: invoice.id, spec, total, currency })
      invoicesByUser.set(userEmail, userInvoices)

      invoiceCounter++

      // Audit events for status transitions (invoice.created is logged by the hook)
      if (['sent', 'viewed', 'paid', 'overdue', 'refunded'].includes(spec.status)) {
        await payload.create({
          collection: 'audit-logs',
          data: {
            action: 'invoice.sent',
            entity: 'invoice',
            entityId: String(invoice.id),
            user: userId,
            ipAddress: pickRandom(DOC_IPS),
            userAgent: pickRandom(USER_AGENTS),
            previousData: { status: 'draft' },
            newData: { status: 'sent' },
          },
          overrideAccess: true,
        })
      }

      if (spec.status === 'cancelled') {
        await payload.create({
          collection: 'audit-logs',
          data: {
            action: 'invoice.cancelled',
            entity: 'invoice',
            entityId: String(invoice.id),
            user: userId,
            ipAddress: pickRandom(DOC_IPS),
            userAgent: pickRandom(USER_AGENTS),
            previousData: { status: 'draft' },
            newData: { status: 'cancelled' },
          },
          overrideAccess: true,
        })
      }

      // invoice.paid audit events are created by the payment hook (syncInvoiceStatus)
    }
  }

  console.log(`    ✓ Created ${invoiceCounter} invoices with audit logs`)

  // ── Step 4: Create Payments ─────────────────────────────────────────────
  console.log('\n  Creating payments...')

  let paymentCounter = 0
  let failedPaymentCounter = 0

  for (const [userEmail, invoices] of invoicesByUser) {
    for (const inv of invoices) {
      const isPaid = inv.spec.status === 'paid' || inv.spec.status === 'refunded'
      if (!isPaid) continue

      const gateway = pickRandom(['stripe', 'paypal'] as const)
      const processedAt = daysAgo(inv.spec.daysAgoCreated - randomBetween(1, inv.spec.dueDaysAfterCreated - 1))

      // Sometimes create a failed attempt first (hook logs audit event automatically)
      if (Math.random() < 0.2) {
        await payload.create({
          collection: 'payments',
          data: {
            invoice: inv.id,
            gateway,
            amount: inv.total,
            currency: inv.currency,
            status: 'failed',
            gatewayTransactionId: gateway === 'stripe' ? fakeStripeId() : fakePaypalId(),
            payerEmail: CLIENT_NAMES[paymentCounter % CLIENT_NAMES.length]!.email,
            payerName: CLIENT_NAMES[paymentCounter % CLIENT_NAMES.length]!.name,
            idempotencyKey: fakeIdempotencyKey(),
            processedAt: daysAgo(inv.spec.daysAgoCreated - 1),
            metadata: {
              error: 'card_declined',
              decline_code: 'insufficient_funds',
              message: 'Your card has insufficient funds.',
            },
          },
          overrideAccess: true,
          context: { seed: true },
        })

        failedPaymentCounter++
      }

      // Successful payment — creates as 'succeeded', hook transitions invoice to 'paid'
      const gatewayTxnId = gateway === 'stripe' ? fakeStripeId() : fakePaypalId()
      const payerClient = CLIENT_NAMES[paymentCounter % CLIENT_NAMES.length]!
      const stripeMetadata = {
        payment_method: pickRandom(['pm_card_visa', 'pm_card_mastercard', 'pm_card_amex']),
        receipt_url: `https://pay.stripe.test/receipts/${randomBetween(1000000, 9999999)}`,
        risk_score: randomBetween(0, 30),
        risk_level: 'normal',
      }
      const paypalMetadata = {
        payer_id: `PAYPAL-PAYER-${randomBetween(10000000, 99999999)}`,
        payment_source: 'paypal',
        shipping_preference: 'NO_SHIPPING',
        intent: 'CAPTURE',
      }

      const payment = await payload.create({
        collection: 'payments',
        data: {
          invoice: inv.id,
          gateway,
          amount: inv.total,
          currency: inv.currency,
          status: 'succeeded',
          gatewayTransactionId: gatewayTxnId,
          payerEmail: payerClient.email,
          payerName: payerClient.name,
          idempotencyKey: fakeIdempotencyKey(),
          processedAt,
          metadata: gateway === 'stripe' ? stripeMetadata : paypalMetadata,
        },
        overrideAccess: true,
        context: { seed: true },
      })

      if (inv.spec.status === 'refunded') {
        await payload.update({
          collection: 'payments',
          id: payment.id,
          data: {
            status: 'refunded',
            refundedAt: daysAgo(randomBetween(1, Math.max(1, inv.spec.daysAgoCreated - 5))),
            refundAmount: inv.total,
          },
          overrideAccess: true,
          context: { seed: true },
        })
      }

      paymentCounter++
    }
  }

  console.log(`    ✓ Created ${paymentCounter} successful payments + ${failedPaymentCounter} failed attempts`)

  // ── Step 5: Summary ─────────────────────────────────────────────────────
  const auditCount = await payload.count({ collection: 'audit-logs', overrideAccess: true })

  console.log('\n────────────────────────────────────────')
  console.log('  Seed complete!')
  console.log(`    Users:      ${USERS.length}`)
  console.log(`    Invoices:   ${invoiceCounter}`)
  console.log(`    Payments:   ${paymentCounter + failedPaymentCounter}`)
  console.log(`    Audit Logs: ${auditCount.totalDocs}`)
  console.log('────────────────────────────────────────\n')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
