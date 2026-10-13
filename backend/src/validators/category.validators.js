import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    slug: z.string().trim().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    description: z.string().trim().optional().default(''),
    iconName: z.string().trim().optional().default('Sparkles'),
    color: z.string().trim().optional().default('#7540C4'),
    badgeText: z.string().trim().optional().default(''),
    coverImageUrl: z.string().url().optional().nullable().default('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'),
    isActive: z.coerce.boolean().default(true)
  })
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    slug: z.string().trim().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().trim().optional(),
    iconName: z.string().trim().optional(),
    color: z.string().trim().optional(),
    badgeText: z.string().trim().optional(),
    coverImageUrl: z.string().url().optional().nullable(),
    isActive: z.coerce.boolean().optional()
  })
});

export const registerForEventSchema = z.object({
  body: z.object({
    ticketType: z.string().trim().optional().default('General Admission')
  })
});
