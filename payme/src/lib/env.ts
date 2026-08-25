import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string'),

  // PayloadCMS
  PAYLOAD_SECRET: z
    .string()
    .min(32, 'PAYLOAD_SECRET must be at least 32 characters for security'),

  // Stripe (optional until Feature 07)
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'Must start with sk_')
    .optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'Must start with pk_')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'Must start with whsec_')
    .optional(),

  // PayPal (optional until Feature 08)
  PAYPAL_CLIENT_ID: z.string().min(1).optional(),
  PAYPAL_CLIENT_SECRET: z.string().min(1).optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),

  // Resend (optional until Feature 10)
  RESEND_API_KEY: z
    .string()
    .startsWith('re_', 'Must start with re_')
    .optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Invalid environment variables:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('Invalid environment variables. See above for details.')
  }

  return parsed.data
}

export const env = validateEnv()

export type Env = z.infer<typeof envSchema>
