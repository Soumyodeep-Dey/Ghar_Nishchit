import { z } from 'zod';

export const sendContractSchema = z.object({
  body: z.object({
    tenantId: z.string({
      required_error: 'tenantId is required'
    }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Seeker/Tenant ID format'),
    
    contractType: z.string().optional().default('residential'),
    
    duration: z.coerce.number({
      required_error: 'duration is required'
    }).int().min(1, 'Duration must be at least 1 month'),
    
    rentAmount: z.coerce.number({
      required_error: 'rentAmount is required'
    }).positive('Rent amount must be a positive number'),
    
    securityDeposit: z.coerce.number({
      required_error: 'securityDeposit is required'
    }).nonnegative('Security deposit cannot be negative'),
    
    startDate: z.string({
      required_error: 'startDate is required'
    }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date format'
    }),
    
    property: z.string({
      required_error: 'property title or ID is required'
    }).min(1, 'Property cannot be empty'),

    terms: z.object({
      petsAllowed: z.boolean().optional().default(false),
      smokingAllowed: z.boolean().optional().default(false),
      sublettingAllowed: z.boolean().optional().default(false),
      earlyTermination: z.boolean().optional().default(false)
    }).optional(),

    customClauses: z.string().optional()
  })
});
